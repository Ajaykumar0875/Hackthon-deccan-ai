"""Interview router — AI chatbot interview + analysis email to admin."""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from config import get_settings

router = APIRouter(prefix="/api/interview", tags=["Interview"])
logger = logging.getLogger(__name__)

GROQ_MODEL = "llama-3.1-8b-instant"


# ── Models ────────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    email: str
    role: str
    messages: List[ChatMessage]   # full history so far
    question_number: int          # 1-10

class ChatResponse(BaseModel):
    reply: str
    done: bool                    # True when 10 questions answered
    question_number: int

class AnalyzeRequest(BaseModel):
    candidate_email: str
    candidate_name: str
    role: str
    match_score: float
    qa_pairs: List[dict]          # [{q, a}] — all 10 Q&A

class AnalyzeResponse(BaseModel):
    interest_score: float
    summary: str
    email_sent: bool


# ── System prompt builder ──────────────────────────────────────────────────────
def _build_system_prompt(role: str, q_num: int) -> str:
    return f"""You are a professional HR interviewer at KizunaHire conducting a structured job interview for the role of **{role}**.

You are on question {q_num} of 10. Follow this structure STRICTLY:

Q1 — Warm-up: "Tell me about yourself and your background relevant to {role}."
Q2 — Career Path: "How does this position align with your long-term career goals?"
Q3 — Technical Core 1: Ask a specific, challenging technical question about the PRIMARY tech stack of {role}.
Q4 — Technical Core 2: Ask about a common, difficult real-world problem or architecture constraint in {role}.
Q5 — Adaptability: "Tell me about a time you had to learn a new tool/framework quickly to solve a problem."
Q6 — Team/Process: "How do you handle disagreements on technical approach within your team?"
Q7 — Work Environment: "What kind of work environment allows you to be most productive?"
Q8 — Value Add: "What is one unique skill or perspective you bring to this {role} team?"
Q9 — Availability/Interest: "What is your timeline for your next move, and how does this role fit that?"
Q10 — Closing: "What questions do you have for me about the role, team, or company?"

Rules:
- Ask exactly ONE question per message — SHORT (2-3 sentences max)
- Do NOT give feedback or praise on answers — just ask the next question
- Sound like a professional interviewer — be focused and engaging
- Return ONLY the question text — no extra commentary, no closing remarks"""


# ── Chat endpoint ─────────────────────────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def interview_chat(req: ChatRequest):
    """Returns next AI interview question based on conversation history."""
    try:
        from groq import Groq
        settings = get_settings()
        client = Groq(api_key=settings.groq_api_key)

        is_done = req.question_number > 10

        system = _build_system_prompt(req.role, req.question_number)
        messages = [{"role": "system", "content": system}]
        for m in req.messages:
            messages.append({"role": m.role, "content": m.content})

        # Ask for the next question
        messages.append({
            "role": "user",
            "content": f"Ask interview question number {req.question_number} now."
            if req.question_number <= 10 else "The interview is complete."
        })

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.6,
            max_tokens=200,
        )
        reply = response.choices[0].message.content.strip()

        return ChatResponse(
            reply=reply,
            done=req.question_number > 10,
            question_number=req.question_number,
        )

    except Exception as e:
        logger.error(f"Interview chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Analyze + email admin ─────────────────────────────────────────────────────
ANALYZE_PROMPT = """You are an expert HR evaluator. Analyze this candidate's interview responses.

Role: {role}
Candidate: {name} ({email})
Pre-screening Match Score: {match_score}/100

Interview Q&A:
{qa_text}

Evaluate the candidate on:
1. Technical knowledge relevant to {role}
2. Communication clarity
3. Enthusiasm and interest
4. Problem-solving approach
5. Cultural fit signals

Return a JSON object:
{{
  "interest_score": <integer 0-100, how interested/engaged they seemed>,
  "technical_score": <integer 0-100>,
  "summary": "<3-4 sentences summarizing performance, strengths, and concerns>",
  "recommendation": "Strong Yes | Yes | Maybe | No",
  "key_strengths": ["strength1", "strength2"],
  "concerns": ["concern1"]
}}"""


def _build_admin_email(name: str, role: str, email: str,
                       match_score: float, interest_score: float,
                       technical_score: float, summary: str,
                       recommendation: str, strengths: list, concerns: list) -> str:
    rec_color = {"Strong Yes": "#16a34a", "Yes": "#22c55e",
                 "Maybe": "#f59e0b", "No": "#ef4444"}.get(recommendation, "#6b7280")
    strengths_html = "".join(f"<li>{s}</li>" for s in strengths)
    concerns_html  = "".join(f"<li>{c}</li>" for c in concerns) or "<li>None noted</li>"

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  body{{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}}
  .wrap{{max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}}
  .hdr{{background:#000;padding:28px 32px;text-align:center}}
  .hdr h1{{color:#4ade80;margin:0;font-size:22px}}
  .hdr p{{color:#71717a;margin:6px 0 0;font-size:13px}}
  .body{{padding:28px 32px}}
  .rec{{display:inline-block;padding:6px 18px;border-radius:999px;font-weight:700;font-size:14px;color:#fff;background:{rec_color};margin-bottom:20px}}
  .score-row{{display:flex;gap:12px;margin:16px 0}}
  .score-box{{flex:1;background:#f8f8f8;border-radius:8px;padding:14px;text-align:center}}
  .score-val{{font-size:28px;font-weight:800;color:#16a34a}}
  .score-lbl{{font-size:11px;color:#888;margin-top:2px}}
  .summary{{background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:14px 16px;font-size:13px;color:#374151;line-height:1.7;margin:16px 0}}
  h3{{font-size:13px;color:#111;margin:20px 0 8px}}
  ul{{margin:0;padding-left:18px;font-size:13px;color:#555;line-height:1.8}}
  .footer{{border-top:1px solid #eee;padding:16px 32px;font-size:11px;color:#aaa;text-align:center}}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>🤖 AI Interview Result</h1>
    <p>KizunaHire — Automated Interview Analysis</p>
  </div>
  <div class="body">
    <p style="font-size:14px;color:#374151"><strong>{name}</strong> ({email}) completed the AI interview for <strong>{role}</strong>.</p>
    <span class="rec">Recommendation: {recommendation}</span>
    <div class="score-row">
      <div class="score-box"><div class="score-val">{match_score:.0f}</div><div class="score-lbl">Match Score</div></div>
      <div class="score-box"><div class="score-val">{interest_score:.0f}</div><div class="score-lbl">Interest Score</div></div>
      <div class="score-box"><div class="score-val">{technical_score:.0f}</div><div class="score-lbl">Technical Score</div></div>
    </div>
    <div class="summary">{summary}</div>
    <h3>✅ Key Strengths</h3>
    <ul>{strengths_html}</ul>
    <h3>⚠️ Concerns</h3>
    <ul>{concerns_html}</ul>
  </div>
  <div class="footer">KizunaHire · Automated Interview System · Review candidate in your dashboard</div>
</div>
</body></html>"""


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_interview(req: AnalyzeRequest):
    """Analyze interview answers with Groq, save to DB, then email results to admin."""
    try:
        from groq import Groq
        import json
        from datetime import datetime
        settings = get_settings()
        client = Groq(api_key=settings.groq_api_key)

        qa_text = "\n".join(
            f"Q{i+1}: {pair['q']}\nA{i+1}: {pair['a']}"
            for i, pair in enumerate(req.qa_pairs)
        )

        prompt = ANALYZE_PROMPT.format(
            role=req.role, name=req.candidate_name,
            email=req.candidate_email, match_score=req.match_score,
            qa_text=qa_text,
        )

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert HR evaluator. Always respond with valid JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=600,
        )
        raw  = response.choices[0].message.content.strip()
        data = json.loads(raw)

        interest_score  = float(data.get("interest_score", 60))
        technical_score = float(data.get("technical_score", 60))
        summary         = data.get("summary", "")
        recommendation  = data.get("recommendation", "Maybe")
        strengths       = data.get("key_strengths", [])
        concerns        = data.get("concerns", [])

        # ── Save to MongoDB interviews collection ─────────────────────────────
        try:
            from database.connection import get_db
            db = get_db()
            doc = {
                "candidate_email":  req.candidate_email,
                "candidate_name":   req.candidate_name,
                "role":             req.role,
                "match_score":      req.match_score,
                "interest_score":   interest_score,
                "technical_score":  technical_score,
                "summary":          summary,
                "recommendation":   recommendation,
                "key_strengths":    strengths,
                "concerns":         concerns,
                "status":           "pending",   # pending | approved | declined
                "completed_at":     datetime.utcnow().isoformat(),
            }
            # Upsert — re-interview replaces old result
            await db["interviews"].update_one(
                {"candidate_email": req.candidate_email},
                {"$set": doc},
                upsert=True,
            )
            logger.info(f"✅ Interview result saved to DB for {req.candidate_name}")
        except Exception as db_err:
            logger.error(f"DB save failed: {db_err}")

        # ── Email admin ───────────────────────────────────────────────────────
        email_sent = False
        if settings.sender_email and settings.sender_app_password:
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText

            admin_email = settings.admin_email
            html = _build_admin_email(
                req.candidate_name, req.role, req.candidate_email,
                req.match_score, interest_score, technical_score,
                summary, recommendation, strengths, concerns
            )
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"🤖 Interview Result: {req.candidate_name} for {req.role}"
                msg["From"]    = f"KizunaHire <{settings.sender_email}>"
                msg["To"]      = admin_email
                msg.attach(MIMEText(html, "html"))
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
                    s.login(settings.sender_email, settings.sender_app_password)
                    s.sendmail(settings.sender_email, admin_email, msg.as_string())
                logger.info(f"✅ Interview result emailed to admin for {req.candidate_name}")
                email_sent = True
            except Exception as mail_err:
                logger.error(f"Admin email failed: {mail_err}")

        return AnalyzeResponse(
            interest_score=interest_score,
            summary=summary,
            email_sent=email_sent,
        )

    except Exception as e:
        logger.error(f"Interview analyze error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── GET all interview results (admin only) ────────────────────────────────────
@router.get("/results")
async def get_interview_results():
    """Return all completed interview results from DB, newest first."""
    try:
        from database.connection import get_db
        db   = get_db()
        docs = await db["interviews"].find(
            {}, {"_id": 0}
        ).sort("completed_at", -1).to_list(length=500)
        return {"results": docs, "total": len(docs)}
    except Exception as e:
        logger.error(f"Get results error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST approve or decline a candidate ──────────────────────────────────────
class DecisionRequest(BaseModel):
    candidate_email: str
    decision: str   # "approved" | "declined"


def _build_congrats_email(name: str, role: str) -> str:
    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  body{{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}}
  .wrap{{max-width:600px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)}}
  .hdr{{background:#000;padding:36px 32px;text-align:center}}
  .hdr h1{{color:#4ade80;margin:0;font-size:26px;font-weight:800}}
  .hdr p{{color:#52525b;margin:8px 0 0;font-size:13px}}
  .body{{padding:32px}}
  .emoji{{font-size:52px;text-align:center;display:block;margin-bottom:20px}}
  h2{{color:#111;font-size:20px;margin:0 0 12px}}
  p{{color:#555;font-size:14px;line-height:1.8;margin:0 0 14px}}
  .box{{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 20px;margin:20px 0}}
  .box p{{margin:4px 0;font-size:13px;color:#166534}}
  .cta{{display:block;width:fit-content;margin:24px auto;background:#16a34a;color:#fff!important;
        text-decoration:none;padding:13px 36px;border-radius:999px;font-weight:700;font-size:15px}}
  .footer{{border-top:1px solid #eee;padding:16px 32px;text-align:center;font-size:11px;color:#aaa}}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>🎉 Congratulations!</h1>
    <p>KizunaHire — Smart Hiring Platform</p>
  </div>
  <div class="body">
    <span class="emoji">🚀</span>
    <h2>Hi {name},</h2>
    <p>We're thrilled to inform you that after reviewing your AI interview performance, you have been <strong style="color:#16a34a">approved</strong> for the <strong>{role}</strong> position!</p>
    <div class="box">
      <p>✅ <strong>Status:</strong> Approved</p>
      <p>💼 <strong>Role:</strong> {role}</p>
      <p>📧 <strong>Next Step:</strong> Our team will reach out to you shortly with further details.</p>
    </div>
    <p>Please keep an eye on your inbox. A member of our team will contact you soon to discuss the next steps in the hiring process.</p>
    <p>Once again, congratulations — we're excited about the possibility of having you on board! 🎊</p>
  </div>
  <div class="footer">KizunaHire · Automated Hiring Platform · You're receiving this because you applied for a position.</div>
</div>
</body></html>"""


@router.post("/decision")
async def set_decision(req: DecisionRequest):
    """Admin approves or declines a candidate. On approval, sends a congratulations email."""
    if req.decision not in ("approved", "declined"):
        raise HTTPException(status_code=422, detail="Decision must be 'approved' or 'declined'")
    try:
        from database.connection import get_db
        db = get_db()

        # Fetch the interview record to get candidate name + role
        record = await db["interviews"].find_one(
            {"candidate_email": req.candidate_email}, {"_id": 0}
        )
        if not record:
            raise HTTPException(status_code=404, detail="Interview record not found")

        # Update status in DB
        await db["interviews"].update_one(
            {"candidate_email": req.candidate_email},
            {"$set": {"status": req.decision}},
        )

        # Send congratulations email if approved
        if req.decision == "approved":
            try:
                from config import get_settings
                import smtplib
                from email.mime.multipart import MIMEMultipart
                from email.mime.text import MIMEText

                settings   = get_settings()
                cand_name  = record.get("candidate_name", "Candidate")
                cand_role  = record.get("role", "the position")
                html       = _build_congrats_email(cand_name, cand_role)

                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"🎉 Congratulations! You've been approved — {cand_role}"
                msg["From"]    = f"KizunaHire <{settings.sender_email}>"
                msg["To"]      = req.candidate_email
                msg.attach(MIMEText(html, "html"))

                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
                    s.login(settings.sender_email, settings.sender_app_password)
                    s.sendmail(settings.sender_email, req.candidate_email, msg.as_string())

                logger.info(f"✅ Congratulations email sent to {req.candidate_email}")
            except Exception as mail_err:
                logger.error(f"Congrats email failed: {mail_err}")

        return {"message": f"Candidate {req.decision} successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Decision error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
