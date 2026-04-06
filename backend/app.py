import json
import os
import pickle
import sys

from flask import Flask, jsonify
from flask_cors import CORS

from blueprints.dynamic_eval import dynamic_eval_bp
from blueprints.static_eval import static_eval_bp
from blueprints.context_infer import context_infer_bp
from blueprints.feedback import feedback_bp
from blueprints.analytics import analytics_bp
from blueprints.chat_eval import chat_eval_bp
from core.llm_explainer import get_provider_status
from ods_engine import BASE_THRESHOLD

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Optional: load backend/.env if python-dotenv is installed.
try:
    from dotenv import load_dotenv  # type: ignore

    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except Exception:
    pass


MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model", "model.pkl")
KB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge", "policy_kb.json")


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    try:
        with open(MODEL_PATH, "rb") as model_file:
            model = pickle.load(model_file)
    except FileNotFoundError:
        print("model.pkl not found - expected at backend/model/model.pkl")
        sys.exit(1)

    kb_loaded = False
    kb = {}
    if os.path.exists(KB_PATH):
        with open(KB_PATH, "r", encoding="utf-8") as kb_file:
            kb = json.load(kb_file)
            kb_loaded = True

    app.config["MODEL"] = model
    app.config["POLICY_KB"] = kb
    app.config["POLICY_KB_LOADED"] = kb_loaded

    app.register_blueprint(static_eval_bp)
    app.register_blueprint(dynamic_eval_bp)
    app.register_blueprint(context_infer_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(chat_eval_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify(
            {
                "status": "ok",
                "model_loaded": True,
                "base_threshold": BASE_THRESHOLD,
                "paths": {
                    "static_eval": True,
                    "dynamic_eval_beta": True,
                    "context_extractor_inference": True,
                    "context_infer_endpoint": True,
                },
                "policy_kb_loaded": app.config.get("POLICY_KB_LOADED", False),
                "dynamic_explainer": get_provider_status(),
            }
        )

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(_err):
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()


if __name__ == "__main__":
    print("-" * 45)
    print("  EquiDecide API starting...")
    print("  http://localhost:5000/api/health")
    print("  http://localhost:5000/api/evaluate")
    print("  http://localhost:5000/api/evaluate/dynamic")
    print("-" * 45)
    app.run(debug=True, port=5000)