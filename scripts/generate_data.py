"""
EquiDecide – Synthetic Dataset Generator
-----------------------------------------
Generates 1,000 student records that statistically mirror
NFHS-5 (National Family Health Survey, India) aggregates.

Key anchors from NFHS-5 used:
  - Rural internet penetration : ~31%  → modelled via location tier
  - First-generation students  : ~40%  → first_gen probability = 0.40
  - Rural + semi-urban share   : ~70%  → tier2 + tier3 combined = 0.70

Run once. Commit the CSV. Never regenerate mid-hackathon.
"""

import numpy as np
import pandas as pd

# ── Reproducibility ────────────────────────────────────────────────────────────
SEED = 42
np.random.seed(SEED)
N = 1000

# ── 1. Location tier ──────────────────────────────────────────────────────────
# CHANGED: values now match schema vocabulary
location = np.random.choice(
    ['Urban', 'Semi-Urban', 'Rural'],   # was: tier1, tier2, tier3
    size=N,
    p=[0.30, 0.40, 0.30]
)
is_rural = (location == 'Rural').astype(int)
is_semiurban = (location == 'Semi-Urban').astype(int)

# ── 2. First-generation college applicant ─────────────────────────────────────
# CHANGED: column name matches schema
first_generation_student = np.random.binomial(1, p=0.40, size=N)  # was: first_gen

# ── 3. Distance to nearest college (km) ───────────────────────────────────────
# CHANGED: column name matches schema
distance_from_institution_km = np.where(               # was: distance_km
    is_rural,
    np.random.uniform(20, 120, N),
    np.where(
        is_semiurban,
        np.random.uniform(5, 40, N),
        np.random.uniform(1, 15, N)
    )
).round(1)

# ── 4. Internet reliability ───────────────────────────────────────────────────
# CHANGED: values now match schema vocabulary
def sample_internet(loc):
    if loc == 'Urban':
        return np.random.choice(
            ['High', 'Medium', 'Low'],    # was: reliable, intermittent, none
            p=[0.75, 0.20, 0.05]
        )
    elif loc == 'Semi-Urban':
        return np.random.choice(
            ['High', 'Medium', 'Low'],
            p=[0.50, 0.35, 0.15]
        )
    else:  # Rural
        return np.random.choice(
            ['High', 'Medium', 'Low'],
            p=[0.20, 0.35, 0.45]
        )

internet_access_reliability = np.array([sample_internet(l) for l in location])  # was: internet

# ── 5. Academic marks (%) ─────────────────────────────────────────────────────
# CHANGED: column name matches schema
marks_base    = np.random.normal(loc=65, scale=15, size=N)
marks_penalty = (is_rural * 8) + (first_generation_student * 5)
academic_score_percentage = np.clip(               # was: marks
    marks_base - marks_penalty, 20, 100
).round(1)

# ── 6. Annual household income ────────────────────────────────────────────────
# CHANGED: column name + converted to MONTHLY to match schema
income_base    = np.random.normal(loc=45000, scale=25000, size=N)
income_penalty = (is_rural * 12000) + (first_generation_student * 5000)
income_annual  = np.clip(income_base - income_penalty, 5000, 300000)
family_income_monthly_inr = (income_annual / 12).round(0).astype(int)  # was: income (annual)

# ── 7. Ground truth label ─────────────────────────────────────────────────────
# CHANGED: thresholds updated to monthly income
traditional_admit = (
    (academic_score_percentage > 60) & (family_income_monthly_inr > 2000)
).astype(int)

noise    = np.random.binomial(1, p=0.08, size=N)
admitted = np.abs(traditional_admit - noise)

# ── 8. Assemble ───────────────────────────────────────────────────────────────
# CHANGED: all column names match schema fields exactly
df = pd.DataFrame({
    'academic_score_percentage'  : academic_score_percentage,
    'family_income_monthly_inr'  : family_income_monthly_inr,
    'location_tier'              : location,
    'first_generation_student'   : first_generation_student,
    'distance_from_institution_km': distance_from_institution_km,
    'internet_access_reliability' : internet_access_reliability,
    'admitted'                   : admitted
})

# ── 9. Save ───────────────────────────────────────────────────────────────────
output_path = 'data/students.csv'
df.to_csv(output_path, index=False)
print(f"✓ Dataset saved to {output_path}")

# ── 10. Sanity checks ─────────────────────────────────────────────────────────
print("\n── Shape ──────────────────────────────────────")
print(f"  Rows: {len(df)}, Columns: {df.shape[1]}")

print("\n── Admission rate by group ────────────────────")
print(f"  Overall      : {df['admitted'].mean():.1%}")
print(f"  Urban        : {df[df.location_tier=='Urban']['admitted'].mean():.1%}")
print(f"  Semi-Urban   : {df[df.location_tier=='Semi-Urban']['admitted'].mean():.1%}")
print(f"  Rural        : {df[df.location_tier=='Rural']['admitted'].mean():.1%}")
print(f"  First-gen    : {df[df.first_generation_student==1]['admitted'].mean():.1%}")

print("\n── Income (monthly ₹) ─────────────────────────")
print(df['family_income_monthly_inr'].describe().round(0).to_string())

print("\n── Internet access breakdown ───────────────────")
print(df['internet_access_reliability'].value_counts().to_string())

print("\n── Location split ──────────────────────────────")
print(df['location_tier'].value_counts().to_string())

print("\n── Bias signal (the story for judges) ─────────")
urban_rate = df[df.location_tier=='Urban']['admitted'].mean()
rural_rate = df[df.location_tier=='Rural']['admitted'].mean()
print(f"  Urban vs Rural admission gap : {(urban_rate - rural_rate):.1%}")
print(f"  This gap is what EquiDecide corrects for.")