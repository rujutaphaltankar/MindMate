from datetime import datetime, timezone
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from pymongo.errors import DuplicateKeyError

from app.extensions import db, limiter
from app.models.user import (
    create_user,
    find_user_by_email,
    to_public_dict,
    update_password_by_email,
    verify_password,
)
from app.services.email_service import send_password_reset_email
from app.utils.tokens import generate_password_reset_token, verify_password_reset_token
from app.utils.validators import (
    validate_email_format,
    validate_login_payload,
    validate_password,
    validate_registration_payload,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
@limiter.limit("10 per minute")
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
@limiter.limit("10 per minute")
def login():
    data = request.get_json(silent=True) or {}
    errors = validate_login_payload(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    user_doc = find_user_by_email(data["email"])
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
@jwt_required(verify_type=False)
def logout():
    """
    Revokes the current JWT (access or refresh) by recording its JTI
    in the database blocklist with an automatic expiration TTL.
    """
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    exp = jwt_data.get("exp")
    if jti:
        expires_at = (
            datetime.fromtimestamp(exp, tz=timezone.utc)
            if exp
            else datetime.now(timezone.utc)
        )
        try:
            db.revoked_tokens.insert_one(
                {
                    "jti": jti,
                    "revoked_at": datetime.now(timezone.utc),
                    "expires_at": expires_at,
                }
            )
        except Exception:
            pass  # Already revoked or duplicate key
    return jsonify({"message": "Logged out."})


@auth_bp.post("/forgot-password")
@limiter.limit("5 per minute")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    errors = validate_email_format(email)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    user = find_user_by_email(email)
    if user:
        token = generate_password_reset_token(user["email"])
        frontend_origin = current_app.config.get("FRONTEND_ORIGIN", "http://localhost:5173")
        reset_url = f"{frontend_origin}/reset-password?token={token}"
        send_password_reset_email(user["email"], reset_url)

    # Always return 200 with identical message to avoid account enumeration
    return jsonify(
        {
            "message": "If an account with that email exists, password reset instructions have been sent to your inbox."
        }
    )


@auth_bp.post("/reset-password")
@limiter.limit("5 per minute")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    new_password = data.get("password") or ""

    if not token:
        return jsonify({"error": "Reset token is required."}), 400

    password_errors = validate_password(new_password)
    if password_errors:
        return jsonify({"error": "Validation failed", "details": password_errors}), 400

    email = verify_password_reset_token(token, max_age=1800)  # 30 minutes
    if not email:
        return (
            jsonify(
                {
                    "error": "This password reset link is invalid or has expired. Please request a new one."
                }
            ),
            400,
        )

    user = find_user_by_email(email)
    if not user:
        return (
            jsonify(
                {
                    "error": "Account not found or has been removed."
                }
            ),
            404,
        )

    updated = update_password_by_email(email, new_password)
    if not updated:
        return jsonify({"error": "Unable to update password. Please try again."}), 500

    return jsonify(
        {
            "message": "Your password has been successfully reset. You can now log in with your new password."
        }
    )
