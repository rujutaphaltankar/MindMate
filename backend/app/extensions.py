"""
Shared extension instances, created once and initialized in app/__init__.py.
Keeping them here (rather than inside create_app) avoids circular imports
when routes/models need access to `db` or `jwt`.
"""

import atexit
import os
import pickle
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

jwt = JWTManager()
cors = CORS()

_client: MongoClient | None = None
_db = None  # the real database object, set in init_db()
_is_persistent_mock = False
_persist_filepath = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data", "mindmate_local_db.pkl")
)


class _DBProxy:
    """
    Proxies attribute/item access to whatever `_db` currently points to.
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


def save_persistent_mock_db(db_instance=None, filepath=_persist_filepath):
    """Saves all documents in the in-memory database to a local pickle file."""
    target_db = db_instance or _db
    if target_db is None:
        return
    # If target_db is wrapped in _PersistentDatabaseWrapper, get raw db
    if isinstance(target_db, _PersistentDatabaseWrapper):
        target_db = target_db._raw_db

    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        data = {}
        for coll_name in target_db.list_collection_names():
            if coll_name.startswith("system."):
                continue
            data[coll_name] = list(target_db[coll_name].find())
        with open(filepath, "wb") as f:
            pickle.dump(data, f)
    except Exception as e:
        print(f"Error persisting database snapshot: {e}")


def load_persistent_mock_db(db_instance=None, filepath=_persist_filepath):
    """Loads documents from a local pickle file into the database."""
    target_db = db_instance or _db
    if target_db is None or not os.path.exists(filepath):
        return
    if isinstance(target_db, _PersistentDatabaseWrapper):
        target_db = target_db._raw_db

    try:
        with open(filepath, "rb") as f:
            data = pickle.load(f)
        for coll_name, docs in data.items():
            if docs and target_db[coll_name].count_documents({}) == 0:
                target_db[coll_name].insert_many(docs)
        print(f"Successfully loaded persistent database from: {filepath}")
    except Exception as e:
        print(f"Error loading persistent database snapshot: {e}")


class _PersistentCollectionWrapper:
    """Wraps a collection so mutating operations trigger auto-saving to disk."""
    MUTATING_METHODS = {
        "insert_one", "insert_many", "update_one", "update_many",
        "replace_one", "delete_one", "delete_many",
        "find_one_and_update", "find_one_and_delete", "find_one_and_replace",
        "drop", "bulk_write"
    }

    def __init__(self, collection, db_raw, filepath):
        self._coll = collection
        self._db_raw = db_raw
        self._filepath = filepath

    def __getattr__(self, name):
        attr = getattr(self._coll, name)
        if callable(attr) and name in self.MUTATING_METHODS:
            def wrapper(*args, **kwargs):
                res = attr(*args, **kwargs)
                save_persistent_mock_db(self._db_raw, self._filepath)
                return res
            return wrapper
        return attr

    def __getitem__(self, name):
        return self._coll[name]


class _PersistentDatabaseWrapper:
    """Wraps a database so collection accesses return _PersistentCollectionWrapper."""
    def __init__(self, db_instance, filepath):
        self._raw_db = db_instance
        self._filepath = filepath

    def __getattr__(self, name):
        attr = getattr(self._raw_db, name)
        if hasattr(attr, "insert_one"):  # It's a collection object
            return _PersistentCollectionWrapper(attr, self._raw_db, self._filepath)
        return attr

    def __getitem__(self, name):
        coll = self._raw_db[name]
        return _PersistentCollectionWrapper(coll, self._raw_db, self._filepath)


def init_db(mongo_uri: str):
    global _client, _db, _is_persistent_mock

    import pymongo
    from pymongo.errors import ServerSelectionTimeoutError

    use_mock = False
    is_test_env = "mongomock" in mongo_uri.lower() or os.environ.get("FLASK_ENV") == "testing"

    if is_test_env:
        use_mock = True
        _is_persistent_mock = False
    else:
        try:
            print(f"Connecting to MongoDB at: {mongo_uri} ...")
            test_client = pymongo.MongoClient(mongo_uri, tz_aware=True, serverSelectionTimeoutMS=1500)
            test_client.server_info()
            _client = test_client
            _db = _client.get_default_database()
            _is_persistent_mock = False
            print("Successfully connected to MongoDB server.")
        except ServerSelectionTimeoutError:
            print("\n" + "=" * 80)
            print(f"WARNING: Could not connect to MongoDB at: {mongo_uri}")
            print("FALLING BACK to local persistent file database (data/mindmate_local_db.pkl).")
            print(f"Data file location: {_persist_filepath}")
            print("=" * 80 + "\n")
            use_mock = True
            _is_persistent_mock = True

    if use_mock:
        import mongomock
        _client = mongomock.MongoClient(mongo_uri, tz_aware=True)
        raw_db = _client.get_default_database()

        if _is_persistent_mock:
            load_persistent_mock_db(raw_db, _persist_filepath)
            _db = _PersistentDatabaseWrapper(raw_db, _persist_filepath)
            atexit.register(save_persistent_mock_db, raw_db, _persist_filepath)
        else:
            _db = raw_db

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


