from typing import Any, Dict


def classify_profile_archetype(
    *, signals: Dict[str, Any], standard_metrics: Dict[str, Any] | None = None
) -> str:
    standard_metrics = standard_metrics or {}
    location = signals.get("location_tier", "Urban")
    first_gen = bool(signals.get("first_generation_student", False))
    internet = signals.get("internet_access_reliability", "High")
    distance = float(signals.get("distance_from_institution_km", 0) or 0)
    income = float(standard_metrics.get("family_income_monthly_inr", 0) or 0)

    if location == "Rural" and first_gen and internet == "Low":
        return "Remote Rural First-Gen"
    if location == "Rural" and distance > 40:
        return "Rural Long-Distance Learner"
    if location == "Semi-Urban" and income < 6000:
        return "Semi-Urban Low-Income Aspirant"
    if location == "Urban" and income < 5000:
        return "Urban Underserved High-Potential"
    if location == "Urban" and income >= 12000 and not first_gen:
        return "Urban High-Access Baseline"
    if first_gen:
        return "First-Gen Resilience Profile"
    return "General Context Profile"

