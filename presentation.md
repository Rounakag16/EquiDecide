# EquiDecide — Presentation Script
## Women Techies Hackathon 2026

---

## 🎬 Slide 1: The Hook (30 seconds)

**"Meet Ravi."**

Ravi scored 60% in his exams. He lives in a Tier-3 rural village. He's the first in his family to apply to college. His nearest internet café is 65km away.

**An AI system looks at his 60% and says: REJECTED.**

It never asked *why* his score was 60%. It never asked what 60% *means* when you're studying by candlelight with no internet.

**EquiDecide does.**

---

## 📊 Slide 2: The Problem (1 minute)

### Traditional AI is Blind — Not Fair

- ML models apply **uniform thresholds** (e.g., 60% cutoff)
- **Context is invisible**: rural location, first-generation status, internet access — none of it factors in
- **NFHS-5 data** shows rural students have 26% approval rates vs 44% urban — the algorithm reproduces systemic inequality

### The result?
> Students who *demonstrate resilience* by scoring near the threshold despite massive structural barriers are filtered out identically to those who simply underperformed with full resources.

---

## ✨ Slide 3: Our Solution — The ODS Framework (2 minutes)

### Opportunity Deficit Score (ODS)

A **transparent, deterministic, and auditable** scoring mechanism (0–100):

| Signal | Weight | Source |
|---|---|---|
| Rural Location | 25% | NFHS-5 access gap data |
| First-Generation Student | 20% | No family networks or guidance |
| Distance >30km | 15% | Travel burden to institution |
| Low Internet Access | 20% | Digital divide impact |

### Dynamic Threshold Adjustment

```
Standard threshold : 60%
Ravi's ODS         : 80 (high disadvantage)
Adjusted threshold : 40% (reduction capped at 25 points)
Ravi's probability : 49%
Result             : ✅ APPROVED by EquiDecide (still rejected by Traditional AI)
```

### Key Design Principles
1. **Every weight is a documented policy decision** — not a black box
2. **Every reason is human-readable** — judges can audit every decision
3. **The correction is capped** — we never over-correct (floor = 35%)
4. **Same inputs → same output** — fully deterministic

---

## 🖥️ Slide 4: Live Demo (3 minutes)

### Demo Route: `/demo` — Side-by-Side Comparison

1. **Select Scenario**: Rural First-Gen (Ravi Kumar) vs Urban Baseline (Priya Sharma)
2. **Select Mode**: Both (Compare)
3. **Click Run Evaluation**

**What judges will see:**

| | Traditional AI | EquiDecide |
|---|---|---|
| **Ravi Kumar** | ❌ REJECTED (Score: 49%, Threshold: 60%) | ✅ APPROVED (Score: 49%, Threshold: 40%) |
| **Priya Sharma** | ✅ APPROVED (Score: 87%, Threshold: 60%) | ✅ APPROVED (Score: 87%, Threshold: 60%) |

> "Notice: EquiDecide doesn't change Priya's outcome — it only intervenes where context reveals structural barriers."

### Dynamic Route: `/dynamic` — Full Interactive Evaluation

1. Complete the 3-step form with custom data
2. Watch the **streaming explanation** appear word-by-word
3. See the **Equity Index Gauge** and **Policy References**
4. Submit fairness feedback

---

## 🔧 Slide 5: Technical Architecture (1 minute)

### Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask + scikit-learn + Gemini API
- **Design**: "Doodly Brutalism" — playful but functional

### Backend Pipeline
```
Request → Validate → Context Inference → Scoring Engine
  → ODS Calculation → Threshold Adjustment → LLM Explanation
  → Policy KB Grounding → SSE Streaming → Response
```

### LLM Integration (Gemini 2.5 Flash)
- **Primary**: Google Gemini API for rich, contextual explanations
- **Fallback**: Deterministic KB-based explanation (always works offline)
- **Grounding**: Explanations cite policy references from an education knowledge base

### Context Inference Engine
- Accepts **partial data** — infers missing signals intelligently
- Location aliases: "village" → Rural, "metro" → Urban
- Profile archetypes: "Rural First-Gen Limited Access", "Urban Baseline Standard"
- Full inference audit trail for transparency

---

## 🎯 Slide 6: Key Differentiators (30 seconds)

| What Others Do | What EquiDecide Does |
|---|---|
| Black-box "fairness" | Transparent, auditable ODS with documented weights |
| Post-hoc bias detection | Pre-decision context injection |
| Complex retraining | Simple threshold adjustment — no model changes |
| No explanation | LLM-generated human-readable reasoning |
| Single outcome | Side-by-side comparison showing exact correction |

---

## 💡 Slide 7: Impact & Future Vision (30 seconds)

### Immediate Impact
- Makes AI screening **equitable** without lowering standards
- Works for any threshold-based system: scholarships, loans, admissions, hiring

### Future Roadmap
- **Phase 3**: Multi-modal context (voice interviews, document analysis)
- **Production Deployment**: Real institution partnerships for pilot testing
- **Policy Integration**: NFHS-5 and census data for live ODS weight calibration
- **Regulatory Compliance**: EU AI Act and India's DPDP Act alignment

---

## 🗣️ Slide 8: Closing

> "EquiDecide doesn't lower the bar. It levels the ground."

Every decision is auditable. Every correction is explainable. Every student deserves context.

**Try it now →** `http://localhost:5173/demo`

---

## Q&A Preparation

### "How do you decide the ODS weights?"
Each weight comes from documented NFHS-5 access gap data. Rural locations have a 25% weight because NFHS-5 shows the widest infrastructure gap for education access in Tier-3 districts. Every weight is a conscious policy decision.

### "Isn't this just lowering standards?"
No. The threshold floor is 35% — we never approve below that. We're not changing what "capable" means; we're recognizing that traditional scoring doesn't measure capability fairly when structural barriers exist.

### "What if someone games the system?"
Every inference is logged. The Inference Debug Panel shows exactly which signals were provided vs. inferred. In production, signals would be verified against census/pincode databases.

### "Why not just retrain a better model?"
Because the bias isn't in the model — it's in the threshold. A logistic regression trained on biased historical data will learn biased patterns. Our approach leaves the model untouched and corrects at the decision boundary.

### "Can this work for other domains?"
Yes. Any threshold-based screening system: scholarship allocation, microfinance approval, job application filtering. The ODS weights would be domain-specific but the framework is universal.
