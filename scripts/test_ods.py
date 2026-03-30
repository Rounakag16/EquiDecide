"""
Quick test — run all 3 hero scenarios through the ODS engine.
Expected: Scenario 1 and 3 get corrected. Scenario 2 does not.
"""
import sys
sys.path.append('backend')

from ods_engine import (
    calculate_ods,
    adjust_threshold,
    build_explanation,
    calculate_equity_index,
    BASE_THRESHOLD
)

scenarios = [
    {
        "name": "Scenario 1 — Ravi Kumar (Resilient Rural)",
        "signals": {
            "location_tier"                : "Rural",
            "first_generation_student"     : True,
            "distance_from_institution_km" : 65,
            "internet_access_reliability"  : "Low"
        }
    },
    {
        "name": "Scenario 2 — Priya Sharma (No correction)",
        "signals": {
            "location_tier"                : "Urban",
            "first_generation_student"     : False,
            "distance_from_institution_km" : 4,
            "internet_access_reliability"  : "High"
        }
    },
    {
        "name": "Scenario 3 — Anjali Devi (Hidden Topper)",
        "signals": {
            "location_tier"                : "Rural",
            "first_generation_student"     : True,
            "distance_from_institution_km" : 80,
            "internet_access_reliability"  : "Low"
        }
    }
]

for s in scenarios:
    ods, reasons = calculate_ods(s['signals'])
    adj_t        = adjust_threshold(ods)
    explanation  = build_explanation(reasons, BASE_THRESHOLD, adj_t, ods, "The applicant")
    equity       = calculate_equity_index(ods, False, ods > 0)

    print(f"\n{'─'*55}")
    print(f"  {s['name']}")
    print(f"{'─'*55}")
    print(f"  ODS score         : {ods:.2f} ({round(ods*100)}/100)")
    print(f"  Base threshold    : {BASE_THRESHOLD:.0%}")
    print(f"  Adjusted threshold: {adj_t:.0%}")
    print(f"  Factors           : {reasons}")
    print(f"  Equity index      : {equity}")
    print(f"\n  Explanation:")
    print(f"  {explanation}")