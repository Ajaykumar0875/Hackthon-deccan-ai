"""JD Parser Agent — uses Gemini to extract structured data from raw job descriptions."""
import json
import logging
import google.generativeai as genai
from models.schemas import ParsedJD, ExperienceLevel
from config import get_settings
logger = logging.getLogger(__name__)


def _get_model():
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        model_name="models/gemini-2.5-flash",
        generation_config=genai.GenerationConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )


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

Return only valid JSON, no markdown or explanation."""


async def parse_jd(jd_text: str) -> ParsedJD:
    """Parse raw JD text into structured ParsedJD using Gemini."""
    logger.info("Parsing JD with Gemini...")
    model = _get_model()

    prompt = PARSE_PROMPT.format(jd_text=jd_text)

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]

        data = json.loads(raw_text)

        # Normalize experience level
        level_map = {
            "junior": ExperienceLevel.junior,
            "mid": ExperienceLevel.mid,
            "senior": ExperienceLevel.senior,
            "lead": ExperienceLevel.lead,
            "principal": ExperienceLevel.principal,
        }
        raw_level = data.get("experience_level", "Mid").lower()
        data["experience_level"] = level_map.get(raw_level, ExperienceLevel.mid)

        return ParsedJD(**data)

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}. Raw: {raw_text[:500]}")
        raise ValueError(f"Failed to parse Gemini response as JSON: {e}")
    except Exception as e:
        logger.error(f"JD parsing failed: {e}")
        raise
