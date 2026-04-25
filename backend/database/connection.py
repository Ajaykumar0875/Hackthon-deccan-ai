"""MongoDB connection — async motor client shared across the app."""
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncIOMotorClient(settings.mongodb_uri)
        logger.info("✅ MongoDB client created")
    return _client


def get_db():
    """Returns the talentscout database."""
    return get_client()["talentscout"]


# ── Collection accessors ─────────────────────────────────────────────────────
def users_col():
    """users collection — stores registered candidate accounts."""
    return get_db()["users"]


def applications_col():
    """applications collection — stores job applications + parsed resume data."""
    return get_db()["applications"]


def interviews_col():
    """interviews collection — stores AI interview sessions + scores."""
    return get_db()["interviews"]


async def ping_db() -> bool:
    """Returns True if MongoDB connection is healthy."""
    try:
        await get_client().admin.command("ping")
        return True
    except Exception as e:
        logger.error(f"MongoDB ping failed: {e}")
        return False
