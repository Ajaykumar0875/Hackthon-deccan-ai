"""Application configuration using pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
    )

    gemini_api_key: str
    environment: str = "development"
    log_level: str = "INFO"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
