from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.user import find_user_by_id


def admin_required(fn):
    """Requires a valid JWT AND role == 'admin'. Never grants access to
    private journal content — see routes/admin.py for what admins can see."""

    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = find_user_by_id(get_jwt_identity())
        if not user or user.get("role") != "admin":
            return jsonify({"error": "Admin access required."}), 403
        return fn(*args, **kwargs)

    return wrapper
