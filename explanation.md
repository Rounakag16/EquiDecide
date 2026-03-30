# EquiDecide — Full Technical Explanation

> **Every feature, concept, and design decision explained in depth.**
> Women Techies Hackathon 2026 · GDG VIT Vellore

---

## Table of Contents

1. [Core Problem & Motivation](#1-core-problem--motivation)
2. [The Opportunity Deficit Score (ODS) Engine](#2-the-opportunity-deficit-score-ods-engine)
3. [Dynamic Threshold Adjustment](#3-dynamic-threshold-adjustment)
4. [Machine Learning Model](#4-machine-learning-model)
5. [Context Inference Engine](#5-context-inference-engine)
6. [Profile Archetypes](#6-profile-archetypes)
7. [LLM Explainability (Gemini Integration)](#7-llm-explainability-gemini-integration)
8. [Policy Knowledge Base & Grounding](#8-policy-knowledge-base--grounding)
9. [Streaming UX with Server-Sent Events (SSE)](#9-streaming-ux-with-server-sent-events-sse)
10. [Frontend Architecture](#10-frontend-architecture)
11. [UI/UX Design System — "Doodly Brutalism"](#11-uiux-design-system--doodly-brutalism)
12. [Custom Cursor & Click Animation System](#12-custom-cursor--click-animation-system)
13. [Side-by-Side Comparison Engine](#13-side-by-side-comparison-engine)
14. [Equity Index Dashboard](#14-equity-index-dashboard)
15. [Analytics & Feedback System](#15-analytics--feedback-system)
16. [Demo Mode & Scenario System](#16-demo-mode--scenario-system)
17. [API Architecture](#17-api-architecture)
18. [Security & Auditability](#18-security--auditability)

---

## 1. Core Problem & Motivation

### The Blind Algorithm Problem

Traditional AI-based screening systems (scholarship allocation, admissions, loan approvals) apply **uniform thresholds** to all applicants:

```
IF probability_score >= 0.60 THEN ADMIT
ELSE REJECT
```

This appears "fair" because everyone faces the same bar. But it's actually **systematically biased** because it ignores context:

| Applicant | Score | Internet | Location | First-Gen | Outcome |
|-----------|-------|----------|----------|-----------|---------|
| Priya (Urban) | 87% | High | Mumbai | No | ✅ ADMITTED |
| Ravi (Rural) | 58% | Low | Village | Yes | ❌ REJECTED |

Ravi scored 58% while studying by candlelight with no internet, no family guidance, and a 65km commute. His 58% arguably represents **more capability** than Priya's 87% when measured relative to opportunity. But the algorithm only sees the number.

### What EquiDecide Does

EquiDecide doesn't change what the AI predicts. It corrects **where the decision boundary sits** based on measurable contextual disadvantage. The ML model's probability output stays constant — only the threshold moves.

```
Traditional: score(58%) < threshold(60%) → REJECTED
EquiDecide:  score(58%) >= threshold(40%) → APPROVED  (threshold lowered by ODS)
```

---

## 2. The Opportunity Deficit Score (ODS) Engine

**File**: `backend/ods_engine.py`

The ODS is the heart of EquiDecide. It's a deterministic, transparent score (0.0–1.0) representing how much structural disadvantage a student faces.

### Design Principles

1. **Every weight is a human policy decision** — not a learned parameter
2. **Every reason is human-readable** — no black-box outputs
3. **The correction is capped** — we never over-correct
4. **Same inputs → same outputs** — fully deterministic

### Weight Table

```python
WEIGHTS = {
    'rural_location'      : 0.25,   # Rural: lowest resource access
    'semi_urban_location'  : 0.10,   # Semi-urban: partial access gap
    'first_generation'     : 0.20,   # No family guidance or networks
    'distance_far'         : 0.15,   # >30km: significant travel burden
    'distance_moderate'    : 0.08,   # 15–30km: moderate burden
    'no_internet'          : 0.20,   # Low: severe learning disadvantage
    'intermittent_internet': 0.10,   # Medium: partial disadvantage
}
```

### Why These Weights?

Each weight is derived from **NFHS-5 (National Family Health Survey, 2021-22)** reported access gaps:

- **Location (0.25)**: NFHS-5 shows rural districts have the widest infrastructure gap for education access in Tier-3 areas.
- **First-generation (0.20)**: Students with no family history of higher education lack both guidance and networks.
- **Internet (0.20)**: The digital divide directly impacts access to online learning resources and exam preparation.
- **Distance (0.15)**: Travel burden of >30km represents a significant daily cost in time and money.

### Example Calculation

```
Ravi: Rural + First-Gen + Low Internet + 65km distance
ODS = 0.25 + 0.20 + 0.20 + 0.15 = 0.80 (80/100)
```

This tells us Ravi faces 80% of the maximum possible structural disadvantage.

---

## 3. Dynamic Threshold Adjustment

**File**: `backend/ods_engine.py` → `adjust_threshold()`

### Formula

```python
reduction     = ODS × MAX_REDUCTION     # ODS × 0.25
adjusted      = BASE_THRESHOLD - reduction
final         = max(MIN_THRESHOLD, adjusted)
```

### Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `BASE_THRESHOLD` | 0.60 (60%) | Standard cutoff for the traditional model |
| `MAX_REDUCTION` | 0.25 (25pts) | Maximum threshold can be lowered |
| `MIN_THRESHOLD` | 0.35 (35%) | Floor — prevents reckless approvals |

### Safety Mechanisms

1. **Maximum reduction cap (25%)**: Even with ODS = 1.0 (maximum disadvantage), the threshold can only drop from 60% → 35%. This prevents gaming.
2. **Floor threshold (35%)**: No matter what, an applicant must clear 35%. This maintains baseline quality.
3. **Proportional correction**: A student with ODS = 0.40 gets only a 10-point reduction (60% → 50%), not the full 25.

### Example

```
Ravi's ODS: 0.80
Reduction: 0.80 × 0.25 = 0.20 (20 percentage points)
Adjusted: 0.60 - 0.20 = 0.40 (40%)
Floor check: 0.40 > 0.35 ✓ → Final threshold = 40%

Ravi's probability score: 49%
Traditional: 49% < 60% → REJECTED
EquiDecide: 49% >= 40% → APPROVED ✅
```

---

## 4. Machine Learning Model

**Files**: `backend/model/`, `backend/data/`, `backend/scripts/`

### Model Architecture

- **Algorithm**: Logistic Regression (scikit-learn)
- **Features**: `academic_score_percentage`, `family_income_monthly_inr`
- **Output**: Probability score [0.0, 1.0] representing admission likelihood

### Why Logistic Regression?

We deliberately chose the simplest viable model because:
1. **The ML model is not the point** — EquiDecide's innovation is in the correction layer, not the predictor.
2. Logistic Regression produces well-calibrated probabilities (critical for threshold-based decisions).
3. It's interpretable — judges can understand what the model does.

### Training Data

A **synthetic dataset** designed to reflect real-world patterns:
- Academic scores from 40-98% with realistic distributions
- Family incomes spanning ₹2,000–₹50,000/month
- Location tier distribution matching Indian demographics
- Historical approval rates calibrated from NFHS-5:
  - Rural: 26% approval rate
  - Semi-Urban: 44%
  - Urban: 44%

---

## 5. Context Inference Engine

**File**: `backend/core/context_extractor.py`

### What It Does

When a user provides **partial** contextual data, the inference engine fills in missing fields using intelligent defaults and logs every inference for auditability.

### Alias Resolution

Natural language inputs are mapped to canonical categories:

```python
LOCATION_ALIASES = {
    "urban": "Urban", "city": "Urban", "metro": "Urban",
    "suburban": "Semi-Urban", "town": "Semi-Urban",
    "rural": "Rural", "village": "Rural",
}

INTERNET_ALIASES = {
    "high": "High", "good": "High",
    "medium": "Medium", "average": "Medium",
    "low": "Low", "poor": "Low",
}
```

### Inference Rules

When a field is missing, the engine infers it from related data:

| Missing Field | Inference Rule | Confidence |
|---------------|---------------|------------|
| Location | Default: "Urban" | 0.5 |
| Internet (Rural) | Inferred: "Low" | 0.7 |
| Internet (Semi-Urban) | Inferred: "Medium" | 0.7 |
| Distance (Rural) | Inferred: 35 km | 0.6 |
| First-generation (low income) | Inferred: True if income < ₹8,000 | 0.6 |

### Confidence Scoring

Every inference has a confidence score (0–1). The overall confidence is the **minimum** across all inferred fields. This prevents overconfidence when multiple inferences chain together.

### Audit Trail

Every inference is logged with:
- Which field was inferred
- What value was assigned
- Which rule was used
- Individual confidence score

---

## 6. Profile Archetypes

**File**: `backend/core/profile_archetype.py`

### What It Does

Classifies each applicant into a named archetype for quick recognition:

| Archetype | Conditions |
|-----------|------------|
| **Remote Rural First-Gen** | Rural + First-Gen + Low Internet |
| **Rural Long-Distance Learner** | Rural + Distance > 40km |
| **Semi-Urban Low-Income Aspirant** | Semi-Urban + Income < ₹6,000 |
| **Urban Underserved High-Potential** | Urban + Income < ₹5,000 |
| **Urban High-Access Baseline** | Urban + Income ≥ ₹12,000 + Not First-Gen |
| **First-Gen Resilience Profile** | Any location + First-Gen |
| **General Context Profile** | Default fallback |

### Purpose

Archetypes serve two functions:
1. **UX**: Displayed as a badge in the UI so judges immediately understand the applicant's profile.
2. **LLM Prompting**: The archetype is included in the LLM prompt to help Gemini generate contextually accurate explanations.

---

## 7. LLM Explainability (Gemini Integration)

**File**: `backend/core/llm_explainer.py`

### Three-Tier Provider Strategy

EquiDecide uses a cascading fallback strategy for generating explanations:

```
1. Ollama (Local) → Fastest, offline, no API cost
   ↓ (if unavailable)
2. Gemini API (Cloud) → High quality, grounded explanations
   ↓ (if unavailable)
3. Deterministic KB Fallback → Always works, fully offline
```

### Gemini Integration

- **Model**: `gemini-2.5-flash` (configurable via `GEMINI_MODEL` env var)
- **API**: Google Generative Language API v1beta
- **Prompt**: Structured prompt including ODS score, reasons, threshold adjustment, archetype, and policy references
- **Temperature**: 0.3 (low — favors factual, consistent outputs)

### Deterministic Fallback

When no LLM is available, `build_explanation()` in `ods_engine.py` generates a rule-based explanation:

```
"Baseline threshold dynamically lowered from 60% → 40%
(a 20% reduction) due to an Opportunity Deficit Score of 80.
Factors applied: Tier-3 Rural District, First-generation applicant,
No reliable internet access, >30km from nearest institution (65km).
Ravi's performance demonstrates resilience given these structural barriers."
```

This ensures the system **always works** — even without internet or API keys.

---

## 8. Policy Knowledge Base & Grounding

**File**: `backend/knowledge/`

### What It Does

The knowledge base is a JSON file containing policy references — real statistics and research citations that ground the LLM's explanations in facts.

### Structure

```json
{
  "sources": [
    {
      "id": "nfhs5_internet",
      "title": "Digital Divide in Education Access",
      "domain": "internet_access",
      "stat": "Only 31% of rural households have internet access (NFHS-5, 2021)",
      "usage": "When internet_access_reliability is Low"
    }
  ]
}
```

### Retrieval Logic

Policy references are selected using **deterministic rule-based matching** (not vector search):

- If ODS includes "No reliable internet access" → include internet access policies
- If first-generation → include first-gen education gap data
- If distance > 30km → include geographic access barrier policies

### Why Not Vector Search?

We deliberately avoided embedding-based retrieval because:
1. **Reproducibility**: The same inputs always retrieve the same references.
2. **Auditability**: Judges can trace exactly which rule triggered which policy.
3. **Simplicity**: No vector DB dependency for a hackathon project.

---

## 9. Streaming UX with Server-Sent Events (SSE)

**File**: `backend/blueprints/dynamic_eval.py`

### What It Does

The dynamic evaluation endpoint streams the explanation word-by-word to the frontend, creating a ChatGPT-style typing effect.

### Protocol

```
Client → POST /api/evaluate/dynamic/stream
Server → SSE stream:

data: {"type": "result", "payload": { ... full evaluation response ... }}

data: {"type": "chunk", "payload": {"text": "Baseline threshold dynamically "}}
data: {"type": "chunk", "payload": {"text": "lowered from 60% → 40% "}}
data: {"type": "chunk", "payload": {"text": "(a 20% reduction) due to "}}
...
data: {"type": "done", "payload": {"source": "gemini_api"}}
```

### Frontend SSE Consumer

The React frontend uses the **ReadableStream API** to consume SSE events:

```typescript
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  // Parse SSE events from buffer...
}
```

This approach works without WebSocket libraries and provides natural streaming UX.

---

## 10. Frontend Architecture

**Stack**: React 19 + TypeScript + Vite 8 + Tailwind CSS 4

### Routing

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | ViewHero | Landing page with hero, problem, solution, CTA |
| `/form` | EvaluationFlow (App.tsx) | Static form → side-by-side results |
| `/dynamic` | DynamicEvalPage | 3-step interview with streaming results |
| `/demo` | DemoPage | Pre-loaded scenarios for quick demonstration |

### Component Architecture

```
App
├── IntroAnimation          # 3-second splash screen
├── Doodles                 # Fixed background SVG decorations
├── ClickRipple             # Global click animation spawner
├── Navbar                  # Responsive nav with hamburger menu
│
├── ViewHero                # Landing page sections
│   ├── Hero Section        # Title, tagline, CTA buttons
│   ├── Problem Section     # Tilted cards explaining the issue
│   ├── Solution Section    # Framework steps + mock dashboard
│   └── CTA Section         # Marquee banner + final call-to-action
│
├── EvaluationFlow          # /form
│   ├── IntakeForm          # 9-field intake with custom dropdowns
│   ├── ComparisonUI        # Side-by-side Traditional vs EquiDecide
│   ├── MetricsDashboard    # Equity index gauge
│   └── FeedbackWidget      # Fairness polling
│
├── DynamicEvalPage         # /dynamic
│   ├── ContextualChatForm  # 3-step chat-style wizard
│   ├── InferenceDebugPanel # Shows inferred vs provided signals
│   ├── ArchetypeTag        # Profile classification badge
│   ├── ComparisonUI        # Shared comparison component
│   ├── MetricsDashboard    # Shared gauge component
│   ├── PolicyReferenceCard # KB-grounded policy citations
│   └── FeedbackWidget      # Shared feedback component
│
├── DemoPage                # /demo
│   ├── Scenario cards      # Pre-loaded Rural/Urban test cases
│   ├── Mode selector       # Static/Dynamic/Both toggle
│   └── ComparisonUI        # Shared comparison component
│
└── Footer                  # Branded footer with status indicator
```

### State Management

Pure React `useState` — no external state library. Each page manages its own evaluation state independently. This keeps the architecture simple and avoids unnecessary complexity.

---

## 11. UI/UX Design System — "Doodly Brutalism"

### Design Philosophy

A fusion of two aesthetic movements:
- **Brutalism**: Bold borders, raw shadows, newspaper-style typography, and unapologetic visual weight.
- **Doodly/Playful**: Hand-drawn SVG decorations, wiggle animations, pastel colors, and whimsical elements.

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary Yellow | `#fde047` | Highlights, badges, CTA accents |
| Primary Pink | `#f472b6` | Shadows, emphasis, stamps |
| Primary Blue | `#0ea5e9` | Links, info elements, progress |
| Primary Green | `#10b981` | Success, approved states |
| Background | `#fdfaf6` | Warm off-white base |
| Text | `#0f172a` | Near-black for high contrast |
| Border | `#0f172a` | 4–8px solid borders |

### Typography

- **Font**: Balsamiq Sans (Google Fonts) — gives a hand-drawn, sketchbook feel
- **Weight**: Almost exclusively **Black (900)** and **Bold (700)**
- **Transform**: Many labels use `uppercase` with `tracking-widest`

### Shadow System

Brutalist offset shadows create depth without gradients:

```css
/* Standard element */
shadow-[4px_4px_0px_#0f172a]

/* Featured element */
shadow-[8px_8px_0px_#0ea5e9]

/* Active/pressed state (pushes down) */
shadow-[2px_2px_0px_#0f172a]
```

### Background

A dot-grid pattern creates a "graph paper" substrate:

```css
background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
background-size: 32px 32px;
```

### Animation System

| Animation | Usage | Duration |
|-----------|-------|----------|
| `wiggle` | Floating tags, doodle SVGs | 4–8s |
| `marquee` | Scrolling text banner | 20s |
| `bounce` | Doodle circles | 10s |
| `spin` | Doodle shapes, loading | 12–15s / 1s |
| `pulse` | Status indicators | 2s (via Tailwind) |

---

## 12. Custom Cursor & Click Animation System

### Custom SVG Cursors

**Files**: `frontend/public/cursor.svg`, `frontend/public/cursor-pointer.svg`

The project replaces the system cursor with custom hand-drawn SVG cursors:

- **Default cursor** (`cursor.svg`): White arrow with black outline — matches the doodly aesthetic
- **Pointer cursor** (`cursor-pointer.svg`): Pink arrow with black outline — indicates interactive elements

```css
/* Every element uses the custom cursor */
* { cursor: url('/cursor.svg') 4 4, auto; }

/* Interactive elements get the pink variant */
a, button, [role="button"], select, label[for] {
  cursor: url('/cursor-pointer.svg') 4 4, pointer !important;
}
```

### Click Ripple Animation

**File**: `frontend/src/components/ClickRipple.tsx`

Every mouse click spawns a two-part animation:

1. **Ring Ripple**: An expanding circle with color-shifting shadows (pink → blue → yellow)
2. **Ink Burst**: A small SVG star that scales up and rotates before fading

```
Click → spawn <div class="click-ripple"> + <div class="click-burst">
  → CSS animation expands ring + rotates star (0.5s)
  → JavaScript removes DOM elements after 600ms
```

This creates a satisfying "ink splash" feedback on every interaction.

---

## 13. Side-by-Side Comparison Engine

**File**: `frontend/src/components/ComparisonUI.tsx`

### What It Does

The core visual output of EquiDecide: two cards showing the same applicant evaluated by **Traditional AI** (left) vs **EquiDecide** (right).

### Card Anatomy

```
┌─────────────────────────────────────────────────────┐
│ 🤖 Traditional Model        │ ✨ EquiDecide Model  │
│                              │                      │
│ Probability: 49%             │ Probability: 49%     │
│ Threshold:   60% ━━━━━━━━━━  │ Threshold:   40% ━━  │
│                              │                      │
│ Score bar: ████████░░░░ 49%  │ Score bar: ████████░░│
│           threshold ↑        │   threshold ↑        │
│                              │                      │
│ ❌ REJECTED                  │ ✅ APPROVED           │
│                              │                      │
│ "Score falls below           │ ODS: 80              │
│  the required threshold"     │ Context: Rural, ...   │
│                              │ "Threshold lowered..." │
└─────────────────────────────────────────────────────┘
```

### Key Visual Features

- **Stamp overlay**: "APPROVED" (green, rotated) or "REJECTED" (red, rotated) stamped on each card
- **Progress bars**: Dual-color bars showing score vs threshold
- **Adaptive layout**: Full-width single card when only one mode is selected (Demo page)
- **Loading skeleton**: Animated pulse bars while waiting for results

---

## 14. Equity Index Dashboard

**File**: `frontend/src/components/MetricsDashboard.tsx`

### What It Does

A circular gauge (0–100) showing how much EquiDecide's correction changed the outcome:

- **0**: Both models agree (no correction needed)
- **High value**: Models disagree, significant contextual correction applied

### Formula

```python
if traditional_outcome == equidecide_outcome:
    equity_index = 0
else:
    equity_index = ODS × 100   # 0–100
```

### Historical Approval Rate

Displayed alongside the gauge, showing the historical group approval rate for the applicant's location tier:
- Rural: 26%
- Semi-Urban: 44%
- Urban: 44%

This contextualizes why the correction exists.

---

## 15. Analytics & Feedback System

### In-Memory Analytics Store

**File**: `backend/core/analytics_store.py`

Tracks evaluation metrics across sessions:
- Total evaluations run
- Disagreement rate (how often EquiDecide and Traditional disagree)
- Feedback tallies (thumbs up/down)
- Breakdown by location tier and archetype

### Feedback Widget

**File**: `frontend/src/components/FeedbackWidget.tsx`

After each evaluation, users can:
1. Rate the decision fairness (👍/👎)
2. Provide optional text feedback
3. See submission status with colored badges

### Analytics Panel

**File**: `frontend/src/components/AnalyticsPanel.tsx`

Displays accumulated metrics on the Demo page:
- Color-coded location approval bars (Rural=rose, Urban=green)
- Positive/negative feedback counts
- Total evaluation count and disagreement rate

---

## 16. Demo Mode & Scenario System

**File**: `frontend/src/components/DemoPage.tsx`

### Pre-Loaded Scenarios

Two contrasting test cases designed to show EquiDecide's impact:

| Scenario | Profile | Academic | Income | Location | Internet | First-Gen | Distance |
|----------|---------|----------|--------|----------|----------|-----------|----------|
| **Ravi Kumar** | Rural disadvantaged | 60% | ₹4,000 | Rural | Low | Yes | 65km |
| **Priya Sharma** | Urban baseline | 87% | ₹22,000 | Urban | High | No | 3km |

### Evaluation Modes

The demo supports three modes:
- **Both**: Runs Static + Dynamic evaluations side by side
- **Static Only**: Traditional form-based evaluation
- **Dynamic Only**: Streaming evaluation with LLM explanations

### Expected Demo Outputs

| | Ravi (Rural) | Priya (Urban) |
|---|---|---|
| Traditional AI | ❌ REJECTED | ✅ APPROVED |
| EquiDecide | ✅ APPROVED | ✅ APPROVED |
| ODS | 80 | 0 |
| Disagreement | Yes (key demo moment) | No |

---

## 17. API Architecture

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/evaluate` | Static evaluation (JSON response) |
| `POST` | `/api/evaluate/dynamic` | Dynamic evaluation (JSON response) |
| `POST` | `/api/evaluate/dynamic/stream` | Dynamic evaluation (SSE stream) |
| `POST` | `/api/context/infer` | Context inference (fill missing signals) |
| `POST` | `/api/feedback` | Submit fairness feedback |
| `GET` | `/api/analytics` | Retrieve aggregated metrics |
| `GET` | `/api/health` | System health check |

### Request Schema

```json
{
  "applicant_id": "app-1711935000000",
  "name": "Ravi Kumar",
  "standard_metrics": {
    "academic_score_percentage": 60,
    "family_income_monthly_inr": 4000
  },
  "contextual_signals": {
    "location_tier": "Rural",
    "first_generation": true,
    "distance_from_hq_km": 65,
    "internet_reliability": "Low"
  }
}
```

### Response Schema

```json
{
  "applicant_id": "app-1711935000000",
  "name": "Ravi Kumar",
  "traditional_model": {
    "outcome": "REJECTED",
    "probability_score": 0.49,
    "threshold_required": 0.60,
    "decision_reason": "Score falls below required threshold"
  },
  "equidecide_model": {
    "outcome": "ADMITTED",
    "probability_score": 0.49,
    "threshold_required": 0.40,
    "opportunity_deficit_score": 80,
    "context_applied": ["Tier-3 Rural District", "First-generation applicant", ...],
    "explanation_text": "Baseline threshold dynamically lowered from 60% → 40%..."
  },
  "metrics": {
    "equity_index": 80,
    "historical_group_approval_rate": 0.26
  },
  "inference": {
    "confidence_score": 1.0,
    "inference_log": [],
    "inferred_signals": { ... }
  },
  "profile_archetype": "Remote Rural First-Gen"
}
```

### Proxy Configuration

The Vite dev server proxies `/api/*` requests to Flask:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
  }
}
```

---

## 18. Security & Auditability

### Audit Trail

Every evaluation generates an audit record containing:
- Raw signals (what the user provided)
- Inferred signals (what the system filled in)
- Inference log (which rules fired and at what confidence)
- ODS calculation breakdown
- Final threshold and outcome

### Deterministic Behavior

Given the same inputs, EquiDecide **always produces the same output**. There is no randomness in:
- ODS calculation
- Threshold adjustment
- Policy reference retrieval
- Deterministic fallback explanations

The only non-deterministic component is the LLM (Gemini) explanation text, which varies in wording but is grounded by the same policy references.

### Environment Security

- API keys stored in `.env` (gitignored)
- `.env.example` provided with placeholder values
- No secrets committed to version control
- CORS configured for localhost development only

---

## Summary of Concepts Used

| Concept | Where | Why |
|---------|-------|-----|
| **Algorithmic Fairness** | ODS Engine | Core research domain |
| **Threshold Adjustment** | ODS Engine | Novel correction mechanism |
| **Logistic Regression** | scikit-learn model | Calibrated probability output |
| **Context Inference** | context_extractor.py | Handles partial data gracefully |
| **LLM Grounding** | Gemini + Policy KB | Explanations cite real data |
| **SSE Streaming** | Flask → React | ChatGPT-style UX |
| **Cascading Fallback** | LLM provider chain | Always works, even offline |
| **Profile Archetypes** | Classifier | Quick human understanding |
| **Brutalist Design** | CSS + Tailwind | High-impact visual identity |
| **Custom Cursors** | SVG + CSS | Brand-consistent interaction |
| **Click Animations** | ClickRipple component | Micro-interaction feedback |
| **Responsive Layout** | Tailwind breakpoints | Mobile-first design |
| **Component Reuse** | ComparisonUI, FeedbackWidget | Shared across 3 routes |
| **Deterministic Testing** | Demo scenarios | Reproducible judging demos |
