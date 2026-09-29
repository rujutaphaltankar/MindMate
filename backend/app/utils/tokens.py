"""
Cryptographic token utilities for password resets and verification links.
Uses itsdangerous to create cryptographically signed, timestamped tokens.
"""

from flask import current_app
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer


def _get_serializer() -> URLSafeTimedSerializer:
    secret = (
        current_app.config.get("SECRET_KEY")
        or current_app.config.get("JWT_SECRET_KEY")
        or "default-secret-salt"
    )
    return URLSafeTimedSerializer(secret, salt="mindmate-password-reset")


def generate_password_reset_token(email: str) -> str:
    """Generates a URL-safe signed token carrying the user's email."""
    serializer = _get_serializer()
    return serializer.dumps(email.strip().lower())


def verify_password_reset_token(token: str, max_age: int = 1800) -> str | None:
    """
    Validates a password reset token.
    Returns the email if the token is authentic and within max_age (default: 30 minutes / 1800s),
    or None if invalid or expired.
    """
    serializer = _get_serializer()
    try:
        email = serializer.loads(token, max_age=max_age)
        return str(email).strip().lower()
    except (SignatureExpired, BadSignature, Exception):
        return None
