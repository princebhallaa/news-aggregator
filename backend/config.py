"""
Central configuration. Reads everything from a .env file (see .env.example).
Never hardcode API keys here — always load them from environment variables.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---- YouTube Data API v3 ----
    # Get from: https://console.cloud.google.com/apis/credentials
    # (Enable "YouTube Data API v3" on the project first)
    YOUTUBE_API_KEY: str = ""

    # ---- Telegram (Telethon, user account API) ----
    # Get from: https://my.telegram.org/apps
    TELEGRAM_API_ID: str = ""
    TELEGRAM_API_HASH: str = ""
    TELEGRAM_SESSION_NAME: str = "news_aggregator_session"

    # ---- Database ----
    # Defaults to local SQLite file. Swap for Postgres in production, e.g.:
    # postgresql+psycopg2://user:password@localhost:5432/news_aggregator
    DATABASE_URL: str = "sqlite:///./news_aggregator.db"

    # ---- Misc ----
    CACHE_TTL_MINUTES: int = 15
    MAX_RESULTS_PER_PLATFORM: int = 15
    FRONTEND_ORIGIN: str = "*"  # tighten this in production

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
