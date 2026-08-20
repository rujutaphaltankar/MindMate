from bson import ObjectId
from flask import Blueprint, jsonify, request

from app.extensions import db
from app.services.resource_service import create_resource, delete_resource
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/stats")
@admin_required
def stats():
    # Aggregate counts only — admins never get direct access to private
    # journal content (spec §18).
    return jsonify(
        {
            "total_users": db.users.count_documents({}),
            "total_journal_entries": db.journal_entries.count_documents({}),
            "community_posts": db.community_posts.count_documents({}),
            "reported_posts": db.reports.count_documents({}),
            "flagged_content": db.community_posts.count_documents(
                {"moderation_status": "REVIEW_REQUIRED"}
            ),
            "wellness_activities_completed": db.activity_history.count_documents({}),
        }
    )


@admin_bp.get("/reports")
@admin_required
def list_reports():
    status = request.args.get("status", "open")
    reports = list(db.reports.find({"status": status}).sort("created_at", -1).limit(100))
    result = []
    for r in reports:
        post = db.community_posts.find_one({"_id": r["post_id"]})
        result.append(
            {
                "id": str(r["_id"]),
                "reason": r["reason"],
                "status": r["status"],
                "created_at": r["created_at"].isoformat(),
                "post": {
                    "id": str(post["_id"]),
                    "text": post["text"],
                    "moderation_status": post["moderation_status"],
                }
                if post
                else None,
            }
        )
    return jsonify({"reports": result})


@admin_bp.put("/reports/<report_id>")
@admin_required
def resolve_report(report_id):
    data = request.get_json(silent=True) or {}
    action = data.get("action")  # "dismiss" | "remove_post"

    try:
        report = db.reports.find_one({"_id": ObjectId(report_id)})
    except Exception:
        report = None
    if not report:
        return jsonify({"error": "Report not found."}), 404

    if action == "remove_post":
        db.community_posts.update_one(
            {"_id": report["post_id"]}, {"$set": {"moderation_status": "BLOCK"}}
        )

    db.reports.update_one({"_id": ObjectId(report_id)}, {"$set": {"status": "resolved"}})
    return jsonify({"message": "Report resolved."})


@admin_bp.get("/resources")
@admin_required
def get_all_resources():
    docs = list(db.resources.find({}))
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return jsonify({"resources": docs})


@admin_bp.post("/resources")
@admin_required
def add_resource():
    data = request.get_json(silent=True) or {}
    if not data.get("name"):
        return jsonify({"error": "Resource name is required."}), 400
    doc = create_resource(data)
    return jsonify({"resource": doc}), 201


@admin_bp.delete("/resources/<resource_id>")
@admin_required
def remove_resource(resource_id):
    if not delete_resource(resource_id):
        return jsonify({"error": "Resource not found."}), 404
    return jsonify({"message": "Deleted."})
