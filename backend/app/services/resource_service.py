"""
Crisis / wellness resource directory (spec §11, §12).

Resources are stored in MongoDB (the `resources` collection) so they can be
managed from the admin dashboard rather than hard-coded in the frontend.
`seed_default_resources()` seeds a small starting set on first run — replace
these with verified, up-to-date resources for your deployment region before
going to production. Never invent crisis phone numbers.
"""

from bson import ObjectId

from app.extensions import db

DEFAULT_RESOURCES = [
    {
        "name": "988 Suicide & Crisis Lifeline",
        "description": "Free, confidential support for people in distress, 24/7.",
        "country": "US",
        "phone": "988",
        "website": "https://988lifeline.org",
        "availability": "24/7",
        "category": "crisis",
    },
    {
        "name": "iCall Psychosocial Helpline",
        "description": "Telephone and email-based counselling support.",
        "country": "IN",
        "phone": "9152987821",
        "website": "https://icallhelpline.org",
        "availability": "Mon–Sat, 10am–8pm IST",
        "category": "crisis",
    },
    {
        "name": "Samaritans",
        "description": "Confidential emotional support for anyone in distress.",
        "country": "UK",
        "phone": "116 123",
        "website": "https://www.samaritans.org",
        "availability": "24/7",
        "category": "crisis",
    },
    {
        "name": "Find a therapist",
        "description": "Directory of licensed mental health professionals.",
        "country": "Global",
        "phone": "",
        "website": "https://www.psychologytoday.com",
        "availability": "N/A",
        "category": "professional_directory",
    },
]


def seed_default_resources() -> None:
    if db.resources.count_documents({}) == 0:
        db.resources.insert_many(DEFAULT_RESOURCES)


def list_resources(country: str | None = None, category: str | None = None) -> list[dict]:
    query = {}
    if country:
        query["country"] = {"$in": [country, "Global"]}
    if category:
        query["category"] = category
    docs = list(db.resources.find(query))
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


def create_resource(data: dict) -> dict:
    doc = {k: data.get(k, "") for k in (
        "name", "description", "country", "phone", "website", "availability", "category"
    )}
    result = db.resources.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


def delete_resource(resource_id: str) -> bool:
    try:
        result = db.resources.delete_one({"_id": ObjectId(resource_id)})
        return result.deleted_count > 0
    except Exception:
        return False
