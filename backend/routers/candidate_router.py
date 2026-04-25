"""Candidate profile router — save, retrieve, and AI-parse resumes."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from database.connection import get_db
from datetime import datetime
import base64, io, json, logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/candidate", tags=["Candidate"])


class CandidateProfileIn(BaseModel):
    email: str
    name: str
    phone: str
    location: str
    linkedin: Optional[str] = ""
    skills: List[str] = []
    experience_level: str           # fresher / junior / mid / senior / lead
    preferred_roles: List[str] = []
    availability: str               # immediate / 1-month / 2-months+
    expected_salary: Optional[str] = ""
    summary: Optional[str] = ""
    target_role: Optional[str] = ""
    resume_filename: Optional[str] = ""
    resume_base64: Optional[str] = ""   # base64 encoded PDF


class CandidateProfileOut(BaseModel):
    exists: bool
    profile: Optional[dict] = None


# ── GET — check if profile exists ───────────────────────────────────────────
@router.get("/profile", response_model=CandidateProfileOut)
async def get_candidate_profile(email: str = Query(...)):
    db      = get_db()
    profile = await db["candidates"].find_one(
        {"email": email.strip().lower()},
        {"_id": 0, "resume_base64": 0}   # exclude heavy blob from response
    )
    if not profile:
        return CandidateProfileOut(exists=False)
    return CandidateProfileOut(exists=True, profile=profile)


# ── POST — create or update profile ─────────────────────────────────────────
@router.post("/profile")
async def save_candidate_profile(body: CandidateProfileIn):
    email = body.email.strip().lower()
    db    = get_db()

    existing = await db["candidates"].find_one({"email": email})
    now      = datetime.utcnow().isoformat()

    doc = {
        "email":            email,
        "name":             body.name.strip(),
        "phone":            body.phone.strip(),
        "location":         body.location.strip(),
        "linkedin":         body.linkedin,
        "skills":           [s.strip() for s in body.skills if s.strip()],
        "experience_level": body.experience_level,
        "preferred_roles":  [r.strip() for r in body.preferred_roles if r.strip()],
        "availability":     body.availability,
        "expected_salary":  body.expected_salary,
        "summary":          body.summary,
        "target_role":      body.target_role,
        "resume_filename":  body.resume_filename,
        "resume_base64":    body.resume_base64,
        "updated_at":       now,
    }

    if existing:
        await db["candidates"].update_one({"email": email}, {"$set": doc})
        return {"message": "Profile updated successfully", "is_new": False}
    else:
        doc["created_at"] = now
        await db["candidates"].insert_one(doc)
        return {"message": "Profile created successfully", "is_new": True}


# ── POST — parse resume with AI ──────────────────────────────────────────────
class ParseResumeRequest(BaseModel):
    resume_base64: str   # base64-encoded PDF bytes


@router.post("/parse-resume")
async def parse_resume(body: ParseResumeRequest):
    """Extract text from a PDF resume and use Groq to parse structured fields."""
    # 1. Decode base64 → bytes → PDF text
    try:
        pdf_bytes = base64.b64decode(body.resume_base64)
        import pdfplumber
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        text = text.strip()
        if not text:
            raise HTTPException(status_code=422, detail="Could not extract text from PDF. Try a text-based PDF (not scanned image).")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise HTTPException(status_code=422, detail=f"PDF parsing failed: {str(e)}")

    # 2. Send to Groq for structured extraction
    try:
        from config import get_settings
        from groq import Groq

        settings = get_settings()
        client   = Groq(api_key=settings.groq_api_key)

        prompt = f"""You are a resume parser. Extract the following fields from the resume text below.
Return ONLY a valid JSON object with exactly these keys (use empty string or empty array if not found):

{{
  "name": "Full name of the candidate",
  "phone": "Phone number",
  "location": "City, Country or just City",
  "linkedin": "LinkedIn URL if present, else empty string",
  "summary": "A 2-3 sentence professional summary from the resume",
  "experience_level": "One of: Fresher, Junior (1-2 yrs), Mid (3-5 yrs), Senior (6-9 yrs), Lead (10+ yrs)",
  "target_role": "Most recent or desired job title",
  "skills": ["skill1", "skill2", ...],
  "preferred_roles": ["role1", "role2"],
  "expected_salary": "If mentioned, else empty string"
}}

Resume text:
{text[:6000]}

Return only the JSON object, no markdown, no explanation."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=800,
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        return {"success": True, "fields": parsed}

    except json.JSONDecodeError as e:
        logger.error(f"Groq JSON parse error: {e} | raw: {raw[:200]}")
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Try again.")
    except Exception as e:
        logger.error(f"Groq parse error: {e}")
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {str(e)}")
