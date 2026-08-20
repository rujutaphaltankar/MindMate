from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from bson import ObjectId

privacy_bp = Blueprint("privacy", __name__, url_prefix="/api/privacy")


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
