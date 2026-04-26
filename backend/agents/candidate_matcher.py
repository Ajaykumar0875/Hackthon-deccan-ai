"""Candidate Matching Agent — scores all candidates in ONE batched Groq call."""
import json
import logging
import asyncio
from groq import Groq
from models.schemas import ParsedJD, CandidateScore
from utils.embeddings import compute_skill_overlap, compute_experience_score
from data.candidates import get_all_candidates
from config import get_settings

logger = logging.getLogger(__name__)

MODEL = "llama-3.1-8b-instant"

# ── Experience level string → (years, level label) ────────────────────────────
_EXP_MAP = {
    "fresher":           (0,  "Junior"),
    "junior (1-2 yrs)":  (1,  "Junior"),
    "mid (3-5 yrs)":     (3,  "Mid"),
    "senior (6-9 yrs)":  (6,  "Senior"),
    "lead (10+ yrs)":    (10, "Lead"),
}

async def _get_candidates_from_db() -> list[dict]:
    """Fetch candidate profiles from MongoDB and map to matcher format."""
    try:
        from database.connection import get_db
        db   = get_db()
        docs = await db["candidates"].find(
            {}, {"_id": 0, "resume_base64": 0}
        ).to_list(length=500)

        if not docs:
            return []

        mapped = []
        for i, d in enumerate(docs, 1):
            exp_raw = (d.get("experience_level") or "junior (1-2 yrs)").lower().strip()
            exp_years, exp_label = _EXP_MAP.get(exp_raw, (1, "Junior"))

            title = (d.get("target_role") or
                     (d.get("preferred_roles") or [""])[0] or "Professional")

            mapped.append({
                "id":                  d.get("email", f"DB{i:03d}"),
                "name":                d.get("name", "Unknown"),
                "title":               title,
                "location":            d.get("location", "India"),
                "experience_years":    exp_years,
                "experience_level":    exp_label,
                "skills":              d.get("skills", []),
                "summary":             d.get("summary", ""),
                "education":           "",
                "previous_companies":  [],
                "achievements":        [],
                "expected_salary_inr": 0,
                "open_to_remote":      True,
                "email":               d.get("email", ""),
            })
        logger.info(f"Loaded {len(mapped)} candidates from MongoDB")
        return mapped
    except Exception as exc:
        logger.warning(f"DB candidate fetch failed, using static data: {exc}")
        return []



def _get_client() -> Groq:
    settings = get_settings()
    return Groq(api_key=settings.groq_api_key)


BATCH_ROLE_FIT_PROMPT = """You are an expert technical recruiter. Evaluate how well each candidate fits this job role.

JOB REQUIREMENTS:
Role: {role_title}
Required Skills: {required_skills}
Experience Required: {required_years}+ years ({level})
Key Requirements: {key_requirements}
Industry: {industry}

CANDIDATES TO EVALUATE:
{candidates_block}

Return a JSON object with a single key "results" containing an array — one object per candidate in the SAME ORDER:
{{
  "results": [
    {{
      "candidate_id": "C001",
      "role_fit_score": <integer 0-100>,
      "explanation": "<2-3 sentences — specific strengths and gaps>"
    }}
  ]
}}

Be accurate. Missing key required skills should lower the score significantly."""


def _build_candidates_block(candidates: list[dict]) -> str:
    lines = []
    for i, c in enumerate(candidates, 1):
        lines.append(
            f"{i}. ID:{c['id']} | {c['name']} | {c['title']} | "
            f"{c['experience_years']}yrs | Skills: {', '.join(c['skills'][:8])} | "
            f"{c['summary'][:120]}"
        )
    return "\n".join(lines)


async def _batch_role_fit(candidates: list[dict], jd: ParsedJD) -> dict[str, dict]:
    """ONE Groq call to evaluate ALL candidates. Returns dict keyed by candidate_id."""
    client = _get_client()
    prompt = BATCH_ROLE_FIT_PROMPT.format(
        role_title=jd.role_title,
        required_skills=", ".join(jd.required_skills),
        required_years=jd.required_experience_years,
        level=jd.experience_level.value,
        key_requirements=jd.key_requirements_summary,
        industry=jd.industry,
        candidates_block=_build_candidates_block(candidates),
    )

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert technical recruiter. Always respond with valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            ),
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        results_list = data.get("results", [])

        return {
            r["candidate_id"]: {
                "role_fit_score": float(r.get("role_fit_score", 50)),
                "explanation": r.get("explanation", ""),
            }
            for r in results_list
        }
    except Exception as e:
        logger.error(f"Batch role fit failed: {e}")
        return {
            c["id"]: {
                "role_fit_score": 55.0,
                "explanation": "Evaluated based on skill match only.",
            }
            for c in candidates
        }


async def match_candidates(jd: ParsedJD, top_n: int = 5) -> list[CandidateScore]:
    """
    Full matching pipeline — 1 Groq API call total:
    1. Fast local skill + experience scoring (zero API calls)
    2. ONE batched Groq call for role fit of top 10
    3. Combine and return top_n
    """
    # ── Fetch candidates: DB first, fall back to static file ─────────────────
    db_candidates = await _get_candidates_from_db()
    if len(db_candidates) >= 3:
        candidates = db_candidates
        logger.info(f"Using {len(candidates)} candidates from MongoDB")
    else:
        candidates = get_all_candidates()
        logger.info(f"DB has <3 profiles — using {len(candidates)} static candidates")


    # Step 1: Fast local scoring — zero API calls
    scored = []
    for c in candidates:
        skill_result = compute_skill_overlap(
            c["skills"], jd.required_skills, jd.preferred_skills
        )
        exp_score = compute_experience_score(
            c["experience_years"], jd.required_experience_years
        )
        pre_score = skill_result["score"] * 0.6 + exp_score * 0.4
        scored.append({
            "candidate": c,
            "skill_score": skill_result["score"],
            "exp_score": exp_score,
            "pre_score": pre_score,
            "matched_skills": skill_result["matched_skills"],
            "missing_skills": skill_result["missing_skills"],
        })

    # Pre-filter: top 10 by fast score
    scored.sort(key=lambda x: x["pre_score"], reverse=True)
    top_for_llm = scored[:min(10, len(scored))]

    # Step 2: ONE batched Groq call
    logger.info(f"Sending 1 batched Groq call for {len(top_for_llm)} candidates...")
    role_fit_map = await _batch_role_fit(
        [item["candidate"] for item in top_for_llm], jd
    )

    # Step 3: Combine scores
    final_scored = []
    for item in top_for_llm:
        c = item["candidate"]
        skill_s = item["skill_score"]
        exp_s = item["exp_score"]
        role_data = role_fit_map.get(
            c["id"], {"role_fit_score": 55.0, "explanation": ""}
        )
        role_s = role_data["role_fit_score"]
        # True weighted score: Skill 50% + Experience 30% + AI Role Fit 20%
        match_score = round(min(100.0, skill_s * 0.50 + exp_s * 0.30 + role_s * 0.20), 1)

        final_scored.append({
            "candidate": c,
            "skill_match_score": skill_s,
            "experience_match_score": exp_s,
            "role_fit_score": role_s,
            "match_score": match_score,
            "matched_skills": item["matched_skills"],
            "missing_skills": item["missing_skills"],
            "match_explanation": role_data["explanation"],
        })

    final_scored.sort(key=lambda x: x["match_score"], reverse=True)
    top_candidates = final_scored[:top_n]

    results = []
    for rank, item in enumerate(top_candidates, start=1):
        c = item["candidate"]
        results.append(
            CandidateScore(
                candidate_id=c["id"],
                candidate_name=c["name"],
                candidate_title=c["title"],
                candidate_location=c["location"],
                candidate_skills=c["skills"],
                skill_match_score=item["skill_match_score"],
                experience_match_score=item["experience_match_score"],
                role_fit_score=item["role_fit_score"],
                match_score=item["match_score"],
                interest_score=0.0,
                combined_score=0.0,
                match_explanation=item["match_explanation"],
                matched_skills=item["matched_skills"],
                missing_skills=item["missing_skills"],
                conversation_summary="",
                rank=rank,
            )
        )

    logger.info(f"Matched {len(results)} candidates using 1 Groq call")
    return results
