import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017/mindmate_ai_test")
os.environ.setdefault("AI_PROVIDER", "rule_based")

import mongomock
import pytest

from app import create_app
from app import extensions
from app.config import Config


@pytest.fixture
def app(monkeypatch):
    monkeypatch.setattr(extensions, "MongoClient", mongomock.MongoClient)

    class TestConfig(Config):
        DEBUG = True

    application = create_app(TestConfig)
    application.config.update({"TESTING": True})

    # Fresh slate each test even though the proxy correctly points at this
    # app's db — mongomock's fake "server" is keyed by host:port, so a
    # same-named database persists data across tests unless cleared.
    from app.extensions import db as _db

    for name in _db.list_collection_names():
        _db.drop_collection(name)

    from app.services.resource_service import seed_default_resources

    seed_default_resources()

    yield application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_client(client):
    """Returns (client, headers, user_id) for a freshly registered user."""
    resp = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "wellness123"},
    )
    body = resp.get_json()
    headers = {"Authorization": f"Bearer {body['access_token']}"}
    return client, headers, body["user"]["id"]
