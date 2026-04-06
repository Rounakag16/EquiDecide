import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List


AUDIT_LOG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "inference_audit_log.jsonl",
)


def append_inference_audit(
    *,
    applicant_id: str,
    name: str,
    raw_signals: Dict[str, Any],
    inferred_signals: Dict[str, Any],
    inference_log: List[Dict[str, Any]],
    confidence_score: float,
) -> None:
    try:
        os.makedirs(os.path.dirname(AUDIT_LOG_PATH), exist_ok=True)
        record = {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "applicant_id": applicant_id,
            "name": name,
            "raw_signals": raw_signals,
            "inferred_signals": inferred_signals,
            "inference_log": inference_log,
            "confidence_score": confidence_score,
        }
        with open(AUDIT_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except OSError:
        # Serverless environments can have read-only filesystems.
        # Audit logging should never block inference responses.
        return

