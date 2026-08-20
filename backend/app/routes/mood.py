from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.mood import (
    create_mood_record,
    delete_mood_record,
    get_mood_record,
    list_mood_records,
    to_public_dict,
    update_mood_record,
)

mood_bp = Blueprint("mood", __name__, url_prefix="/api/mood")


def _validate_range(value, name, errors):
    try:
        v = int(value)
        if not (1 <= v <= 10):
            errors.append(f"{name} must be between 1 and 10.")
    except (TypeError, ValueError):
        errors.append(f"{name} is required and must be a number 1-10.")


@mood_bp.post("")
@jwt_required()
def record_mood():
    data = request.get_json(silent=True) or {}
    errors = []
    for field in ("mood", "stress", "energy"):
        _validate_range(data.get(field), field.capitalize(), errors)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    doc = create_mood_record(get_jwt_identity(), data)
    return jsonify({"record": to_public_dict(doc)}), 201


@mood_bp.get("")
@jwt_required()
def get_mood_history():
    limit = min(int(request.args.get("limit", 90)), 365)
    records = list_mood_records(get_jwt_identity(), limit=limit)
    return jsonify({"records": [to_public_dict(r) for r in records]})


@mood_bp.put("/<record_id>")
@jwt_required()
def edit_mood(record_id):
    data = request.get_json(silent=True) or {}
    updated = update_mood_record(get_jwt_identity(), record_id, data)
    if not updated:
        return jsonify({"error": "Mood record not found."}), 404
    return jsonify({"record": to_public_dict(updated)})


@mood_bp.delete("/<record_id>")
@jwt_required()
def remove_mood(record_id):
    existing = get_mood_record(get_jwt_identity(), record_id)
    if not existing:
        return jsonify({"error": "Mood record not found."}), 404
    delete_mood_record(get_jwt_identity(), record_id)
    return jsonify({"message": "Deleted."})
