from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.journal import (
    ALLOWED_TAGS,
    create_journal_entry,
    delete_journal_entry,
    get_journal_entry,
    list_journal_entries,
    set_journal_analysis,
    to_public_dict,
    update_journal_entry,
)
from app.models.user import find_user_by_id
from app.services.ai_service import AIServiceError, analyze_text

journal_bp = Blueprint("journal", __name__, url_prefix="/api/journal")


@journal_bp.post("")
@jwt_required()
def create_entry():
    data = request.get_json(silent=True) or {}
    if not (data.get("text") or "").strip():
        return jsonify({"error": "Journal text cannot be empty."}), 400

    user_id = get_jwt_identity()
    doc = create_journal_entry(user_id, data)

    # AI analysis only runs if the user has opted in (spec §9, §19).
    if data.get("analyze"):
        user = find_user_by_id(user_id)
        if user and user.get("privacy_settings", {}).get("allow_ai_analysis"):
            try:
                analysis = analyze_text(data["text"])
                set_journal_analysis(user_id, str(doc["_id"]), analysis)
                doc["ai_analysis"] = analysis
            except AIServiceError:
                pass  # entry is already saved; analysis is best-effort

    return jsonify({"entry": to_public_dict(doc)}), 201


@journal_bp.get("")
@jwt_required()
def list_entries():
    search = request.args.get("search")
    tag = request.args.get("tag")
    if tag and tag not in ALLOWED_TAGS:
        tag = None
    entries = list_journal_entries(get_jwt_identity(), search=search, tag=tag)
    return jsonify({"entries": [to_public_dict(e) for e in entries], "available_tags": sorted(ALLOWED_TAGS)})


@journal_bp.get("/<entry_id>")
@jwt_required()
def get_entry(entry_id):
    doc = get_journal_entry(get_jwt_identity(), entry_id)
    if not doc:
        return jsonify({"error": "Journal entry not found."}), 404
    return jsonify({"entry": to_public_dict(doc)})


@journal_bp.put("/<entry_id>")
@jwt_required()
def edit_entry(entry_id):
    data = request.get_json(silent=True) or {}
    updated = update_journal_entry(get_jwt_identity(), entry_id, data)
    if not updated:
        return jsonify({"error": "Journal entry not found."}), 404
    return jsonify({"entry": to_public_dict(updated)})


@journal_bp.delete("/<entry_id>")
@jwt_required()
def remove_entry(entry_id):
    existing = get_journal_entry(get_jwt_identity(), entry_id)
    if not existing:
        return jsonify({"error": "Journal entry not found."}), 404
    delete_journal_entry(get_jwt_identity(), entry_id)
    return jsonify({"message": "Deleted."})
