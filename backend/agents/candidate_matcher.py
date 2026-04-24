"""Candidate Matching Agent — scores all candidates in ONE batched Gemini call."""
import json
import logging
import asyncio
import google.generativeai as genai
from models.schemas import ParsedJD, CandidateScore
from utils.embeddings import compute_skill_overlap, compute_experience_score
from data.candidates import get_all_candidates
from config import get_settings

logger = logging.getLogger(__name__)

# ── Retry config ────────────────────────────────────────────────────────────────
MAX_RETRIES = 3
RETRY_DELAYS = [10, 20, 40]  # seconds


def _get_model():
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        model_name="models/gemini-2.5-flash",
        generation_config=genai.GenerationConfig(
            temperature=0.2,
            response_mime_type="application/json",
        ),
    )


# ── Single BATCHED prompt for all top candidates ─────────────────────────────────
BATCH_ROLE_FIT_PROMPT = """You are an expert technical recruiter. Evaluate how well each candidate fits this job role.

JOB REQUIREMENTS:
Role: {role_title}
Required Skills: {required_skills}
Experience Required: {required_years}+ years ({level})
Key Requirements: {key_requirements}
Industry: {industry}

CANDIDATES TO EVALUATE:
{candidates_block}

Return a JSON array — one object per candidate, in the SAME ORDER:
[
  {{
    "candidate_id": "C001",
    "role_fit_score": <integer 0-100>,
    "explanation": "<2-3 sentences explaining fit, specific about strengths and gaps>"
  }},
  ...
]

Be accurate and critical. Missing key required skills should lower the score.
Return ONLY valid JSON array, nothing else."""


def _build_candidates_block(candidates: list[dict]) -> str:
    lines = []
    for i, c in enumerate(candidates, 1):
        lines.append(
            f"{i}. ID:{c['id']} | {c['name']} | {c['title']} | "
            f"{c['experience_years']}yrs | Skills: {', '.join(c['skills'][:8])} | "
            f"Summary: {c['summary'][:120]}"
        )
    return "\n".join(lines)


async def _batch_role_fit(candidates: list[dict], jd: ParsedJD) -> dict[str, dict]:
    """ONE Gemini call to evaluate ALL candidates. Returns dict keyed by candidate_id."""
    model = _get_model()
    prompt = BATCH_ROLE_FIT_PROMPT.format(
        role_title=jd.role_title,
        required_skills=", ".join(jd.required_skills),
        required_years=jd.required_experience_years,
        level=jd.experience_level.value,
        key_requirements=jd.key_requirements_summary,
        industry=jd.industry,
        candidates_block=_build_candidates_block(candidates),
    )

    for attempt, delay in enumerate(RETRY_DELAYS, 1):
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, lambda: model.generate_content(prompt)
            )
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            results_list = json.loads(raw)
            return {
                r["candidate_id"]: {
                    "role_fit_score": float(r.get("role_fit_score", 50)),
                    "explanation": r.get("explanation", ""),
                }
                for r in results_list
            }
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower():
                if attempt < MAX_RETRIES:
                    logger.warning(f"Rate limit hit — retrying in {delay}s (attempt {attempt}/{MAX_RETRIES})")
                    await asyncio.sleep(delay)
                else:
                    logger.error("Rate limit: all retries exhausted, using fallback scores")
                    break
            else:
                logger.error(f"Batch role fit failed: {e}")
                break

    # Fallback: return neutral scores for all candidates
    return {
        c["id"]: {"role_fit_score": 55.0, "explanation": "Evaluated based on skill match only (AI evaluation unavailable)."}
        for c in candidates
    }


async def match_candidates(jd: ParsedJD, top_n: int = 5) -> list[CandidateScore]:
    """
    Full matching pipeline using 1 Gemini call total:
    1. Fast local skill + experience scoring (no API calls)
    2. ONE batched Gemini call for role fit of top 10
    3. Combine and return top_n
    """
    candidates = get_all_candidates()
    logger.info(f"Matching {len(candidates)} candidates for: {jd.role_title}")

    # Step 1: Fast local scoring (zero API calls)
    scored = []
    for c in candidates:
        skill_result = compute_skill_overlap(
            c["skills"], jd.required_skills, jd.preferred_skills
        )
        exp_score = compute_experience_score(c["experience_years"], jd.required_experience_years)
        pre_score = skill_result["score"] * 0.6 + exp_score * 0.4

        scored.append({
            "candidate": c,
            "skill_score": skill_result["score"],
            "exp_score": exp_score,
            "pre_score": pre_score,
            "matched_skills": skill_result["matched_skills"],
            "missing_skills": skill_result["missing_skills"],
        })

    # Pre-filter top 10 by fast score only
    scored.sort(key=lambda x: x["pre_score"], reverse=True)
    top_for_llm = scored[:min(10, len(scored))]

    # Step 2: ONE batched Gemini call for all top candidates
    logger.info(f"Sending 1 batched Gemini call for {len(top_for_llm)} candidates...")
    role_fit_map = await _batch_role_fit([item["candidate"] for item in top_for_llm], jd)

    # Step 3: Combine scores
    final_scored = []
    for item in top_for_llm:
        c = item["candidate"]
        cid = c["id"]
        skill_s = item["skill_score"]
        exp_s = item["exp_score"]
        role_data = role_fit_map.get(cid, {"role_fit_score": 55.0, "explanation": ""})
        role_s = role_data["role_fit_score"]

        # Match Score = 40% skill + 20% experience + 40% role fit
        match_score = round(skill_s * 0.40 + exp_s * 0.20 + role_s * 0.40, 1)

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

    # Sort by match score
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

    logger.info(f"Matched {len(results)} candidates using 1 Gemini call")
    return results
