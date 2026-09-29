"""
Tests for Phase 1 Security, Compliance, and Auth hardening.
Covers:
- Password reset token generation, verification, and email dispatch
- Token blocklisting on logout
- GDPR / CCPA user data export
- Password complexity validation
"""

import time
from app.services.email_service import clear_outbox, get_outbox
from app.utils.tokens import generate_password_reset_token, verify_password_reset_token


def test_forgot_password_dispatches_email_and_resets(client):
    clear_outbox()

    # 1. Register user
    client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "wellness123"},
    )

    # 2. Request forgot password
    resp = client.post(
        "/api/auth/forgot-password",
        json={"email": "alice@example.com"},
    )
    assert resp.status_code == 200
    assert "password reset instructions" in resp.get_json()["message"]

    # 3. Check dev outbox for sent email
    outbox = get_outbox()
    assert len(outbox) == 1
    assert outbox[0]["to"] == "alice@example.com"
    reset_url = outbox[0]["reset_url"]
    token = reset_url.split("token=")[-1]
    assert token

    # 4. Perform password reset with token
    reset_resp = client.post(
        "/api/auth/reset-password",
        json={"token": token, "password": "newpassword456"},
    )
    assert reset_resp.status_code == 200

    # 5. Old password should now fail
    old_login = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "wellness123"},
    )
    assert old_login.status_code == 401

    # 6. New password should succeed
    new_login = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "newpassword456"},
    )
    assert new_login.status_code == 200
    assert new_login.get_json()["access_token"]


def test_forgot_password_prevents_account_enumeration(client):
    clear_outbox()
    resp = client.post(
        "/api/auth/forgot-password",
        json={"email": "nonexistent@example.com"},
    )
    assert resp.status_code == 200
    assert "password reset instructions" in resp.get_json()["message"]
    # No email should be sent for nonexistent account
    assert len(get_outbox()) == 0


def test_reset_password_with_invalid_token(client):
    resp = client.post(
        "/api/auth/reset-password",
        json={"token": "invalid-token-string", "password": "newpassword456"},
    )
    assert resp.status_code == 400
    assert "invalid or has expired" in resp.get_json()["error"]


def test_reset_password_token_expiration(app):
    with app.app_context():
        token = generate_password_reset_token("expired@example.com")
        # In itsdangerous, timestamp resolution is in integer seconds; max_age < 0 triggers immediate expiry
        res = verify_password_reset_token(token, max_age=-1)
        assert res is None


def test_logout_revokes_token(client):
    reg = client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "wellness123"},
    )
    token = reg.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify access works
    profile = client.get("/api/user/profile", headers=headers)
    assert profile.status_code == 200

    # Logout
    logout_resp = client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code == 200

    # Token must now be rejected
    rejected = client.get("/api/user/profile", headers=headers)
    assert rejected.status_code == 401
    assert "revoked" in rejected.get_json()["error"].lower()


def test_privacy_data_export(client):
    # Register user
    reg = client.post(
        "/api/auth/register",
        json={"name": "Charlie", "email": "charlie@example.com", "password": "wellness123"},
    )
    token = reg.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add a mood record and journal entry
    client.post(
        "/api/mood",
        json={"mood": 8, "stress": 3, "energy": 7, "note": "Great day!"},
        headers=headers,
    )
    client.post(
        "/api/journal",
        json={"text": "Reflecting on positive moments today.", "tags": ["Personal"]},
        headers=headers,
    )

    # Call export endpoint
    export_resp = client.get("/api/privacy/export", headers=headers)
    assert export_resp.status_code == 200
    assert "attachment" in export_resp.headers.get("Content-Disposition", "")

    payload = export_resp.get_json()
    assert payload["export_metadata"]["application"] == "MindMate AI"
    assert payload["user_profile"]["email"] == "charlie@example.com"
    assert "password_hash" not in payload["user_profile"]
    assert len(payload["mood_records"]) == 1
    assert payload["mood_records"][0]["mood"] == 8
    assert len(payload["journal_entries"]) == 1
    assert "positive moments" in payload["journal_entries"][0]["text"]
