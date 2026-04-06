from flask import Blueprint, jsonify, request
import json
from core.llm_explainer import generate_interview_chat

chat_eval_bp = Blueprint("chat_eval", __name__, url_prefix="/api/chat")

@chat_eval_bp.route("/message", methods=["POST"])
def chat_message():
    data = request.get_json() or {}
    messages = data.get("messages", [])
    provider = data.get("preferred_provider", "auto")

    # The last message of the user was just added to messages by the frontend.
    # We send it to the LLM explainer to get the structured json response.
    try:
        response_json = generate_interview_chat(messages, preferred_provider=provider)
        return jsonify(response_json), 200
    except Exception as e:
        # Fallback if parsing fails or something goes wrong
        return jsonify({
            "status": "continue",
            "reply": "I'm having a little trouble understanding. Could you repeat that?",
            "extracted_data": {}
        }), 500
