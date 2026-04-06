import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List


DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
EVAL_LOG_PATH = os.path.join(DATA_DIR, "evaluations_log.jsonl")
FEEDBACK_LOG_PATH = os.path.join(DATA_DIR, "feedback_log.jsonl")


def _append_jsonl(path: str, record: Dict[str, Any]) -> None:
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except OSError:
        # Serverless environments can have read-only filesystems.
        # Logging should not break API behavior.
        return


def log_evaluation(*, mode: str, response_payload: Dict[str, Any]) -> None:
    record = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "applicant_id": response_payload.get("applicant_id"),
        "name": response_payload.get("name"),
        "location_tier": (response_payload.get("inference", {}) or {}).get("inferred_signals", {}).get("location_tier"),
        "profile_archetype": response_payload.get("profile_archetype"),
        "ods_score": (response_payload.get("equidecide_model", {}) or {}).get("opportunity_deficit_score"),
        "traditional_outcome": (response_payload.get("traditional_model", {}) or {}).get("outcome"),
        "equidecide_outcome": (response_payload.get("equidecide_model", {}) or {}).get("outcome"),
        "explanation_source": response_payload.get("explanation_source"),
    }
    _append_jsonl(EVAL_LOG_PATH, record)


def log_feedback(*, applicant_id: str, rating: str, text: str | None = None) -> None:
    record = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "applicant_id": applicant_id,
        "rating": rating,
        "text": text or "",
    }
    _append_jsonl(FEEDBACK_LOG_PATH, record)


def _read_jsonl(path: str) -> Iterable[Dict[str, Any]]:
    if not os.path.exists(path):
        return []
    out: List[Dict[str, Any]] = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except Exception:
                continue
    return out


def compute_analytics() -> Dict[str, Any]:
    evals = list(_read_jsonl(EVAL_LOG_PATH))
    feedback = list(_read_jsonl(FEEDBACK_LOG_PATH))

    total = len(evals)
    disagreements = 0
    by_location: Dict[str, Dict[str, Any]] = {}
    by_archetype: Dict[str, Dict[str, Any]] = {}

    for e in evals:
        loc = e.get("location_tier") or "Unknown"
        arch = e.get("profile_archetype") or "Unknown"
        trad = e.get("traditional_outcome")
        equi = e.get("equidecide_outcome")
        if trad != equi:
            disagreements += 1

        by_location.setdefault(loc, {"count": 0, "equi_admitted": 0, "trad_admitted": 0})
        by_location[loc]["count"] += 1
        if equi == "ADMITTED":
            by_location[loc]["equi_admitted"] += 1
        if trad == "ADMITTED":
            by_location[loc]["trad_admitted"] += 1

        by_archetype.setdefault(arch, {"count": 0, "equi_admitted": 0, "avg_ods": 0.0})
        by_archetype[arch]["count"] += 1
        if equi == "ADMITTED":
            by_archetype[arch]["equi_admitted"] += 1
        ods = e.get("ods_score")
        if isinstance(ods, (int, float)):
            by_archetype[arch]["avg_ods"] += float(ods)

    for arch, v in by_archetype.items():
        if v["count"] > 0:
            v["avg_ods"] = round(v["avg_ods"] / v["count"], 2)

    up = sum(1 for f in feedback if f.get("rating") == "up")
    down = sum(1 for f in feedback if f.get("rating") == "down")

    return {
        "status": "ok",
        "totals": {
            "evaluations": total,
            "disagreement_rate": round(disagreements / total, 3) if total else 0.0,
            "feedback_up": up,
            "feedback_down": down,
        },
        "by_location": by_location,
        "by_archetype": by_archetype,
    }

