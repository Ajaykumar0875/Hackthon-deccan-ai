"""Auth router — login + register. All authentication is against MongoDB only."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    role: str
    email: str
    name: str
    message: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


@router.post("/register", response_model=LoginResponse)
async def register(request: RegisterRequest):
    """Register a new candidate user — saved to MongoDB."""
    email = request.email.strip().lower()
    name  = request.name.strip()

    if not name or not email or not request.password:
        raise HTTPException(status_code=400, detail="Name, email and password are required")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    from database.connection import get_db
    from utils.password import hash_password

    db       = get_db()
    existing = await db["users"].find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    await db["users"].insert_one({
        "name":          name,
        "email":         email,
        "role":          "candidate",
        "password_hash": hash_password(request.password),
        "created_at":    datetime.utcnow().isoformat(),
    })

    return LoginResponse(role="candidate", email=email, name=name, message="Account created successfully")


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user — MongoDB only, no .env fallback."""
    email = request.email.strip().lower()

    from database.connection import get_db
    from utils.password import verify_password

    db   = get_db()
    user = await db["users"].find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email")

    stored_hash = user.get("password_hash", "")
    if not stored_hash or not verify_password(request.password, stored_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    return LoginResponse(
        role=user["role"],
        email=user["email"],
        name=user.get("name", email.split("@")[0].capitalize()),
        message="Login successful",
    )
