from datetime import datetime, timezone
from flask import Blueprint, jsonify, make_response
from flask_jwt_extended import get_jwt_identity, jwt_required
from bson import ObjectId

from app.extensions import db

privacy_bp = Blueprint("privacy", __name__, url_prefix="/api/privacy")


def _sanitize_doc(doc: dict) -> dict:
    """Helper to convert ObjectIds and datetimes to serializable types."""
    if not doc:
        return {}
    cleaned = {}
    for k, v in doc.items():
        if k == "password_hash":
            continue
        if isinstance(v, ObjectId):
            cleaned[k] = str(v)
        elif isinstance(v, datetime):
            cleaned[k] = v.isoformat()
        elif isinstance(v, list):
            cleaned[k] = [
                str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, datetime)
                else _sanitize_doc(item) if isinstance(item, dict)
                else item
                for item in v
            ]
        elif isinstance(v, dict):
            cleaned[k] = _sanitize_doc(v)
        else:
            cleaned[k] = v
    return cleaned


@privacy_bp.get("/export")
@jwt_required()
def export_user_data():
    """
    Exports all data belonging to the authenticated user for GDPR/CCPA compliance.
    Includes profile, journals, mood entries, activities, chat history, and community interactions.
    """
    user_id = get_jwt_identity()
    oid = ObjectId(user_id)

    user = db.users.find_one({"_id": oid})
    if not user:
        return jsonify({"error": "User not found."}), 404

    journal_entries = list(db.journal_entries.find({"user_id": oid}).sort("created_at", -1))
    mood_records = list(db.mood_records.find({"user_id": oid}).sort("created_at", -1))
    activity_history = list(db.activity_history.find({"user_id": oid}).sort("completed_at", -1))
    community_posts = list(db.community_posts.find({"user_id": oid}).sort("created_at", -1))
    community_comments = list(db.community_comments.find({"user_id": oid}).sort("created_at", -1))

    # Retrieve chat sessions and their messages
    chat_sessions = list(db.chat_sessions.find({"user_id": oid}).sort("created_at", -1))
    chat_history = []
    for s in chat_sessions:
        s_id = s["_id"]
        messages = list(db.chat_messages.find({"session_id": s_id}).sort("created_at", 1))
        sanitized_session = _sanitize_doc(s)
        sanitized_session["messages"] = [_sanitize_doc(m) for m in messages]
        chat_history.append(sanitized_session)

    export_payload = {
        "export_metadata": {
            "application": "MindMate AI",
            "version": "1.0",
            "scope": "GDPR / CCPA User Data Subject Access Request Export",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
        },
        "user_profile": _sanitize_doc(user),
        "mood_records": [_sanitize_doc(m) for m in mood_records],
        "journal_entries": [_sanitize_doc(j) for j in journal_entries],
        "activity_history": [_sanitize_doc(a) for a in activity_history],
        "chat_sessions": chat_history,
        "community_posts": [_sanitize_doc(p) for p in community_posts],
        "community_comments": [_sanitize_doc(c) for c in community_comments],
    }

    response = make_response(jsonify(export_payload))
    response.headers["Content-Disposition"] = "attachment; filename=mindmate_data_export.json"
    response.headers["Content-Type"] = "application/json"
    return response


@privacy_bp.delete("/journal")
@jwt_required()
def delete_all_journal_data():
    user_id = get_jwt_identity()
    result = db.journal_entries.delete_many({"user_id": ObjectId(user_id)})
    db.mood_records.delete_many({"user_id": ObjectId(user_id)})
    return jsonify({"message": f"Deleted {result.deleted_count} journal entries and all mood records."})


@privacy_bp.delete("/account")
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    oid = ObjectId(user_id)
    db.journal_entries.delete_many({"user_id": oid})
    db.mood_records.delete_many({"user_id": oid})
    db.activity_history.delete_many({"user_id": oid})
    db.community_posts.delete_many({"user_id": oid})
    db.community_comments.delete_many({"user_id": oid})
    sessions = list(db.chat_sessions.find({"user_id": oid}))
    for s in sessions:
        db.chat_messages.delete_many({"session_id": s["_id"]})
    db.chat_sessions.delete_many({"user_id": oid})
    db.users.delete_one({"_id": oid})
    return jsonify({"message": "Account and all associated data deleted."})
