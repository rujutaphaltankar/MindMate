import re

from email_validator import EmailNotValidError, validate_email

PASSWORD_MIN_LENGTH = 8


def validate_registration_payload(data: dict) -> list[str]:
    """Returns a list of human-readable error strings; empty list = valid."""
    errors = []

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if len(name) < 2:
        errors.append("Name must be at least 2 characters long.")

    try:
        validate_email(email, check_deliverability=False)
    except EmailNotValidError:
        errors.append("Please enter a valid email address.")

    if len(password) < PASSWORD_MIN_LENGTH:
        errors.append(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long.")
    elif not re.search(r"[A-Za-z]", password) or not re.search(r"[0-9]", password):
        errors.append("Password must contain both letters and numbers.")

    return errors


def validate_login_payload(data: dict) -> list[str]:
    errors = []
    if not (data.get("email") or "").strip():
        errors.append("Email is required.")
    if not data.get("password"):
        errors.append("Password is required.")
    return errors
