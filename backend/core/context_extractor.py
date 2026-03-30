from typing import Any, Dict, List, Tuple


LOCATION_ALIASES = {
    "urban": "Urban",
    "city": "Urban",
    "metro": "Urban",
    "suburban": "Semi-Urban",
    "semi-urban": "Semi-Urban",
    "town": "Semi-Urban",
    "small town": "Semi-Urban",
    "near town": "Semi-Urban",
    "rural": "Rural",
    "village": "Rural",
}

INTERNET_ALIASES = {
    "high": "High",
    "good": "High",
    "medium": "Medium",
    "average": "Medium",
    "low": "Low",
    "poor": "Low",
}


def _to_bool(value: Any, fallback: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value != 0
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}
    return fallback


def _coerce_float(value: Any, fallback: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return fallback
        return float(value)
    except (TypeError, ValueError):
        return fallback


def infer_context_signals(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]], float]:
    """
    Phase-3 inference engine.
    Returns (normalized_signals, inference_log, confidence_score_0_to_1).
    """
    raw = raw or {}
    inference_log: List[Dict[str, Any]] = []

    location_raw = str(raw.get("location_tier", "")).strip().lower()
    location_text = str(raw.get("location_text", "")).strip().lower()
    location_hint = location_raw or location_text
    location_tier = LOCATION_ALIASES.get(location_hint, raw.get("location_tier"))
    if not location_tier:
        location_tier = "Urban"
        inference_log.append(
            {
                "field": "location_tier",
                "inferred_value": location_tier,
                "rule": "default_to_urban_when_missing",
                "confidence": 0.45,
            }
        )
    elif location_hint in LOCATION_ALIASES and location_hint != str(raw.get("location_tier", "")).strip().lower():
        inference_log.append(
            {
                "field": "location_tier",
                "inferred_value": location_tier,
                "rule": "normalize_fuzzy_location_phrase",
                "confidence": 0.8,
            }
        )

    distance_val = _coerce_float(
        raw.get("distance_from_institution_km", raw.get("distance_from_hq_km", None)),
        fallback=-1,
    )
    if distance_val < 0:
        distance_val = 35.0 if location_tier == "Rural" else 12.0
        inference_log.append(
            {
                "field": "distance_from_institution_km",
                "inferred_value": distance_val,
                "rule": "estimate_distance_from_location_tier",
                "confidence": 0.55,
            }
        )

    internet_raw = str(raw.get("internet_reliability", "")).strip().lower()
    internet_access_reliability = INTERNET_ALIASES.get(internet_raw, raw.get("internet_reliability"))
    if not internet_access_reliability:
        if location_tier == "Rural" and distance_val > 50:
            internet_access_reliability = "Low"
            inference_log.append(
                {
                    "field": "internet_access_reliability",
                    "inferred_value": "Low",
                    "rule": "rural_and_far_distance_bias_safe_default",
                    "confidence": 0.78,
                }
            )
        elif location_tier in {"Rural", "Semi-Urban"}:
            internet_access_reliability = "Medium"
            inference_log.append(
                {
                    "field": "internet_access_reliability",
                    "inferred_value": "Medium",
                    "rule": "location_based_default",
                    "confidence": 0.62,
                }
            )
        else:
            internet_access_reliability = "High"
            inference_log.append(
                {
                    "field": "internet_access_reliability",
                    "inferred_value": "High",
                    "rule": "urban_default",
                    "confidence": 0.6,
                }
            )

    first_gen_val = raw.get("first_generation_student", raw.get("first_generation", None))
    if first_gen_val is None:
        first_generation_student = False
        inference_log.append(
            {
                "field": "first_generation_student",
                "inferred_value": False,
                "rule": "default_false_when_missing",
                "confidence": 0.5,
            }
        )
    else:
        first_generation_student = _to_bool(first_gen_val, fallback=False)

    normalized = {
        "location_tier": location_tier,
        "first_generation_student": first_generation_student,
        "distance_from_institution_km": float(distance_val),
        "internet_access_reliability": internet_access_reliability,
    }

    if not inference_log:
        confidence_score = 1.0
    else:
        confidence_score = round(sum(item["confidence"] for item in inference_log) / len(inference_log), 2)

    return normalized, inference_log, confidence_score


def extract_context_signals(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Phase-1 stub normalizer.
    Accepts partial/fuzzy signal payloads and returns a normalized dict.
    """
    normalized, _, _ = infer_context_signals(raw)
    return normalized
