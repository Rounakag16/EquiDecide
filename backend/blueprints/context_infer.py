from flask import Blueprint, jsonify, request

from core.context_extractor import infer_context_signals
from core.inference_audit import append_inference_audit
from core.profile_archetype import classify_profile_archetype


context_infer_bp = Blueprint("context_infer", __name__, url_prefix="/api/context")


@context_infer_bp.route("/infer", methods=["POST"])
def infer_context():
    data = request.get_json() or {}
    applicant_id = str(data.get("applicant_id", "unknown"))
    name = str(data.get("name", "Applicant"))
    raw_signals = data.get("contextual_signals", {}) or {}
    standard = data.get("standard_metrics", {}) or {}

    inferred_signals, inference_log, confidence_score = infer_context_signals(raw_signals)
    archetype = classify_profile_archetype(signals=inferred_signals, standard_metrics=standard)

    append_inference_audit(
        applicant_id=applicant_id,
        name=name,
        raw_signals=raw_signals,
        inferred_signals=inferred_signals,
        inference_log=inference_log,
        confidence_score=confidence_score,
    )

    return (
        jsonify(
            {
                "status": "ok",
                "applicant_id": applicant_id,
                "name": name,
                "inferred_signals": inferred_signals,
                "confidence_score": confidence_score,
                "inference_log": inference_log,
                "profile_archetype": archetype,
            }
        ),
        200,
    )

