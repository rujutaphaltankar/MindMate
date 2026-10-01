"""
Central configuration, loaded from environment variables.
Never hardcode secrets here — everything comes from .env (see .env.example).
"""

import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class Config:
    # --- Core ---
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    PORT = int(os.getenv("PORT", 5000))

    # --- Security ---
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY is not set. Copy backend/.env.example to backend/.env "
            "and set a strong random secret before starting the server."
        )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", 60))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 30))
    )
    # Tokens are only accepted from the Authorization header (never from cookies/query),
    # which reduces CSRF exposure for this API-only backend.
    JWT_TOKEN_LOCATION = ["headers"]

    # --- Database ---
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/mindmate_ai")

    # --- CORS ---
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    SECRET_KEY = os.getenv("SECRET_KEY", JWT_SECRET_KEY)
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

    # --- Email ---
    # Provider 1 (recommended): Resend — https://resend.com
    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
    # Provider 2 (fallback): SMTP (Gmail, SendGrid, Outlook, etc.)
    MAIL_SERVER = os.getenv("MAIL_SERVER", "")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@resend.dev")
