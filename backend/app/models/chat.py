from datetime import datetime, timezone

from bson import ObjectId

from app.extensions import db


def create_session(user_id: str) -> dict:
    now = datetime.now(timezone.utc)
    doc = {"user_id": ObjectId(user_id), "created_at": now, "updated_at": now}
    result = db.chat_sessions.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def get_session(user_id: str, session_id: str) -> dict | None:
    try:
        return db.chat_sessions.find_one(
            {"_id": ObjectId(session_id), "user_id": ObjectId(user_id)}
        )
    except Exception:
        return None


def list_sessions(user_id: str) -> list[dict]:
    return list(
        db.chat_sessions.find({"user_id": ObjectId(user_id)}).sort("updated_at", -1).limit(50)
    )


def add_message(session_id: str, role: str, content: str, flagged: bool = False) -> dict:
    now = datetime.now(timezone.utc)
    doc = {
        "session_id": ObjectId(session_id),
        "role": role,  # "user" | "assistant"
        "content": content,
        "flagged": flagged,
        "created_at": now,
    }
    result = db.chat_messages.insert_one(doc)
    doc["_id"] = result.inserted_id
    db.chat_sessions.update_one({"_id": ObjectId(session_id)}, {"$set": {"updated_at": now}})
    return doc


def list_messages(session_id: str, limit: int = 50) -> list[dict]:
    cursor = (
        db.chat_messages.find({"session_id": ObjectId(session_id)})
        .sort("created_at", 1)
        .limit(limit)
    )
    return list(cursor)


def message_to_public(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "role": doc["role"],
        "content": doc["content"],
        "created_at": doc["created_at"].isoformat(),
    }
