"""Application configuration using pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",          # ignore unknown .env keys gracefully
    )

    groq_api_key: str
    environment: str = "development"
    log_level: str = "INFO"
    admin_email: str = "admin@example.com"
    admin_password: str = "changeme"
    mongodb_uri: str = ""
    sender_email: str = ""           # Gmail address to send from
    sender_app_password: str = ""    # Gmail App Password (not your login password)
    jwt_secret: str = "kizunahire-change-this-in-production-2026"
    jwt_expire_hours: int = 24
    frontend_url: str = ""   # e.g. https://kizunahire.vercel.app


@lru_cache()
def get_settings() -> Settings:
    return Settings()
