from datetime import datetime, timezone

from bson import ObjectId

from app.extensions import db

CATEGORIES = {
    "Student Life", "Stress", "Motivation", "Relationships",
    "Productivity", "Sleep", "General Wellness",
}


def create_post(user_id: str, text: str, category: str, moderation_status: str) -> dict:
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),  # kept for moderation only — never shown publicly
        "text": text.strip(),
        "category": category if category in CATEGORIES else "General Wellness",
        "likes": 0,
        "liked_by": [],
        "comment_count": 0,
        "moderation_status": moderation_status,  # SAFE | REVIEW_REQUIRED | BLOCK
        "created_at": now,
    }
    result = db.community_posts.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def list_posts(category: str | None = None, search: str | None = None, limit: int = 50) -> list[dict]:
    query = {"moderation_status": {"$ne": "BLOCK"}}
    if category:
        query["category"] = category
    if search:
        query["text"] = {"$regex": search, "$options": "i"}
    cursor = db.community_posts.find(query).sort("created_at", -1).limit(limit)
    return list(cursor)


def get_post(post_id: str) -> dict | None:
    try:
        return db.community_posts.find_one({"_id": ObjectId(post_id)})
    except Exception:
        return None


def toggle_like(post_id: str, user_id: str) -> dict | None:
    post = get_post(post_id)
    if not post:
        return None
    liked_by = post.get("liked_by", [])
    if user_id in liked_by:
        db.community_posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$pull": {"liked_by": user_id}, "$inc": {"likes": -1}},
        )
    else:
        db.community_posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$addToSet": {"liked_by": user_id}, "$inc": {"likes": 1}},
        )
    return get_post(post_id)


def delete_post(post_id: str, user_id: str) -> bool:
    result = db.community_posts.delete_one({"_id": ObjectId(post_id), "user_id": ObjectId(user_id)})
    if result.deleted_count:
        db.community_comments.delete_many({"post_id": ObjectId(post_id)})
    return result.deleted_count > 0


def add_comment(post_id: str, user_id: str, text: str, moderation_status: str) -> dict:
    now = datetime.now(timezone.utc)
    doc = {
        "post_id": ObjectId(post_id),
        "user_id": ObjectId(user_id),
        "text": text.strip(),
        "moderation_status": moderation_status,
        "created_at": now,
    }
    result = db.community_comments.insert_one(doc)
    doc["_id"] = result.inserted_id
    db.community_posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"comment_count": 1}})
    return doc


def list_comments(post_id: str) -> list[dict]:
    cursor = db.community_comments.find(
        {"post_id": ObjectId(post_id), "moderation_status": {"$ne": "BLOCK"}}
    ).sort("created_at", 1)
    return list(cursor)


def create_report(post_id: str, reporter_user_id: str, reason: str) -> dict:
    now = datetime.now(timezone.utc)
    doc = {
        "post_id": ObjectId(post_id),
        "reporter_user_id": ObjectId(reporter_user_id),
        "reason": reason.strip()[:500],
        "status": "open",  # open | resolved
        "created_at": now,
    }
    result = db.reports.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def post_to_public(doc: dict, current_user_id: str | None = None) -> dict:
    return {
        "id": str(doc["_id"]),
        "text": doc["text"],
        "category": doc["category"],
        "likes": doc.get("likes", 0),
        "liked_by_me": current_user_id in doc.get("liked_by", []) if current_user_id else False,
        "comment_count": doc.get("comment_count", 0),
        "created_at": doc["created_at"].isoformat(),
        # Deliberately no author name/email — posts are anonymous (spec §16).
    }


def comment_to_public(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "text": doc["text"],
        "created_at": doc["created_at"].isoformat(),
    }
