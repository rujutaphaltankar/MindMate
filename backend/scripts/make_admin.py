"""
CLI helper to promote an existing user to admin.

Usage:
    cd backend
    python scripts/make_admin.py user@example.com
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.extensions import db
from app.models.user import find_user_by_email

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/make_admin.py <email>")
        sys.exit(1)

    email = sys.argv[1]
    app = create_app()
    with app.app_context():
        user = find_user_by_email(email)
        if not user:
            print(f"No user found with email {email}")
            sys.exit(1)
        db.users.update_one({"_id": user["_id"]}, {"$set": {"role": "admin"}})
        print(f"{email} is now an admin.")
