from flask import Blueprint, current_app, jsonify, request

from core.analytics_store import log_evaluation
from core.evaluation_service import evaluate_payload, validate_payload


static_eval_bp = Blueprint("static_eval", __name__, url_prefix="/api")


@static_eval_bp.route("/evaluate", methods=["POST"])
def evaluate_static():
    data = request.get_json()
    ok, err = validate_payload(data)
    if not ok:
        return jsonify({"error": err}), 400

    response = evaluate_payload(data, current_app.config["MODEL"])
    try:
        log_evaluation(mode="static", response_payload=response)
    except Exception:
        pass
    return jsonify(response), 200
