from datetime import datetime, timezone

from bson import ObjectId

from app.extensions import db

ALLOWED_TAGS = {
    "College", "Work", "Family", "Relationships", "Exams",
    "Sleep", "Exercise", "Personal",
}


def create_journal_entry(user_id: str, data: dict) -> dict:
    now = datetime.now(timezone.utc)
    tags = [t for t in (data.get("tags") or []) if t in ALLOWED_TAGS]
    doc = {
        "user_id": ObjectId(user_id),
        "text": (data.get("text") or "").strip(),
        "mood": data.get("mood"),
        "stress": data.get("stress"),
        "energy": data.get("energy"),
        "tags": tags,
        "ai_analysis": None,
        "created_at": now,
        "updated_at": now,
    }
    result = db.journal_entries.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def list_journal_entries(user_id: str, search: str | None = None, tag: str | None = None, limit: int = 100) -> list[dict]:
    query: dict = {"user_id": ObjectId(user_id)}
    if search:
        query["text"] = {"$regex": search, "$options": "i"}
    if tag:
        query["tags"] = tag
    cursor = db.journal_entries.find(query).sort("created_at", -1).limit(limit)
    return list(cursor)


def get_journal_entry(user_id: str, entry_id: str) -> dict | None:
    try:
        return db.journal_entries.find_one(
            {"_id": ObjectId(entry_id), "user_id": ObjectId(user_id)}
        )
    except Exception:
        return None


def update_journal_entry(user_id: str, entry_id: str, data: dict) -> dict | None:
    updates = {}
    if "text" in data:
        updates["text"] = (data.get("text") or "").strip()
    if "tags" in data:
        updates["tags"] = [t for t in (data.get("tags") or []) if t in ALLOWED_TAGS]
    for key in ("mood", "stress", "energy"):
        if key in data:
            updates[key] = data[key]
    if not updates:
        return get_journal_entry(user_id, entry_id)
    updates["updated_at"] = datetime.now(timezone.utc)
    try:
        db.journal_entries.update_one(
            {"_id": ObjectId(entry_id), "user_id": ObjectId(user_id)},
            {"$set": updates},
        )
    except Exception:
        return None
    return get_journal_entry(user_id, entry_id)


def set_journal_analysis(user_id: str, entry_id: str, analysis: dict) -> None:
    db.journal_entries.update_one(
        {"_id": ObjectId(entry_id), "user_id": ObjectId(user_id)},
        {"$set": {"ai_analysis": analysis, "updated_at": datetime.now(timezone.utc)}},
    )


def delete_journal_entry(user_id: str, entry_id: str) -> bool:
    try:
        result = db.journal_entries.delete_one(
            {"_id": ObjectId(entry_id), "user_id": ObjectId(user_id)}
        )
        return result.deleted_count > 0
    except Exception:
        return False


def to_public_dict(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "text": doc.get("text", ""),
        "mood": doc.get("mood"),
        "stress": doc.get("stress"),
        "energy": doc.get("energy"),
        "tags": doc.get("tags", []),
        "ai_analysis": doc.get("ai_analysis"),
        "created_at": doc["created_at"].isoformat(),
        "updated_at": doc["updated_at"].isoformat(),
    }
