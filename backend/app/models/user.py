"""
User document helpers.

MongoDB is schemaless, so this module is the single source of truth for the
shape of a `users` document and for turning it into a safe (no password hash)
dict before it ever reaches the frontend.
"""

from datetime import datetime, timezone

import bcrypt
from bson import ObjectId

from app.extensions import db


def hash_password(plain_password: str) -> bytes:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())


def verify_password(plain_password: str, password_hash: bytes) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash)


def create_user(name: str, email: str, password: str) -> dict:
    now = datetime.now(timezone.utc)
    user_doc = {
        "name": name.strip(),
        "email": email.strip().lower(),
        "password_hash": hash_password(password),
        "role": "user",  # "user" | "admin"
        "privacy_settings": {
            "allow_ai_analysis": False,
            "allow_anonymous_analytics": False,
        },
        "created_at": now,
        "updated_at": now,
    }
    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


def find_user_by_email(email: str) -> dict | None:
    return db.users.find_one({"email": email.strip().lower()})


def find_user_by_id(user_id: str) -> dict | None:
    try:
        return db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def to_public_dict(user_doc: dict) -> dict:
    """Strip sensitive fields before a user document leaves the backend."""
    if not user_doc:
        return {}
    return {
        "id": str(user_doc["_id"]),
        "name": user_doc.get("name"),
        "email": user_doc.get("email"),
        "role": user_doc.get("role", "user"),
        "privacy_settings": user_doc.get(
            "privacy_settings",
            {"allow_ai_analysis": False, "allow_anonymous_analytics": False},
        ),
        "created_at": user_doc.get("created_at").isoformat()
        if user_doc.get("created_at")
        else None,
    }
