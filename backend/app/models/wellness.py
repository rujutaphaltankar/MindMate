from datetime import datetime, timezone

from bson import ObjectId

from app.extensions import db

ACTIVITY_CATALOG = [
    {"id": "breathing-478", "type": "breathing", "title": "4-7-8 Breathing", "duration_minutes": 3},
    {"id": "meditation-2min", "type": "meditation", "title": "2-Minute Reset", "duration_minutes": 2},
    {"id": "meditation-5min", "type": "meditation", "title": "5-Minute Calm", "duration_minutes": 5},
    {"id": "meditation-focus", "type": "meditation", "title": "Focus Session", "duration_minutes": 8},
    {"id": "meditation-relax", "type": "meditation", "title": "Relaxation", "duration_minutes": 10},
    {"id": "meditation-sleep", "type": "meditation", "title": "Sleep Preparation", "duration_minutes": 10},
    {"id": "meditation-mindfulness", "type": "meditation", "title": "Mindfulness Check-in", "duration_minutes": 5},
]


def get_catalog() -> list[dict]:
    return ACTIVITY_CATALOG


def log_completion(user_id: str, activity_id: str, duration_minutes: float | None = None) -> dict:
    activity = next((a for a in ACTIVITY_CATALOG if a["id"] == activity_id), None)
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "activity_id": activity_id,
        "activity_type": activity["type"] if activity else "custom",
        "duration": duration_minutes or (activity["duration_minutes"] if activity else 0),
        "completed_at": now,
    }
    result = db.activity_history.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def list_history(user_id: str, limit: int = 100) -> list[dict]:
    cursor = (
        db.activity_history.find({"user_id": ObjectId(user_id)})
        .sort("completed_at", -1)
        .limit(limit)
    )
    return list(cursor)


def history_to_public(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "activity_id": doc["activity_id"],
        "activity_type": doc["activity_type"],
        "duration": doc["duration"],
        "completed_at": doc["completed_at"].isoformat(),
    }
