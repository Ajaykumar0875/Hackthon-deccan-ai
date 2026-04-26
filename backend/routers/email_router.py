"""Email router — sends AI interview invitation emails to shortlisted candidates."""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from utils.jwt_auth import require_admin
from pydantic import BaseModel, EmailStr
from config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Request / Response Models ────────────────────────────────────────────────
class Candidate(BaseModel):
    name: str
    email: EmailStr
    role: str
    match_score: float


class SendInvitesRequest(BaseModel):
    candidates: List[Candidate]
    interview_base_url: str = "http://localhost:3000/interview"


class SendInvitesResponse(BaseModel):
    sent: List[str]
    failed: List[str]
    total: int


# ── Email Template ────────────────────────────────────────────────────────────
def build_email_html(candidate_name: str, role: str, interview_link: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body {{ font-family: 'Poppins', Arial, sans-serif; background:#f8fafc; margin:0; padding:0; }}
    .container {{ max-width:600px; margin:40px auto; background:#fff; border-radius:16px;
                  overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }}
    .header {{ background:linear-gradient(135deg,#6366f1,#4f46e5); padding:40px 32px; text-align:center; }}
    .header h1 {{ color:#fff; margin:0; font-size:24px; font-weight:700; }}
    .header p {{ color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px; }}
    .body {{ padding:36px 32px; }}
    .badge {{ display:inline-block; background:#eef2ff; color:#4f46e5; border-radius:999px;
               padding:4px 14px; font-size:12px; font-weight:600; margin-bottom:20px; }}
    h2 {{ color:#1e293b; font-size:20px; margin:0 0 12px; }}
    p {{ color:#475569; font-size:14px; line-height:1.7; margin:0 0 16px; }}
    .cta {{ display:block; width:fit-content; margin:28px auto; background:#6366f1;
            color:#fff!important; text-decoration:none; padding:14px 36px;
            border-radius:999px; font-weight:600; font-size:15px; }}
    .info-box {{ background:#f1f5f9; border-radius:12px; padding:18px 20px; margin:24px 0; }}
    .info-box p {{ margin:4px 0; font-size:13px; }}
    .footer {{ padding:20px 32px; text-align:center; border-top:1px solid #e2e8f0; }}
    .footer p {{ color:#94a3b8; font-size:12px; margin:0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You've Been Shortlisted!</h1>
      <p>KizunaHire — Smart Hiring Platform</p>
    </div>
    <div class="body">
      <span class="badge">Interview Invitation</span>
      <h2>Hi {candidate_name},</h2>
      <p>Congratulations! Your profile has been shortlisted for the <strong>{role}</strong> position.
         Our AI has matched your skills with the job requirements and we'd love to learn more about you.</p>

      <div class="info-box">
        <p>📌 <strong>Role:</strong> {role}</p>
        <p>⏱ <strong>Duration:</strong> ~10 minutes</p>
        <p>🤖 <strong>Format:</strong> AI-powered interview — answer at your own pace</p>
        <p>📅 <strong>Deadline:</strong> 48 hours from receiving this email</p>
      </div>

      <p>Click the button below to start your AI interview. It consists of a few technical and
         behavioural questions tailored specifically to the <strong>{role}</strong> role.</p>

      <a href="{interview_link}" class="cta">Start AI Interview →</a>

      <p style="font-size:13px;color:#94a3b8;text-align:center;">
        If the button doesn't work, copy this link:<br/>
        <a href="{interview_link}" style="color:#6366f1;">{interview_link}</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2026 KizunaHire · You're receiving this because you applied for a position.<br/>
         Built by <a href="https://www.linkedin.com/in/ajaykumar-8b2ab4258/" style="color:#6366f1;">Ajay Kumar</a></p>
    </div>
  </div>
</body>
</html>
"""


# ── Send a single email via Gmail SMTP ───────────────────────────────────────
def send_gmail(to_email: str, to_name: str, subject: str, html_body: str, settings) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"KizunaHire <{settings.sender_email}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.sender_email, settings.sender_app_password)
            server.sendmail(settings.sender_email, to_email, msg.as_string())

        logger.info(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {e}")
        return False


# ── API Endpoint ──────────────────────────────────────────────────────────────
@router.post("/send-invites", response_model=SendInvitesResponse)
async def send_interview_invites(request: SendInvitesRequest, _: dict = Depends(require_admin)):
    settings = get_settings()

    if not settings.sender_email or not settings.sender_app_password:
        raise HTTPException(
            status_code=503,
            detail="Email not configured. Add SENDER_EMAIL and SENDER_APP_PASSWORD to .env"
        )
    if settings.sender_app_password == "your_gmail_app_password_here":
        raise HTTPException(
            status_code=503,
            detail="Please set a real Gmail App Password in backend/.env"
        )

    sent, failed = [], []

    for candidate in request.candidates:
        interview_link = f"{request.interview_base_url}?email={candidate.email}&role={candidate.role}"
        html = build_email_html(candidate.name, candidate.role, interview_link)
        subject = f"🎉 You've been shortlisted for {candidate.role} — Start your AI Interview"

        ok = send_gmail(candidate.email, candidate.name, subject, html, settings)
        if ok:
            sent.append(candidate.email)
        else:
            failed.append(candidate.email)

    return SendInvitesResponse(sent=sent, failed=failed, total=len(request.candidates))


@router.get("/status")
async def email_status():
    """Check if email is configured."""
    settings = get_settings()
    configured = bool(settings.sender_email and settings.sender_app_password
                      and settings.sender_app_password != "your_gmail_app_password_here")
    return {"configured": configured, "sender": settings.sender_email if configured else None}
