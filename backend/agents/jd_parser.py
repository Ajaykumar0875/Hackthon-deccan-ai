"""JD Parser Agent — uses Groq (Llama 3.3 70B) to extract structured data from raw job descriptions."""
import json
import logging
from groq import Groq
from models.schemas import ParsedJD, ExperienceLevel
from config import get_settings

logger = logging.getLogger(__name__)

MODEL = "llama-3.1-8b-instant"


def _get_client() -> Groq:
    settings = get_settings()
    return Groq(api_key=settings.groq_api_key)


PARSE_PROMPT = """You are an expert HR analyst. Parse the following Job Description and extract structured information.

Return a JSON object with EXACTLY these fields:
{{
  "role_title": "string — the job title",
  "required_skills": ["list of required technical skills"],
  "preferred_skills": ["list of nice-to-have skills"],
  "required_experience_years": integer,
  "experience_level": "Junior" | "Mid" | "Senior" | "Lead" | "Principal",
  "responsibilities": ["list of key responsibilities"],
  "qualifications": ["list of qualifications"],
  "location_preference": "string or null",
  "remote_ok": boolean,
  "salary_range_usd": "string like '$70K-$90K' or null",
  "industry": "string — the industry/domain",
  "key_requirements_summary": "2-3 sentence summary of what they really need"
}}

Job Description:
{jd_text}

Return ONLY valid JSON, no markdown, no explanation."""


def _sanitize(data: dict) -> dict:
    """Ensure LLM output has correct types before Pydantic validation."""
    data["remote_ok"] = bool(data.get("remote_ok") or False)
    data["required_experience_years"] = int(data.get("required_experience_years") or 3)
    data["role_title"] = data.get("role_title") or "Unknown Role"
    data["industry"] = data.get("industry") or "Technology"
    data["key_requirements_summary"] = data.get("key_requirements_summary") or ""
    for field in ("required_skills", "preferred_skills", "responsibilities", "qualifications"):
        if not isinstance(data.get(field), list):
            data[field] = []
    if data.get("salary_range_usd") is not None:
        data["salary_range_usd"] = str(data["salary_range_usd"])
    return data


async def parse_jd(jd_text: str) -> ParsedJD:
    """Parse raw JD text into structured ParsedJD using Groq Llama 3.3 70B."""
    logger.info("Parsing JD with Groq...")
    client = _get_client()

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert HR analyst. Always respond with valid JSON only.",
                },
                {
                    "role": "user",
                    "content": PARSE_PROMPT.format(jd_text=jd_text),
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)

        # Sanitize before Pydantic validation
        data = _sanitize(data)

        # Normalize experience level
        level_map = {
            "junior": ExperienceLevel.junior,
            "mid": ExperienceLevel.mid,
            "senior": ExperienceLevel.senior,
            "lead": ExperienceLevel.lead,
            "principal": ExperienceLevel.principal,
        }
        raw_level = str(data.get("experience_level", "Mid")).lower()
        data["experience_level"] = level_map.get(raw_level, ExperienceLevel.mid)

        logger.info(f"JD parsed: {data.get('role_title', 'Unknown role')}")
        return ParsedJD(**data)

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        raise ValueError(f"Failed to parse JD response as JSON: {e}")
    except Exception as e:
        logger.error(f"JD parsing failed: {e}")
        raise
