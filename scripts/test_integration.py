import pickle, pandas as pd, sys
sys.path.append('backend')
from ods_engine import (calculate_ods, adjust_threshold,
                        build_explanation, calculate_equity_index,
                        calculate_historical_approval_rate, BASE_THRESHOLD)

m = pickle.load(open('model/model.pkl', 'rb'))

scenarios = [
    {
        'name'   : 'Ravi Kumar',
        'metrics': {'academic_score_percentage': 72.0,
                    'family_income_monthly_inr': 2000},
        'signals': {'location_tier': 'Rural',
                    'first_generation_student': True,
                    'distance_from_institution_km': 65,
                    'internet_access_reliability': 'Low'}
    },
    {
        'name'   : 'Priya Sharma',
        'metrics': {'academic_score_percentage': 85.0,
                    'family_income_monthly_inr': 18000},
        'signals': {'location_tier': 'Urban',
                    'first_generation_student': False,
                    'distance_from_institution_km': 4,
                    'internet_access_reliability': 'High'}
    },
    {
        'name'   : 'Anjali Devi',
        'metrics': {'academic_score_percentage': 63.0,
                    'family_income_monthly_inr': 4500},
        'signals': {'location_tier': 'Rural',
                    'first_generation_student': True,
                    'distance_from_institution_km': 80,
                    'internet_access_reliability': 'Low'}
    },
]

print('=' * 60)
print('  EQUIDECIDE — FINAL INTEGRATION TEST')
print('=' * 60)

all_pass = True

for s in scenarios:
    test      = pd.DataFrame([s['metrics']])
    prob      = m.predict_proba(test)[0][1]
    outcome_a = prob >= BASE_THRESHOLD
    ods, reasons  = calculate_ods(s['signals'])
    adj_t         = adjust_threshold(ods)
    outcome_b     = prob >= adj_t
    equity        = calculate_equity_index(ods, outcome_a, outcome_b)
    explanation   = build_explanation(
                        reasons, BASE_THRESHOLD, adj_t, ods, s['name'])
    hist_rate     = calculate_historical_approval_rate(
                        s['signals']['location_tier'])

    trad_str  = 'ADMITTED' if outcome_a else 'REJECTED'
    equi_str  = 'ADMITTED' if outcome_b else 'REJECTED'
    flipped   = outcome_a != outcome_b

    print(f"\n  Student        : {s['name']}")
    print(f"  Probability    : {prob:.1%}")
    print(f"  Traditional    : {trad_str} (threshold {BASE_THRESHOLD:.0%})")
    print(f"  EquiDecide     : {equi_str} (threshold {adj_t:.0%})")
    print(f"  ODS            : {round(ods*100)}/100")
    print(f"  Equity Index   : {equity}")
    print(f"  Hist. rate     : {hist_rate:.0%}")
    print(f"  Explanation    : {explanation}")

    # Validate expected outcomes
    if s['name'] == 'Priya Sharma':
        passed = not flipped
        status = 'PASS' if passed else 'FAIL'
        print(f"  Test           : [{status}] Both models should agree")
    else:
        passed = flipped and outcome_b
        status = 'PASS' if passed else 'FAIL'
        print(f"  Test           : [{status}] Should flip REJECTED -> ADMITTED")

    if not passed:
        all_pass = False

print(f"\n{'=' * 60}")
print(f"  Overall result : {'ALL TESTS PASS - BACKEND READY' if all_pass else 'FAILURES FOUND - DO NOT PROCEED'}")
print(f"{'=' * 60}")