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
    mongodb_uri: str = ""        # MongoDB Atlas connection string


@lru_cache()
def get_settings() -> Settings:
    return Settings()
