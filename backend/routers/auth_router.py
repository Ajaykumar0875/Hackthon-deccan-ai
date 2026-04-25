"""Auth router — handles login for admin and users."""
from fastapi import APIRouter
from pydantic import BaseModel
from config import get_settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    role: str          # "admin" | "user"
    email: str
    message: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    settings = get_settings()

    # Admin check (credentials from .env — never hardcoded)
    if (
        request.email.lower().strip() == settings.admin_email.lower().strip()
        and request.password == settings.admin_password
    ):
        return LoginResponse(role="admin", email=request.email, message="Admin login successful")

    # Placeholder user auth (will be replaced with MongoDB lookup when DB is added)
    # For now, any non-admin email/password combo is treated as a registered user
    # TODO: Replace with real user lookup from MongoDB
    if request.email and request.password:
        return LoginResponse(role="user", email=request.email, message="User login successful")

    from fastapi import HTTPException
    raise HTTPException(status_code=401, detail="Invalid credentials")
