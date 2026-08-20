from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.community import (
    CATEGORIES,
    add_comment,
    comment_to_public,
    create_post,
    create_report,
    delete_post,
    get_post,
    list_comments,
    list_posts,
    post_to_public,
    toggle_like,
)
from app.services.safety_service import classify_post

community_bp = Blueprint("community", __name__, url_prefix="/api/community")


@community_bp.get("")
@jwt_required()
def get_posts():
    category = request.args.get("category")
    search = request.args.get("search")
    if category and category not in CATEGORIES:
        category = None
    user_id = get_jwt_identity()
    posts = list_posts(category=category, search=search)
    return jsonify(
        {
            "posts": [post_to_public(p, user_id) for p in posts],
            "categories": sorted(CATEGORIES),
        }
    )


@community_bp.post("")
@jwt_required()
def create_new_post():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "Post text cannot be empty."}), 400
    if len(text) > 2000:
        return jsonify({"error": "Post is too long (2000 character limit)."}), 400

    moderation = classify_post(text)
    if moderation["status"] == "BLOCK":
        return (
            jsonify({"error": "This post can't be published — it may violate community guidelines."}),
            422,
        )

    doc = create_post(get_jwt_identity(), text, data.get("category", "General Wellness"), moderation["status"])
    return jsonify({"post": post_to_public(doc, get_jwt_identity())}), 201


@community_bp.post("/<post_id>/like")
@jwt_required()
def like_post(post_id):
    user_id = get_jwt_identity()
    updated = toggle_like(post_id, user_id)
    if not updated:
        return jsonify({"error": "Post not found."}), 404
    return jsonify({"post": post_to_public(updated, user_id)})


@community_bp.delete("/<post_id>")
@jwt_required()
def remove_post(post_id):
    if not delete_post(post_id, get_jwt_identity()):
        return jsonify({"error": "Post not found or you don't have permission to delete it."}), 404
    return jsonify({"message": "Deleted."})


@community_bp.get("/<post_id>/comments")
@jwt_required()
def get_comments(post_id):
    if not get_post(post_id):
        return jsonify({"error": "Post not found."}), 404
    return jsonify({"comments": [comment_to_public(c) for c in list_comments(post_id)]})


@community_bp.post("/<post_id>/comments")
@jwt_required()
def create_comment(post_id):
    if not get_post(post_id):
        return jsonify({"error": "Post not found."}), 404
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "Comment cannot be empty."}), 400

    moderation = classify_post(text)
    if moderation["status"] == "BLOCK":
        return jsonify({"error": "This comment can't be published."}), 422

    doc = add_comment(post_id, get_jwt_identity(), text, moderation["status"])
    return jsonify({"comment": comment_to_public(doc)}), 201


@community_bp.post("/<post_id>/report")
@jwt_required()
def report_post(post_id):
    if not get_post(post_id):
        return jsonify({"error": "Post not found."}), 404
    data = request.get_json(silent=True) or {}
    create_report(post_id, get_jwt_identity(), data.get("reason", "Not specified"))
    return jsonify({"message": "Report submitted. Thank you for helping keep the community safe."}), 201
