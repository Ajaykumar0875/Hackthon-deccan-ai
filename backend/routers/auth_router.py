"""Auth router — handles login for admin and candidates via MongoDB users collection."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import get_settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    role: str       # "admin" | "candidate"
    email: str
    name: str
    message: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    settings = get_settings()
    email = request.email.strip().lower()

    # ── Look up user in MongoDB ───────────────────────────────────────────────
    user = None
    try:
        from database.connection import get_db
        db = get_db()
        user = await db["users"].find_one(
            {"email": {"$regex": f"^{email}$", "$options": "i"}}
        )
    except Exception:
        user = None

    # ── Admin login ───────────────────────────────────────────────────────────
    if user and user.get("role") == "admin":
        if request.password != settings.admin_password:
            raise HTTPException(status_code=401, detail="Invalid admin password")
        return LoginResponse(
            role="admin",
            email=user["email"],
            name=user.get("name", "Admin"),
            message="Admin login successful",
        )

    # ── Fallback admin check (from .env, no DB needed) ────────────────────────
    if (
        email == settings.admin_email.lower().strip()
        and request.password == settings.admin_password
    ):
        return LoginResponse(
            role="admin",
            email=request.email,
            name="Ajay",
            message="Admin login successful",
        )

    # ── Candidate login ───────────────────────────────────────────────────────
    if user and user.get("role") == "candidate":
        return LoginResponse(
            role="candidate",
            email=user["email"],
            name=user.get("name", email.split("@")[0].capitalize()),
            message="Login successful",
        )

    # ── Any other email/password → treat as guest candidate (placeholder) ─────
    if request.email and request.password:
        return LoginResponse(
            role="candidate",
            email=request.email,
            name=request.email.split("@")[0].capitalize(),
            message="Login successful",
        )

    raise HTTPException(status_code=401, detail="Invalid credentials")
