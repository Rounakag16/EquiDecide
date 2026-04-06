import json
from typing import Any, Dict, Generator

from flask import Blueprint, Response, current_app, jsonify, request, stream_with_context

from core.evaluation_service import (
    assemble_response,
    compute_scoring,
    validate_payload,
)
from core.analytics_store import log_evaluation
from core.ods_engine import BASE_THRESHOLD
from core.llm_explainer import (
    generate_explanation_text,
    retrieve_policy_references,
    stream_explanation_words,
)


dynamic_eval_bp = Blueprint("dynamic_eval", __name__, url_prefix="/api")


@dynamic_eval_bp.route("/evaluate/dynamic", methods=["POST"])
def evaluate_dynamic():
    data = request.get_json()
    ok, err = validate_payload(data)
    if not ok:
        return jsonify({"error": err}), 400

    scoring = compute_scoring(data, current_app.config["MODEL"])
    policy_kb: Dict[str, Any] = current_app.config.get("POLICY_KB", {}) or {}
    policy_refs = retrieve_policy_references(
        ods_reasons=scoring["reasons"], signals=scoring["signals"], policy_kb=policy_kb
    )
    preferred_provider = data.get("preferred_provider", "auto")

    explanation_text, source = generate_explanation_text(
        applicant_name=scoring["name"],
        ods_score=scoring["ods"],
        ods_reasons=scoring["reasons"],
        base_threshold=BASE_THRESHOLD,
        adj_threshold=scoring["adj_threshold"],
        policy_refs=policy_refs,
        policy_kb=policy_kb,
        preferred_provider=preferred_provider,
    )

    response = assemble_response(
        scoring=scoring,
        dynamic_explanation_text=explanation_text,
        policy_references=policy_refs,
    )
    response["mode"] = "dynamic_llm"
    response["explanation_source"] = source
    try:
        log_evaluation(mode="dynamic", response_payload=response)
    except Exception:
        pass
    return jsonify(response), 200


def _sse_event(payload: Dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@dynamic_eval_bp.route("/evaluate/dynamic/stream", methods=["POST"])
def evaluate_dynamic_stream():
    """
    SSE streaming endpoint:
      - Sends a single `result` event with full scores + policy refs
      - Streams `chunk` events word-by-word for explanation_text
    """
    data = request.get_json()
    ok, err = validate_payload(data)
    if not ok:
        return jsonify({"error": err}), 400

    scoring = compute_scoring(data, current_app.config["MODEL"])
    policy_kb: Dict[str, Any] = current_app.config.get("POLICY_KB", {}) or {}
    policy_refs = retrieve_policy_references(
        ods_reasons=scoring["reasons"], signals=scoring["signals"], policy_kb=policy_kb
    )

    preferred_provider = data.get("preferred_provider", "auto")

    explanation_text, source = generate_explanation_text(
        applicant_name=scoring["name"],
        ods_score=scoring["ods"],
        ods_reasons=scoring["reasons"],
        base_threshold=BASE_THRESHOLD,
        adj_threshold=scoring["adj_threshold"],
        policy_refs=policy_refs,
        policy_kb=policy_kb,
        preferred_provider=preferred_provider,
    )

    response_base = assemble_response(
        scoring=scoring,
        dynamic_explanation_text="",  # keep explanation empty; we'll stream it
        policy_references=policy_refs,
    )
    response_base["mode"] = "dynamic_llm_stream"
    response_base["explanation_source"] = source
    try:
        log_evaluation(mode="dynamic_stream", response_payload=response_base)
    except Exception:
        pass

    def event_stream() -> Generator[str, None, None]:
        yield _sse_event({"type": "result", "payload": response_base})

        # Stream explanation in small word chunks for demo readability.
        for word_chunk in stream_explanation_words(explanation_text, max_words_per_chunk=6):
            yield _sse_event({"type": "chunk", "payload": {"text": word_chunk}})

        yield _sse_event({"type": "done", "payload": {"explanation_text": explanation_text}})

    return Response(
        stream_with_context(event_stream()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
