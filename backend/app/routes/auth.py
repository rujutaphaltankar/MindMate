from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from pymongo.errors import DuplicateKeyError

from app.models.user import create_user, find_user_by_email, to_public_dict, verify_password
from app.utils.validators import validate_login_payload, validate_registration_payload

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    errors = validate_registration_payload(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    if find_user_by_email(data["email"]):
        # Deliberately generic message: don't reveal which accounts exist.
        return jsonify({"error": "An account with this email already exists."}), 409

    try:
        user_doc = create_user(data["name"], data["email"], data["password"])
    except DuplicateKeyError:
        return jsonify({"error": "An account with this email already exists."}), 409

    user_id = str(user_doc["_id"])
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return (
        jsonify(
            {
                "user": to_public_dict(user_doc),
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        ),
        201,
    )


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    errors = validate_login_payload(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    user_doc = find_user_by_email(data["email"])
    # Same error for "no such user" and "wrong password" to avoid leaking
    # which emails are registered.
    if not user_doc or not verify_password(data["password"], user_doc["password_hash"]):
        return jsonify({"error": "Invalid email or password."}), 401

    user_id = str(user_doc["_id"])
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return jsonify(
        {
            "user": to_public_dict(user_doc),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    )


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    return jsonify({"access_token": create_access_token(identity=identity)})


@auth_bp.post("/logout")
@jwt_required()
def logout():
    # Stateless JWTs: the client discards its tokens. If a server-side
    # revocation list is needed later, hook it in here.
    return jsonify({"message": "Logged out."})
