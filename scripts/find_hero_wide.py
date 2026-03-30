import pickle
import pandas as pd

m = pickle.load(open('model/model.pkl', 'rb'))

print('── Wide search for prob 42-58% zone ──\n')

candidates = [
    (65.0, 2500), (65.0, 3000), (65.0, 3500),
    (67.0, 2000), (67.0, 2500), (67.0, 3000),
    (70.0, 1800), (70.0, 2000), (70.0, 2200),
    (72.0, 1500), (72.0, 1800), (72.0, 2000),
    (74.0, 1200), (74.0, 1500), (74.0, 1800),
    (60.0, 4000), (60.0, 5000), (60.0, 6000),
    (63.0, 3500), (63.0, 4000), (63.0, 4500),
    (55.0, 6000), (55.0, 7000), (55.0, 8000),
    (58.0, 5000), (58.0, 6000), (58.0, 7000),
]

print(f'  {"score":8} {"income":12} {"prob":8} {"trad":10} {"equi":10} flag')
print(f'  {"-"*65}')
for score, income in candidates:
    test = pd.DataFrame({
        'academic_score_percentage'  : [score],
        'family_income_monthly_inr'  : [income]
    })
    prob = m.predict_proba(test)[0][1]
    trad = 'ADMITTED' if prob >= 0.60 else 'REJECTED'
    equi = 'ADMITTED' if prob >= 0.40 else 'REJECTED'
    flag = '<-- PERFECT' if 0.42 <= prob <= 0.58 else ''
    print(f'  {score:<8} {income:<12} {prob:<8.1%} {trad:<10} {equi:<10} {flag}')