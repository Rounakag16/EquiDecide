from flask import Blueprint, jsonify, request

from core.analytics_store import log_feedback


feedback_bp = Blueprint("feedback", __name__, url_prefix="/api")


@feedback_bp.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json() or {}
    applicant_id = str(data.get("applicant_id", "")).strip()
    rating = str(data.get("rating", "")).strip().lower()
    text = str(data.get("text", "")).strip() if data.get("text") is not None else ""

    if not applicant_id:
        return jsonify({"error": "Missing applicant_id"}), 400
    if rating not in {"up", "down"}:
        return jsonify({"error": "rating must be 'up' or 'down'"}), 400

    log_feedback(applicant_id=applicant_id, rating=rating, text=text)
    return jsonify({"status": "ok"}), 200

