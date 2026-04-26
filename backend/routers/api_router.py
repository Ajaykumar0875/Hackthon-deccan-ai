"""FastAPI routers for all endpoints."""
import time
import logging
from fastapi import APIRouter, HTTPException
from models.schemas import JobDescriptionInput, ShortlistResponse, ParsedJD
from agents.jd_parser import parse_jd
from agents.candidate_matcher import match_candidates
from agents.outreach_agent import run_outreach_for_shortlist
from data.candidates import SAMPLE_JDS, get_all_candidates

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["KizunaHire"])


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "KizunaHire API"}


@router.get("/candidates")
async def list_candidates():
    """Return all candidate profiles (for browsing)."""
    return {"candidates": get_all_candidates(), "total": len(get_all_candidates())}


@router.get("/sample-jds")
async def get_sample_jds():
    """Return sample JDs for frontend demo."""
    return {"sample_jds": SAMPLE_JDS}


@router.post("/shortlist", response_model=ShortlistResponse)
async def generate_shortlist(body: JobDescriptionInput):
    """
    Main endpoint — full pipeline:
    1. Parse JD
    2. Match candidates
    3. Simulate outreach
    4. Return ranked shortlist
    """
    start_time = time.time()
    logger.info(f"Shortlist request: top_n={body.top_n}, jd_length={len(body.jd_text)}")

    try:
        # Step 1: Parse JD
        parsed_jd = await parse_jd(body.jd_text)
        logger.info(f"JD parsed: {parsed_jd.role_title}")

        # Step 2: Match candidates
        matched = await match_candidates(parsed_jd, top_n=body.top_n)
        logger.info(f"Matched {len(matched)} candidates")

        # Step 3: Simulate outreach
        final_shortlist, outreach_map = await run_outreach_for_shortlist(matched, parsed_jd)
        logger.info(f"Outreach complete for {len(final_shortlist)} candidates")

        elapsed = round(time.time() - start_time, 2)

        return ShortlistResponse(
            parsed_jd=parsed_jd,
            total_candidates_evaluated=len(get_all_candidates()),
            shortlisted_candidates=final_shortlist,
            processing_time_seconds=elapsed,
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Shortlist generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/parse-jd", response_model=ParsedJD)
async def parse_jd_only(body: JobDescriptionInput):
    """Parse a JD and return structured data (without matching)."""
    try:
        return await parse_jd(body.jd_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
