"""JWT utilities — token creation and FastAPI dependencies for auth guards."""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Header, HTTPException, status

logger = logging.getLogger(__name__)

# ── Token creation ─────────────────────────────────────────────────────────────

def create_access_token(email: str, role: str) -> str:
    """Create a signed JWT token (HS256). Uses PyJWT (lightweight, no cryptography dep)."""
    import json, base64, hmac, hashlib
    from config import get_settings
    settings = get_settings()

    header  = {"alg": "HS256", "typ": "JWT"}
    exp     = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expire_hours)
    payload = {
        "sub":   email,
        "role":  role,
        "exp":   int(exp.timestamp()),
        "iat":   int(datetime.now(timezone.utc).timestamp()),
    }

    def _b64(data: dict) -> str:
        return base64.urlsafe_b64encode(
            json.dumps(data, separators=(",", ":")).encode()
        ).rstrip(b"=").decode()

    header_b64  = _b64(header)
    payload_b64 = _b64(payload)
    signing_input = f"{header_b64}.{payload_b64}".encode()
    sig = hmac.new(settings.jwt_secret.encode(), signing_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b"=").decode()

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_token(token: str) -> Optional[dict]:
    """Verify + decode a JWT token. Returns payload dict or None if invalid/expired."""
    import json, base64, hmac, hashlib
    from config import get_settings
    settings = get_settings()

    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode()

        # Verify signature
        expected_sig = hmac.new(
            settings.jwt_secret.encode(), signing_input, hashlib.sha256
        ).digest()
        expected_b64 = base64.urlsafe_b64encode(expected_sig).rstrip(b"=").decode()
        if not hmac.compare_digest(expected_b64, sig_b64):
            return None

        # Decode payload
        padding = (4 - len(payload_b64) % 4) % 4   # 0 padding when already aligned
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "=" * padding))

        # Check expiry
        if payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
            return None

        return payload

    except Exception as e:
        logger.debug(f"Token decode error: {e}")
        return None


# ── FastAPI dependencies ───────────────────────────────────────────────────────

def _extract_token(authorization: str = Header(default="")) -> Optional[str]:
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return None


def get_current_user(authorization: str = Header(default="")) -> dict:
    """Dependency — returns payload if token is valid (any role)."""
    token = authorization[7:] if authorization.startswith("Bearer ") else None
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def require_admin(authorization: str = Header(default="")) -> dict:
    """Dependency — allows only admin role through."""
    payload = get_current_user(authorization)
    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return payload


def require_candidate(authorization: str = Header(default="")) -> dict:
    """Dependency — allows only candidate role through."""
    payload = get_current_user(authorization)
    if payload.get("role") != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate access required.",
        )
    return payload
