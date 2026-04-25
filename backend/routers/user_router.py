"""User router — profile, change-password, and admin statistics endpoints (motor async)."""
from fastapi import APIRouter, HTTPException, Query
from database.connection import get_db
from models.schemas import (
    UserProfile, UpdateProfileRequest,
    ChangePasswordRequest, AdminStats,
)
from utils.password import hash_password, verify_password
import logging

router = APIRouter(prefix="/api/user", tags=["User"])
logger = logging.getLogger(__name__)


async def _get_user(email: str) -> dict:
    """Fetch user by email (direct equality, motor async)."""
    db   = get_db()
    user = await db["users"].find_one({"email": email.strip().lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/profile", response_model=UserProfile)
async def get_profile(email: str = Query(...)):
    user = await _get_user(email)
    return UserProfile(
        name=user.get("name", ""),
        email=user.get("email", ""),
        role=user.get("role", "candidate"),
        created_at=user.get("created_at", ""),
    )


@router.put("/profile", response_model=UserProfile)
async def update_profile(email: str = Query(...), body: UpdateProfileRequest = ...):
    user = await _get_user(email)
    db   = get_db()
    await db["users"].update_one({"email": email.strip().lower()}, {"$set": {"name": body.name}})
    return UserProfile(
        name=body.name,
        email=user.get("email", ""),
        role=user.get("role", "candidate"),
        created_at=user.get("created_at", ""),
    )


@router.put("/change-password")
async def change_password(email: str = Query(...), body: ChangePasswordRequest = ...):
    user        = await _get_user(email)
    stored_hash = user.get("password_hash", "")

    if not stored_hash or not verify_password(body.current_password, stored_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    db = get_db()
    await db["users"].update_one(
        {"email": email.strip().lower()},
        {"$set": {"password_hash": hash_password(body.new_password)}},
    )
    return {"message": "Password updated successfully"}


@router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats():
    db = get_db()

    total      = await db["users"].count_documents({})
    admins     = await db["users"].count_documents({"role": "admin"})
    candidates = await db["users"].count_documents({"role": "candidate"})

    cursor = db["users"].find({}, {"password_hash": 0}).sort("created_at", -1).limit(5)
    latest = [
        UserProfile(
            name=u.get("name", ""),
            email=u.get("email", ""),
            role=u.get("role", ""),
            created_at=u.get("created_at", ""),
        )
        async for u in cursor
    ]

    return AdminStats(
        total_users=total,
        total_candidates=candidates,
        total_admins=admins,
        candidates_by_role={"admin": admins, "candidate": candidates},
        latest_registrations=latest,
    )
