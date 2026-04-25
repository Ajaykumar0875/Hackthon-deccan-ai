"""Outreach Agent — simulates ALL conversations in ONE batched Groq call."""
import json
import logging
import asyncio
from groq import Groq
from models.schemas import ParsedJD, CandidateScore, OutreachResult, ConversationTurn
from data.candidates import get_candidate_by_id
from config import get_settings

logger = logging.getLogger(__name__)

MODEL = "llama-3.3-70b-versatile"


def _get_client() -> Groq:
    settings = get_settings()
    return Groq(api_key=settings.groq_api_key)


BATCH_OUTREACH_PROMPT = """You are simulating realistic recruiter outreach conversations for multiple candidates.

JOB BEING FILLED:
Role: {role_title}
Required Skills: {required_skills}
Level: {level}
Salary: {salary}
Remote: {remote}
Key highlights: {key_requirements}

For EACH candidate listed below, simulate a 6-message conversation (3 turns each side: recruiter → candidate → recruiter → candidate → recruiter → candidate) and score their interest level.

CANDIDATES:
{candidates_block}

Return a JSON object with a single key "results" containing an array — one object per candidate in SAME ORDER:
{{
  "results": [
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
      "summary": "2 sentence summary of the candidate's interest level and key takeaway for the recruiter"
    }}
  ]
}}

Interest scoring guide:
- 80-100: Enthusiastic, asks detailed questions, expresses clear desire to proceed
- 60-79: Positive, open to learning more, no major objections
- 40-59: Neutral, has some reservations, needs convincing
- 0-39: Disinterested, has conflicts (long notice period, salary mismatch, wrong role)

Make conversations natural and realistic. Each candidate should have a distinct voice."""


def _build_outreach_block(candidates_data: list[dict]) -> str:
    lines = []
    for c in candidates_data:
        lines.append(
            f"ID:{c['id']} | {c['name']} | {c['title']} | "
            f"{c['experience_years']}yrs exp | "
            f"Location: {c['location']} | Remote: {c['open_to_remote']} | "
            f"Available: {c.get('availability', 'Immediate')} | {c['summary'][:100]}"
        )
    return "\n".join(lines)


async def _batch_outreach(candidates_data: list[dict], jd: ParsedJD) -> list[dict]:
    """ONE Groq call to simulate outreach conversations for ALL shortlisted candidates."""
    client = _get_client()
    prompt = BATCH_OUTREACH_PROMPT.format(
        role_title=jd.role_title,
        required_skills=", ".join(jd.required_skills[:6]),
        level=jd.experience_level.value,
        salary=jd.salary_range_usd or "Competitive",
        remote="Yes" if jd.remote_ok else "No",
        key_requirements=jd.key_requirements_summary,
        candidates_block=_build_outreach_block(candidates_data),
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
                        "content": "You are a recruiting assistant. Always respond with valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            ),
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        return data.get("results", [])

    except Exception as e:
        logger.error(f"Batch outreach failed: {e}")
        # Graceful fallback
        return [
            {
                "candidate_id": c["id"],
                "conversation": [
                    {
                        "role": "recruiter",
                        "message": f"Hi {c['name'].split()[0]}, I came across your profile and think you'd be a great fit for our {jd.role_title} role. Would you be open to a quick chat?",
                    },
                    {
                        "role": "candidate",
                        "message": "Thanks for reaching out! I'd be happy to learn more about the opportunity.",
                    },
                ],
                "interest_score": 55,
                "interest_label": "Neutral",
                "key_signals": ["Responded positively to initial outreach"],
                "summary": "Candidate expressed initial interest. Manual follow-up recommended for detailed evaluation.",
            }
            for c in candidates_data
        ]


async def run_outreach_for_shortlist(
    candidates: list[CandidateScore], jd: ParsedJD
) -> tuple[list[CandidateScore], dict]:
    """
    Run outreach for ALL shortlisted candidates in ONE Groq call.
    Updates each CandidateScore with interest_score and combined_score.
    """
    # Gather candidate profiles
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
                "availability": "TBD",
                "summary": cs.match_explanation[:100],
            })

    logger.info(f"Sending 1 batched Groq outreach call for {len(candidates_data)} candidates...")
    raw_results = await _batch_outreach(candidates_data, jd)

    # Build lookup
    outreach_map_raw: dict[str, dict] = {r.get("candidate_id", ""): r for r in raw_results}

    updated: list[CandidateScore] = []
    final_outreach_map: dict[str, OutreachResult] = {}

    for cs in candidates:
        raw = outreach_map_raw.get(cs.candidate_id, {})
        interest = float(raw.get("interest_score", 55))
        combined = round(cs.match_score * 0.60 + interest * 0.40, 1)
        summary = raw.get("summary", "")

        updated.append(cs.model_copy(update={
            "interest_score": interest,
            "combined_score": combined,
            "conversation_summary": summary,
        }))

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

    logger.info(f"Outreach complete for {len(updated)} candidates using 1 Groq call")
    return updated, final_outreach_map
