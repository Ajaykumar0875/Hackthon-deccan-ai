"""Auth router — login + register + forgot-password OTP flow."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from datetime import datetime, timedelta
import random, logging, io

router = APIRouter()
logger = logging.getLogger(__name__)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    role: str
    email: str
    name: str
    message: str
    token: str = ""   # JWT access token


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

    from utils.jwt_auth import create_access_token
    token = create_access_token(email, "candidate")
    return LoginResponse(role="candidate", email=email, name=name, message="Account created successfully", token=token)


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

    from utils.jwt_auth import create_access_token
    token = create_access_token(user["email"], user["role"])
    return LoginResponse(
        role=user["role"],
        email=user["email"],
        name=user.get("name", email.split("@")[0].capitalize()),
        message="Login successful",
        token=token,
    )


# ═══════════════════════════════════════════════════════════
#   FORGOT PASSWORD — OTP FLOW
# ═══════════════════════════════════════════════════════════

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


def _otp_email_html(name: str, otp: str) -> str:
    return f"""
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  body{{font-family:Arial,sans-serif;background:#0a0a0a;margin:0;padding:0;color:#fff;}}
  .wrap{{max-width:480px;margin:40px auto;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;}}
  .hdr{{background:#052010;border-bottom:1px solid #14532d;padding:32px;text-align:center;}}
  .hdr h1{{color:#4ade80;margin:0;font-size:22px;}}
  .hdr p{{color:#71717a;margin:8px 0 0;font-size:13px;}}
  .body{{padding:32px;}}
  .otp-box{{background:#0d1f0d;border:2px solid #16a34a;border-radius:12px;padding:20px;text-align:center;margin:24px 0;}}
  .otp{{font-size:40px;font-weight:800;letter-spacing:12px;color:#4ade80;}}
  .exp{{color:#71717a;font-size:12px;margin-top:8px;}}
  p{{color:#a1a1aa;font-size:14px;line-height:1.7;}}
  .footer{{padding:16px 32px;border-top:1px solid #1a1a1a;text-align:center;}}
  .footer p{{color:#3f3f46;font-size:11px;margin:0;}}
</style></head><body>
<div class="wrap">
  <div class="hdr">
    <h1>🔐 Password Reset</h1>
    <p>KizunaHire — Secure Account Recovery</p>
  </div>
  <div class="body">
    <p>Hi <strong style="color:#fff">{name}</strong>,</p>
    <p>We received a request to reset your KizunaHire password. Use the OTP below to proceed:</p>
    <div class="otp-box">
      <div class="otp">{otp}</div>
      <div class="exp">⏱ Expires in <strong>10 minutes</strong></div>
    </div>
    <p>Enter this code on the password reset page. If you didn't request this, you can safely ignore this email — your account is secure.</p>
    <p style="color:#3f3f46;font-size:12px;">Do not share this OTP with anyone.</p>
  </div>
  <div class="footer"><p>© 2026 KizunaHire · Automated security email</p></div>
</div>
</body></html>"""


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Generate a 6-digit OTP, store in DB, send via Gmail."""
    email = request.email.strip().lower()

    from database.connection import get_db
    from config import get_settings
    from routers.email_router import send_gmail
    import smtplib

    db   = get_db()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    # Generate OTP
    otp     = str(random.randint(100000, 999999))
    expires = datetime.utcnow() + timedelta(minutes=10)

    # Upsert OTP record (one active OTP per email)
    await db["otps"].update_one(
        {"email": email},
        {"$set": {"email": email, "otp": otp, "expires_at": expires, "used": False}},
        upsert=True,
    )

    # Send email
    settings = get_settings()
    name     = user.get("name", "there")
    html     = _otp_email_html(name, otp)
    ok       = send_gmail(email, name, "🔐 Your KizunaHire Password Reset OTP", html, settings)

    if not ok:
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Check SMTP config.")

    logger.info(f"OTP sent to {email}")
    return {"message": f"OTP sent to {email}. Valid for 10 minutes."}


@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    """Check the OTP is valid and not expired (does NOT consume it yet)."""
    email = request.email.strip().lower()

    from database.connection import get_db
    db  = get_db()
    rec = await db["otps"].find_one({"email": email})

    if not rec:
        raise HTTPException(status_code=400, detail="No OTP found for this email. Request a new one.")
    if rec.get("used"):
        raise HTTPException(status_code=400, detail="OTP has already been used. Request a new one.")
    if datetime.utcnow() > rec["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")
    if rec["otp"] != request.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")

    return {"message": "OTP verified successfully"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Verify OTP one final time, then update the password."""
    email = request.email.strip().lower()

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    from database.connection import get_db
    from utils.password import hash_password
    db  = get_db()
    rec = await db["otps"].find_one({"email": email})

    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or already used OTP.")
    if datetime.utcnow() > rec["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    if rec["otp"] != request.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP.")

    # Update password + mark OTP used
    await db["users"].update_one({"email": email}, {"$set": {"password_hash": hash_password(request.new_password)}})
    await db["otps"].update_one({"email": email}, {"$set": {"used": True}})

    logger.info(f"Password reset for {email}")
    return {"message": "Password reset successfully. You can now sign in."}


# ── JD File Parser ────────────────────────────────────────────────────────────
@router.post("/parse-jd-file")
async def parse_jd_file(file: UploadFile = File(...)):
    """Extract plain text from uploaded PDF, DOCX, or TXT job description file."""
    filename = (file.filename or "").lower()
    content  = await file.read()

    try:
        if filename.endswith(".pdf"):
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                ).strip()

        elif filename.endswith(".docx"):
            from docx import Document
            doc  = Document(io.BytesIO(content))
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()

        elif filename.endswith(".txt"):
            text = content.decode("utf-8", errors="replace").strip()

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload a PDF, DOCX, or TXT file."
            )

        if not text:
            raise HTTPException(status_code=422, detail="Could not extract any text from the file.")

        return {"text": text, "chars": len(text)}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"JD file parse error: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(exc)}")
