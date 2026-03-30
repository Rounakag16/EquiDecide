from flask import Blueprint, jsonify

from core.analytics_store import compute_analytics


analytics_bp = Blueprint("analytics", __name__, url_prefix="/api")


@analytics_bp.route("/analytics", methods=["GET"])
def analytics():
    return jsonify(compute_analytics()), 200

