from datetime import datetime, timezone

from bson import ObjectId

from app.extensions import db


def create_mood_record(user_id: str, data: dict) -> dict:
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "mood": int(data["mood"]),
        "stress": int(data["stress"]),
        "energy": int(data["energy"]),
        "sleep_hours": float(data.get("sleep_hours", 0)),
        "note": (data.get("note") or "").strip()[:1000],
        "created_at": now,
        "updated_at": now,
    }
    result = db.mood_records.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def list_mood_records(user_id: str, limit: int = 90) -> list[dict]:
    cursor = (
        db.mood_records.find({"user_id": ObjectId(user_id)})
        .sort("created_at", -1)
        .limit(limit)
    )
    return list(cursor)


def get_mood_record(user_id: str, record_id: str) -> dict | None:
    try:
        return db.mood_records.find_one(
            {"_id": ObjectId(record_id), "user_id": ObjectId(user_id)}
        )
    except Exception:
        return None


def update_mood_record(user_id: str, record_id: str, data: dict) -> dict | None:
    updates = {}
    for key in ("mood", "stress", "energy"):
        if key in data:
            updates[key] = int(data[key])
    if "sleep_hours" in data:
        updates["sleep_hours"] = float(data["sleep_hours"])
    if "note" in data:
        updates["note"] = (data.get("note") or "").strip()[:1000]
    if not updates:
        return get_mood_record(user_id, record_id)
    updates["updated_at"] = datetime.now(timezone.utc)
    try:
        db.mood_records.update_one(
            {"_id": ObjectId(record_id), "user_id": ObjectId(user_id)},
            {"$set": updates},
        )
    except Exception:
        return None
    return get_mood_record(user_id, record_id)


def delete_mood_record(user_id: str, record_id: str) -> bool:
    try:
        result = db.mood_records.delete_one(
            {"_id": ObjectId(record_id), "user_id": ObjectId(user_id)}
        )
        return result.deleted_count > 0
    except Exception:
        return False


def to_public_dict(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "mood": doc["mood"],
        "stress": doc["stress"],
        "energy": doc["energy"],
        "sleep_hours": doc.get("sleep_hours", 0),
        "note": doc.get("note", ""),
        "created_at": doc["created_at"].isoformat(),
        "updated_at": doc["updated_at"].isoformat(),
    }
