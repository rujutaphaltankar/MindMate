"""
Shared extension instances, created once and initialized in app/__init__.py.
Keeping them here (rather than inside create_app) avoids circular imports
when routes/models need access to `db` or `jwt`.
"""

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

jwt = JWTManager()
cors = CORS()

_client: MongoClient | None = None
_db = None  # the real database object, set in init_db()


class _DBProxy:
    """
    Proxies attribute/item access to whatever `_db` currently points to.

    Model/route modules do `from app.extensions import db` at import time,
    which normally binds to whatever `db` was AT THAT MOMENT — a problem if
    `create_app()` (and therefore `init_db()`) runs more than once in the
    same process (e.g. across tests), since re-assigning the module-level
    `db` name wouldn't be seen by modules that already imported it. Because
    this proxy is itself the object that gets imported (never reassigned),
    and it forwards every access to the live `_db`, it stays correct across
    repeated app creation.
    """

    def __getattr__(self, name):
        if _db is None:
            raise RuntimeError("Database not initialized — call init_db() first.")
        return getattr(_db, name)

    def __getitem__(self, name):
        if _db is None:
            raise RuntimeError("Database not initialized — call init_db() first.")
        return _db[name]


db = _DBProxy()


def init_db(mongo_uri: str):
    global _client, _db
    _client = MongoClient(mongo_uri, tz_aware=True)
    _db = _client.get_default_database()

    # Indexes that enforce data integrity / authorization boundaries.
    _db.users.create_index("email", unique=True)
    _db.journal_entries.create_index([("user_id", 1), ("created_at", -1)])
    _db.mood_records.create_index([("user_id", 1), ("created_at", -1)])
    _db.chat_sessions.create_index([("user_id", 1), ("updated_at", -1)])
    _db.chat_messages.create_index([("session_id", 1), ("created_at", 1)])
    _db.activity_history.create_index([("user_id", 1), ("completed_at", -1)])
    _db.community_posts.create_index([("created_at", -1)])
    _db.community_comments.create_index([("post_id", 1), ("created_at", 1)])
    _db.reports.create_index([("status", 1), ("created_at", -1)])

    return db

