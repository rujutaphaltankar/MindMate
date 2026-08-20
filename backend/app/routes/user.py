from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.user import find_user_by_id, to_public_dict

user_bp = Blueprint("user", __name__, url_prefix="/api/user")


@user_bp.get("/profile")
@jwt_required()
def get_profile():
    user_doc = find_user_by_id(get_jwt_identity())
    if not user_doc:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": to_public_dict(user_doc)})


@user_bp.put("/profile")
@jwt_required()
def update_profile():
    data = request.get_json(silent=True) or {}
    updates = {}

    if "name" in data:
        name = (data["name"] or "").strip()
        if len(name) < 2:
            return jsonify({"error": "Name must be at least 2 characters long."}), 400
        updates["name"] = name

    if "privacy_settings" in data and isinstance(data["privacy_settings"], dict):
        allowed_keys = {"allow_ai_analysis", "allow_anonymous_analytics"}
        settings = {
            k: bool(v) for k, v in data["privacy_settings"].items() if k in allowed_keys
        }
        for key, value in settings.items():
            updates[f"privacy_settings.{key}"] = value

    if not updates:
        return jsonify({"error": "No valid fields to update."}), 400

    updates["updated_at"] = datetime.now(timezone.utc)

    from bson import ObjectId

    db.users.update_one({"_id": ObjectId(get_jwt_identity())}, {"$set": updates})
    user_doc = find_user_by_id(get_jwt_identity())
    return jsonify({"user": to_public_dict(user_doc)})
