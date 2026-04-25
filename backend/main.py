"""FastAPI application entry point."""
import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.api_router import router
from routers.auth_router import router as auth_router
from routers.email_router import router as email_router
from config import get_settings

# ─── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ─── Settings ──────────────────────────────────────────────────────────────────
settings = get_settings()


# ─── Lifespan (replaces deprecated on_event) ───────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("KizunaHire API starting up...")
    logger.info(f"Environment: {settings.environment}")

    # ── MongoDB connection check ──────────────────────────────────────────────
    if settings.mongodb_uri:
        try:
            from database.connection import ping_db
            ok = await ping_db()
            if ok:
                print("\n✅ MongoDB Connected Successfully — Database: talentscout\n")
                logger.info("✅ MongoDB Atlas connection verified")
            else:
                print("\n❌ MongoDB connection FAILED — check your URI in .env\n")
        except Exception as e:
            print(f"\n❌ MongoDB error: {e}\n")
    else:
        print("\n⚠️  No MONGODB_URI set — running without database\n")

    yield
    logger.info("KizunaHire API shutting down...")


# ─── App Init ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="KizunaHire API",
    description="AI-powered talent scouting and engagement agent",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000",
                   "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ────────────────────────────────────────────────────────────────────
app.include_router(router)
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(email_router, prefix="/api/email", tags=["email"])

