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
location = np.random.choice(
    ['tier1', 'tier2', 'tier3'],
    size=N,
    p=[0.30, 0.40, 0.30]
)
is_rural = (location == 'tier3').astype(int)
is_tier2 = (location == 'tier2').astype(int)

# ── 2. First-generation college applicant ─────────────────────────────────────
first_gen = np.random.binomial(1, p=0.40, size=N)

# ── 3. Distance to nearest college (km) ───────────────────────────────────────
distance_km = np.where(
    is_rural,
    np.random.uniform(20, 120, N),
    np.where(
        is_tier2,
        np.random.uniform(5, 40, N),
        np.random.uniform(1, 15, N)
    )
).round(1)

# ── 4. Internet reliability ───────────────────────────────────────────────────
def sample_internet(loc):
    if loc == 'tier1':
        return np.random.choice(
            ['reliable', 'intermittent', 'none'],
            p=[0.75, 0.20, 0.05]
        )
    elif loc == 'tier2':
        return np.random.choice(
            ['reliable', 'intermittent', 'none'],
            p=[0.50, 0.35, 0.15]
        )
    else:
        return np.random.choice(
            ['reliable', 'intermittent', 'none'],
            p=[0.20, 0.35, 0.45]
        )

internet = np.array([sample_internet(l) for l in location])

# ── 5. Academic marks (%) ─────────────────────────────────────────────────────
marks_base    = np.random.normal(loc=65, scale=15, size=N)
marks_penalty = (is_rural * 8) + (first_gen * 5)
marks         = np.clip(marks_base - marks_penalty, 20, 100).round(1)

# ── 6. Annual household income (₹) ───────────────────────────────────────────
income_base    = np.random.normal(loc=45000, scale=25000, size=N)
income_penalty = (is_rural * 12000) + (first_gen * 5000)
income         = np.clip(income_base - income_penalty, 5000, 300000).round(0).astype(int)

# ── 7. Ground truth label ─────────────────────────────────────────────────────
# Traditional biased rule: marks > 60 AND income > 25000
traditional_admit = ((marks > 60) & (income > 25000)).astype(int)

# 8% noise — real-world labelling is never perfect
noise    = np.random.binomial(1, p=0.08, size=N)
admitted = np.abs(traditional_admit - noise)

# ── 8. Assemble ───────────────────────────────────────────────────────────────
df = pd.DataFrame({
    'marks'       : marks,
    'income'      : income,
    'location'    : location,
    'first_gen'   : first_gen,
    'distance_km' : distance_km,
    'internet'    : internet,
    'admitted'    : admitted
})

# ── 9. Save ───────────────────────────────────────────────────────────────────
output_path = 'data/students.csv'
df.to_csv(output_path, index=False)
print(f"✓ Dataset saved to {output_path}")

# ── 10. Sanity checks ─────────────────────────────────────────────────────────
print("\n── Shape ──────────────────────────────────────")
print(f"  Rows: {len(df)}, Columns: {df.shape[1]}")

print("\n── Admission rate by group ────────────────────")
print(f"  Overall   : {df['admitted'].mean():.1%}")
print(f"  Tier 1    : {df[df.location=='tier1']['admitted'].mean():.1%}")
print(f"  Tier 2    : {df[df.location=='tier2']['admitted'].mean():.1%}")
print(f"  Tier 3    : {df[df.location=='tier3']['admitted'].mean():.1%}")
print(f"  First-gen : {df[df.first_gen==1]['admitted'].mean():.1%}")
print(f"  Non first-gen : {df[df.first_gen==0]['admitted'].mean():.1%}")

print("\n── Marks distribution ─────────────────────────")
print(df['marks'].describe().round(1).to_string())

print("\n── Income distribution (₹) ────────────────────")
print(df['income'].describe().round(0).to_string())

print("\n── Internet access breakdown ───────────────────")
print(df['internet'].value_counts().to_string())

print("\n── Location split ──────────────────────────────")
print(df['location'].value_counts().to_string())

print("\n── First-gen rate ──────────────────────────────")
print(f"  {df['first_gen'].mean():.1%}  (NFHS-5 anchor: ~40%)")

print("\n── Bias signal (the story for judges) ─────────")
tier1_rate = df[df.location=='tier1']['admitted'].mean()
tier3_rate = df[df.location=='tier3']['admitted'].mean()
print(f"  Tier1 vs Tier3 admission gap : {(tier1_rate - tier3_rate):.1%}")
print(f"  This gap is what EquiDecide corrects for.")