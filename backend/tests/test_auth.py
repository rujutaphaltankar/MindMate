"""
Basic auth flow tests.

Requires `mongomock` (pip install mongomock) so tests don't need a live
MongoDB instance. Run with: pytest
"""

"""
Basic auth flow tests. Shared `app`/`client` fixtures live in conftest.py.
"""


def test_register_creates_user(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Rujuta", "email": "rujuta@example.com", "password": "wellness123"},
    )
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["user"]["email"] == "rujuta@example.com"
    assert "password" not in body["user"]
    assert "password_hash" not in body["user"]
    assert body["access_token"]


def test_register_duplicate_email_rejected(client):
    payload = {"name": "Rujuta", "email": "dup@example.com", "password": "wellness123"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409


def test_register_weak_password_rejected(client):
    resp = client.post(
        "/api/auth/register",
        json={"name": "Rujuta", "email": "weak@example.com", "password": "abc"},
    )
    assert resp.status_code == 400


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={"name": "Rujuta", "email": "login@example.com", "password": "wellness123"},
    )
    resp = client.post(
        "/api/auth/login", json={"email": "login@example.com", "password": "wellness123"}
    )
    assert resp.status_code == 200
    assert resp.get_json()["access_token"]


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={"name": "Rujuta", "email": "wrong@example.com", "password": "wellness123"},
    )
    resp = client.post(
        "/api/auth/login", json={"email": "wrong@example.com", "password": "nope12345"}
    )
    assert resp.status_code == 401


def test_profile_requires_auth(client):
    resp = client.get("/api/user/profile")
    assert resp.status_code == 401


def test_profile_returns_current_user(client):
    reg = client.post(
        "/api/auth/register",
        json={"name": "Rujuta", "email": "profile@example.com", "password": "wellness123"},
    )
    token = reg.get_json()["access_token"]
    resp = client.get("/api/user/profile", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.get_json()["user"]["email"] == "profile@example.com"
