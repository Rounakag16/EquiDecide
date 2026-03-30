"""
EquiDecide – Baseline Model Trainer
-------------------------------------
Trains a Logistic Regression on academic_score_percentage
+ family_income_monthly_inr ONLY.

This is deliberately the biased baseline — it ignores all
contextual signals (location, first-gen, distance, internet).
That ignorance is the problem EquiDecide solves.

Run once after generate_data.py.
Outputs model/model.pkl — loaded by Flask at runtime.
"""

import pandas as pd
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# ── Load data ──────────────────────────────────────────────────────────────────
df = pd.read_csv('data/students.csv')

# Baseline uses ONLY these two columns — no context whatsoever
X = df[['academic_score_percentage', 'family_income_monthly_inr']]
y = df['admitted']

# ── Train / test split ─────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)

# ── Model pipeline ─────────────────────────────────────────────────────────────
# StandardScaler needed because:
#   academic_score_percentage : 20 – 100
#   family_income_monthly_inr : 400 – 25000
# Very different scales — scaler normalises before LR sees them
model = Pipeline([
    ('scaler',     StandardScaler()),
    ('classifier', LogisticRegression(max_iter=200, random_state=42))
])

model.fit(X_train, y_train)

# ── Evaluation ─────────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)

print("── Model training complete ──────────────────────")
print(f"  Train accuracy : {model.score(X_train, y_train):.1%}")
print(f"  Test accuracy  : {accuracy_score(y_test, y_pred):.1%}")
print("\n── Classification report ────────────────────────")
print(classification_report(
    y_test, y_pred,
    target_names=['Rejected', 'Admitted']
))

# ── Save ───────────────────────────────────────────────────────────────────────
output_path = 'model/model.pkl'
pickle.dump(model, open(output_path, 'wb'))
print(f"✓ Model saved to {output_path}")

# ── Sanity check: the exact hero demo student ──────────────────────────────────
# This mirrors Scenario 1 from your demo script
# Rural, first-gen, low income — traditional model should reject
print("\n── Hero demo student check ──────────────────────")
hero = pd.DataFrame({
    'academic_score_percentage'  : [72.0],
    'family_income_monthly_inr'  : [3000]
})
prob = model.predict_proba(hero)[0][1]
decision = 'Admitted' if prob >= 0.50 else 'Rejected'
print(f"  academic_score=72% | monthly_income=₹3000")
print(f"  Admission probability : {prob:.1%}")
print(f"  At 0.50 threshold     : {decision}")
print(f"  → EquiDecide will correct this in Step 3")