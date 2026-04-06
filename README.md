# EquiDecide — Context-Aware Evaluation Engine

> **Women Techies Hackathon 2026 · GDG VIT Vellore**

EquiDecide is a context-aware applicant evaluation platform that combats algorithmic bias in threshold-based decision systems. Instead of applying rigid cutoffs equally to everyone, EquiDecide dynamically adjusts acceptance thresholds using an **Opportunity Deficit Score (ODS)** — making AI decisions equitable without lowering standards.

---

## 🎯 The Problem

Traditional ML-based screening applies uniform thresholds (e.g., 60% score to pass) regardless of context:

- A student scoring **58%** with unreliable internet, from a rural village, with no family guidance is treated identically to one scoring **58%** in an urban center with full resources.
- This isn't "fair" — it's blind.

## ✨ Our Solution

EquiDecide introduces a **transparent, auditable** correction layer:

1. **Opportunity Deficit Score (ODS)** — Quantifies structural disadvantage (0–100) using location, first-gen status, distance, and internet reliability
2. **Dynamic Threshold Adjustment** — Lowers the acceptance bar proportionally to ODS (capped to prevent over-correction)
3. **LLM-Powered Explainability** — Generates human-readable explanations grounded in policy references (via Gemini API)
4. **Side-by-Side Comparison** — Shows Traditional AI vs EquiDecide decisions to visualize the correction

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)           │
│  Landing Page · Static Form · Dynamic Eval · Demo   │
└────────────────────┬────────────────────────────────┘
                     │ /api/*
┌────────────────────▼────────────────────────────────┐
│                    Backend (Flask)                    │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Static Eval  │  │ Dynamic Eval │  │  Context   │ │
│  │  Blueprint   │  │  Blueprint   │  │  Infer BP  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         └────────┬────────┘              │         │
│         ┌────────▼────────┐              │         │
│         │ Evaluation Svc  │◄─────────────┘         │
│         │  + ODS Engine   │                         │
│         └────────┬────────┘                         │
│                  │                                   │
│         ┌────────▼────────┐                         │
│         │ LLM Explainer   │ → Gemini / Ollama /     │
│         │ + Policy KB     │   Deterministic Fallback│
│         └─────────────────┘                         │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (18+) with npm
- **Python** (3.10+) with pip
- **Gemini API Key** (get one from [Google AI Studio](https://aistudio.google.com/))
- **Ollama** (Optional, for local LLM inference) — [Download Ollama](https://ollama.com/)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd WomenTechies
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Optional: If using Ollama locally instead of Gemini
ollama pull llama3.2
ollama serve
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run the Application

**Terminal 1 — Backend (Flask)**
```bash
cd backend
.venv\Scripts\activate
python app.py
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend (Vite)**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
WomenTechies/
├── backend/
│   ├── app.py                    # Flask app entry point
│   ├── ods_engine.py             # Core ODS calculation engine
│   ├── blueprints/
│   │   ├── static_eval.py        # POST /api/evaluate
│   │   ├── dynamic_eval.py       # POST /api/evaluate/dynamic + /stream
│   │   └── context_infer.py      # POST /api/context/infer
│   ├── core/
│   │   ├── evaluation_service.py # Scoring + response assembly
│   │   ├── context_extractor.py  # Signal normalization + inference
│   │   ├── llm_explainer.py      # Gemini/Ollama LLM integration
│   │   ├── analytics_store.py    # In-memory analytics tracking
│   │   ├── profile_archetype.py  # Applicant archetype classification
│   │   └── inference_audit.py    # Audit logging for inferred signals
│   ├── model/                    # Trained sklearn model (pickle)
│   ├── knowledge/                # Policy knowledge base (JSON)
│   └── data/                     # Synthetic training dataset
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Router + Static evaluation flow
│   │   └── components/
│   │       ├── ViewHero.tsx       # Landing page hero + sections
│   │       ├── IntakeForm.tsx     # Static evaluation form
│   │       ├── DynamicEvalPage.tsx# Dynamic eval with streaming
│   │       ├── DemoPage.tsx       # Pre-loaded demo scenarios
│   │       ├── ComparisonUI.tsx   # Side-by-side result cards
│   │       ├── MetricsDashboard.tsx # Equity index gauge
│   │       ├── ContextualChatForm.tsx # Multi-step dynamic form
│   │       ├── Navbar.tsx         # Responsive navigation
│   │       ├── Footer.tsx         # Branded footer
│   │       └── ...               # Supporting components
│   └── index.html
│
└── README.md
```

---

## 🔑 Key Features

| Feature | Description |
|---|---|
| **ODS Engine** | Deterministic, auditable scoring with documented policy weights |
| **Dynamic Threshold** | Acceptance bar lowers proportionally to disadvantage (capped at 25%) |
| **LLM Explainability** | Gemini-powered explanations grounded in policy references |
| **Streaming UX** | Word-by-word explanation streaming via SSE |
| **Context Inference** | Auto-fills missing signals using intelligent defaults |
| **Profile Archetypes** | Classifies applicants into recognizable disadvantage profiles |
| **Equity Dashboard** | Real-time gauge showing correction magnitude |
| **Demo Mode** | Pre-loaded Rural vs Urban scenarios for quick judging |
| **Feedback System** | Fairness polling with analytics tracking |

---

## 🔧 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for LLM explanations | Required |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.5-flash` |
| `OLLAMA_MODEL` | Local Ollama model to use | `llama3.2` |
| `FLASK_DEBUG` | Enable Flask debug mode | `true` |
| `VITE_API_BASE_URL` | Frontend base URL for backend API (set in Vercel frontend project) | Empty (uses same-origin `/api`) |

---

## Deploy on Vercel (Frontend + Backend)

Use **two Vercel projects** from this monorepo:
- one project rooted at `backend`
- one project rooted at `frontend`

### 1) Deploy Backend (`backend`)

1. In Vercel, create a new project and set **Root Directory** to `backend`.
2. Framework can be auto-detected (Python).
3. Set environment variables in Vercel Project Settings:
   - `GEMINI_API_KEY` (required for Gemini explanations)
   - `GEMINI_MODEL` (optional)
   - `OLLAMA_MODEL` (optional; usually not used on Vercel)
4. Deploy. Save the generated backend URL, for example:
   - `https://equidecide-api.vercel.app`

### 2) Deploy Frontend (`frontend`)

1. Create another Vercel project and set **Root Directory** to `frontend`.
2. Framework preset: Vite.
3. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-url>`
4. Deploy.

### 3) Verify

Check these URLs after deploy:
- Backend health: `https://<backend-url>/api/health`
- Frontend app: `https://<frontend-url>/`

If frontend API calls fail, confirm `VITE_API_BASE_URL` exactly matches your backend domain (including `https://`, no trailing slash needed).

---

## 🧮 How ODS Works

The Opportunity Deficit Score is calculated from four contextual signals:

| Signal | Weight | Condition |
|---|---|---|
| Location | **0.25** | Rural district |
| First Generation | **0.20** | No family attended higher education |
| Distance | **0.15** | >30km from nearest institution |
| Internet | **0.20** | Low/no reliable access |

**Threshold adjustment**: `new_threshold = max(0.35, 0.60 − ODS × 0.25)`

This means the maximum possible reduction is 25 percentage points, and the floor is 35% — preventing reckless approvals.

---

## 🎨 Design Language

The UI follows a **"Doodly Brutalism"** aesthetic:

- Bold 4–8px borders with offset shadows
- Playful animations (wiggle, bounce, spin)
- Handwritten-style Balsamiq Sans typography
- Pastel accent colors: `#fde047` `#f472b6` `#0ea5e9` `#10b981`
- Dotgrid and doodle SVG backgrounds

---

## 👩‍💻 Team

Built by **Team GDG VIT Vellore** for the Women Techies Hackathon 2026.

---

## 📄 License

This project was built for hackathon submission and educational purposes.
