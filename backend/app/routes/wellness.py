from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.wellness import get_catalog, history_to_public, list_history, log_completion

wellness_bp = Blueprint("wellness", __name__, url_prefix="/api/wellness")


@wellness_bp.get("")
@jwt_required()
def catalog():
    return jsonify({"activities": get_catalog()})


@wellness_bp.post("/<activity_id>/complete")
@jwt_required()
def complete(activity_id):
    data = request.get_json(silent=True) or {}
    doc = log_completion(get_jwt_identity(), activity_id, data.get("duration_minutes"))
    return jsonify({"completion": history_to_public(doc)}), 201


@wellness_bp.get("/history")
@jwt_required()
def history():
    docs = list_history(get_jwt_identity())
    return jsonify({"history": [history_to_public(d) for d in docs]})
