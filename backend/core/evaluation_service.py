from typing import Any, Dict, List, Tuple

import pandas as pd

from core.ods_engine import (
    BASE_THRESHOLD,
    adjust_threshold,
    build_explanation,
    calculate_equity_index,
    calculate_historical_approval_rate,
    calculate_ods,
)
from core.context_extractor import infer_context_signals
from core.inference_audit import append_inference_audit
from core.profile_archetype import classify_profile_archetype


def validate_payload(data: Dict[str, Any]) -> Tuple[bool, str]:
    if not data:
        return False, "No JSON body received"

    standard = data.get("standard_metrics", {})
    academic_score = standard.get("academic_score_percentage")
    monthly_income = standard.get("family_income_monthly_inr")

    if academic_score is None or monthly_income is None:
        return False, "Missing required fields: academic_score_percentage, family_income_monthly_inr"

    signals = data.get("contextual_signals", {})
    location = signals.get("location_tier")
    if not location:
        return False, "Missing required field: location_tier"

    return True, ""


def compute_scoring(data: Dict[str, Any], model: Any) -> Dict[str, Any]:
    applicant_id = data.get("applicant_id", "unknown")
    name = data.get("name", "Applicant")

    standard = data.get("standard_metrics", {})
    raw_signals = data.get("contextual_signals", {})
    signals, inference_log, confidence_score = infer_context_signals(raw_signals)

    features = pd.DataFrame(
        {
            "academic_score_percentage": [
                float(standard.get("academic_score_percentage"))
            ],
            "family_income_monthly_inr": [float(standard.get("family_income_monthly_inr"))],
        }
    )

    prob = float(model.predict_proba(features)[0][1])
    outcome_a = prob >= BASE_THRESHOLD

    ods, reasons = calculate_ods(signals)
    adj_threshold = adjust_threshold(ods)
    outcome_b = prob >= adj_threshold

    traditional_reason = (
        "Academic score and income meet the required threshold."
        if outcome_a
        else "Academic score and income fall below the required threshold."
    )

    equity = calculate_equity_index(ods, outcome_a, outcome_b)
    hist_rate = calculate_historical_approval_rate(signals.get("location_tier", "Urban"))
    archetype = classify_profile_archetype(signals=signals, standard_metrics=standard)

    append_inference_audit(
        applicant_id=str(applicant_id),
        name=str(name),
        raw_signals=raw_signals,
        inferred_signals=signals,
        inference_log=inference_log,
        confidence_score=confidence_score,
    )

    return {
        "applicant_id": applicant_id,
        "name": name,
        "signals": signals,
        "prob": prob,
        "outcome_a": outcome_a,
        "outcome_b": outcome_b,
        "ods": ods,
        "reasons": reasons,
        "adj_threshold": adj_threshold,
        "traditional_reason": traditional_reason,
        "equity": equity,
        "hist_rate": hist_rate,
        "inference_log": inference_log,
        "inference_confidence": confidence_score,
        "inferred_signals": signals,
        "archetype": archetype,
    }


def assemble_response(
    *,
    scoring: Dict[str, Any],
    dynamic_explanation_text: str | None = None,
    policy_references: list[Dict[str, str]] | None = None,
) -> Dict[str, Any]:
    applicant_id = scoring["applicant_id"]
    name = scoring["name"]
    prob = scoring["prob"]
    outcome_a = scoring["outcome_a"]
    outcome_b = scoring["outcome_b"]
    ods = scoring["ods"]
    reasons = scoring["reasons"]
    adj_threshold = scoring["adj_threshold"]
    traditional_reason = scoring["traditional_reason"]

    equity = scoring["equity"]
    hist_rate = scoring["hist_rate"]

    # Fallback explanation uses the deterministic ODS explanation generator.
    deterministic_explanation = build_explanation(
        reasons, BASE_THRESHOLD, adj_threshold, ods, name
    )
    # Allow callers to intentionally set an empty explanation for streaming UX.
    if dynamic_explanation_text is None:
        explanation_text = deterministic_explanation
    else:
        explanation_text = dynamic_explanation_text

    response: Dict[str, Any] = {
        "applicant_id": applicant_id,
        "name": name,
        "traditional_model": {
            "outcome": "ADMITTED" if outcome_a else "REJECTED",
            "probability_score": round(prob, 3),
            "threshold_required": BASE_THRESHOLD,
            "decision_reason": traditional_reason,
        },
        "equidecide_model": {
            "outcome": "ADMITTED" if outcome_b else "REJECTED",
            "probability_score": round(prob, 3),
            "threshold_required": round(adj_threshold, 3),
            "opportunity_deficit_score": round(ods * 100),
            "context_applied": reasons,
            "explanation_text": explanation_text,
        },
        "metrics": {
            "equity_index": equity,
            "historical_group_approval_rate": hist_rate,
        },
        "inference": {
            "confidence_score": scoring.get("inference_confidence", 1.0),
            "inference_log": scoring.get("inference_log", []),
            "inferred_signals": scoring.get("inferred_signals", {}),
        },
        "profile_archetype": scoring.get("archetype", "General Context Profile"),
    }

    if policy_references is not None:
        response["policy_references"] = policy_references

    return response


def evaluate_payload(
    data: Dict[str, Any],
    model: Any,
    dynamic_explanation_text: str | None = None,
    policy_references: list[Dict[str, str]] | None = None,
) -> Dict[str, Any]:
    scoring = compute_scoring(data, model)
    return assemble_response(
        scoring=scoring,
        dynamic_explanation_text=dynamic_explanation_text,
        policy_references=policy_references,
    )
