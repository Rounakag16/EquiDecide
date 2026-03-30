import pickle, pandas as pd

m = pickle.load(open('model/model.pkl', 'rb'))

candidates = [
    {'academic_score_percentage': 64.0, 'family_income_monthly_inr': 2200},
    {'academic_score_percentage': 58.0, 'family_income_monthly_inr': 2800},
    {'academic_score_percentage': 67.0, 'family_income_monthly_inr': 1800},
    {'academic_score_percentage': 70.0, 'family_income_monthly_inr': 1500},
    {'academic_score_percentage': 62.0, 'family_income_monthly_inr': 2500},
]

print("── Testing Hero Candidates ──")
for c in candidates:
    test = pd.DataFrame([c])
    prob = m.predict_proba(test)[0][1]
    decision = 'Admitted' if prob >= 0.50 else 'REJECTED'
    print(f"  score={c['academic_score_percentage']}% | income=₹{c['family_income_monthly_inr']}/mo -> {prob:.1%} -> {decision}")