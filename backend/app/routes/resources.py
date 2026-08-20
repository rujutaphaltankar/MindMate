from flask import Blueprint, jsonify, request

from app.services.resource_service import list_resources

resources_bp = Blueprint("resources", __name__, url_prefix="/api/resources")


@resources_bp.get("")
def get_resources():
    country = request.args.get("country")
    category = request.args.get("category")
    return jsonify({"resources": list_resources(country=country, category=category)})
