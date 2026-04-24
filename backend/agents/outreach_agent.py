"""Outreach Agent — simulates ALL conversations in ONE batched Gemini call."""
import json
import logging
import asyncio
import google.generativeai as genai
from models.schemas import ParsedJD, CandidateScore, OutreachResult, ConversationTurn
from data.candidates import get_candidate_by_id
from config import get_settings

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_DELAYS = [15, 30, 60]


def _get_model():
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        model_name="models/gemini-2.5-flash",
        generation_config=genai.GenerationConfig(temperature=0.7),
    )


BATCH_OUTREACH_PROMPT = """You are simulating recruiter outreach conversations for multiple candidates.

JOB BEING FILLED:
Role: {role_title}
Required Skills: {required_skills}
Level: {level}
Salary: {salary}
Remote: {remote}
Key highlights: {key_requirements}

For EACH candidate below, simulate a realistic 3-turn conversation (recruiter → candidate → recruiter → candidate → recruiter → candidate) and score their interest.

CANDIDATES:
{candidates_block}

Return a JSON array — one object per candidate in SAME ORDER:
[
  {{
    "candidate_id": "C001",
    "conversation": [
      {{"role": "recruiter", "message": "..."}},
      {{"role": "candidate", "message": "..."}},
      {{"role": "recruiter", "message": "..."}},
      {{"role": "candidate", "message": "..."}},
      {{"role": "recruiter", "message": "..."}},
      {{"role": "candidate", "message": "..."}}
    ],
    "interest_score": <integer 0-100>,
    "interest_label": "Very Interested" | "Interested" | "Neutral" | "Not Interested",
    "key_signals": ["signal 1", "signal 2", "signal 3"],
    "summary": "2 sentence summary of interest and key takeaway for recruiter"
  }},
  ...
]

Interest scoring:
- 80-100: Enthusiastic, asks questions, expresses clear desire to proceed
- 60-79: Positive, open to learning more
- 40-59: Neutral, has reservations
- 0-39: Disinterested, has conflicts, declines

Return ONLY valid JSON array."""


def _build_outreach_candidates_block(candidates_data: list[dict]) -> str:
    lines = []
    for c in candidates_data:
        lines.append(
            f"ID:{c['id']} | {c['name']} | {c['title']} | "
            f"{c['experience_years']}yrs | Location: {c['location']} | "
            f"Remote OK: {c['open_to_remote']} | Availability: {c['availability']} | "
            f"Summary: {c['summary'][:100]}"
        )
    return "\n".join(lines)


async def _batch_outreach(
    candidates_data: list[dict], jd: ParsedJD
) -> list[dict]:
    """ONE Gemini call to simulate conversations for ALL shortlisted candidates."""
    model = _get_model()
    prompt = BATCH_OUTREACH_PROMPT.format(
        role_title=jd.role_title,
        required_skills=", ".join(jd.required_skills[:6]),
        level=jd.experience_level.value,
        salary=jd.salary_range_usd or "Competitive",
        remote="Yes" if jd.remote_ok else "No",
        key_requirements=jd.key_requirements_summary,
        candidates_block=_build_outreach_candidates_block(candidates_data),
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
            return json.loads(raw)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower():
                if attempt < MAX_RETRIES:
                    logger.warning(f"Rate limit — retrying outreach in {delay}s (attempt {attempt}/{MAX_RETRIES})")
                    await asyncio.sleep(delay)
                else:
                    logger.error("Rate limit: outreach retries exhausted, using fallback")
                    break
            else:
                logger.error(f"Batch outreach failed: {e}")
                break

    # Fallback: neutral interest for all
    return [
        {
            "candidate_id": c["id"],
            "conversation": [
                {"role": "recruiter", "message": f"Hi {c['name'].split()[0]}! I'd love to connect about a {jd.role_title} role."},
                {"role": "candidate", "message": "Thanks for reaching out! I'd be happy to learn more."},
            ],
            "interest_score": 55,
            "interest_label": "Neutral",
            "key_signals": ["Limited data — manual follow-up recommended"],
            "summary": "Interest evaluation unavailable due to API limits. Manual outreach recommended.",
        }
        for c in candidates_data
    ]


async def run_outreach_for_shortlist(
    candidates: list[CandidateScore], jd: ParsedJD
) -> tuple[list[CandidateScore], dict]:
    """
    Run outreach for ALL shortlisted candidates in ONE Gemini call.
    Updates each CandidateScore with interest_score and combined_score.
    """
    # Gather candidate profile data
    candidates_data = []
    for cs in candidates:
        profile = get_candidate_by_id(cs.candidate_id)
        if profile:
            candidates_data.append(profile)
        else:
            candidates_data.append({
                "id": cs.candidate_id,
                "name": cs.candidate_name,
                "title": cs.candidate_title,
                "experience_years": 5,
                "location": cs.candidate_location,
                "open_to_remote": True,
                "availability": "Unknown",
                "summary": cs.match_explanation,
            })

    logger.info(f"Sending 1 batched outreach call for {len(candidates_data)} candidates...")
    outreach_results_raw = await _batch_outreach(candidates_data, jd)

    # Build lookup by candidate_id
    outreach_map: dict[str, dict] = {}
    for r in outreach_results_raw:
        cid = r.get("candidate_id", "")
        outreach_map[cid] = r

    # Update candidates with interest + combined scores
    updated = []
    final_outreach_map: dict[str, OutreachResult] = {}

    for cs in candidates:
        raw = outreach_map.get(cs.candidate_id, {})
        interest = float(raw.get("interest_score", 55))
        combined = round(cs.match_score * 0.60 + interest * 0.40, 1)
        summary = raw.get("summary", "")

        updated_cs = cs.model_copy(update={
            "interest_score": interest,
            "combined_score": combined,
            "conversation_summary": summary,
        })
        updated.append(updated_cs)

        # Build OutreachResult for the outreach map
        turns = [
            ConversationTurn(role=t["role"], message=t["message"])
            for t in raw.get("conversation", [])
        ]
        final_outreach_map[cs.candidate_id] = OutreachResult(
            candidate_id=cs.candidate_id,
            candidate_name=cs.candidate_name,
            conversation=turns,
            interest_score=interest,
            interest_label=raw.get("interest_label", "Neutral"),
            key_signals=raw.get("key_signals", []),
            summary=summary,
        )

    # Re-rank by combined score
    updated.sort(key=lambda x: x.combined_score, reverse=True)
    for i, c in enumerate(updated):
        updated[i] = c.model_copy(update={"rank": i + 1})

    logger.info(f"Outreach complete for {len(updated)} candidates using 1 Gemini call")
    return updated, final_outreach_map
