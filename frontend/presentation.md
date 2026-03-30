# EquiDecide: Context-Aware Fairness in AI
**Hackathon Presentation Outline**

---

## Slide 1: Title Slide
- **Title**: EquiDecide
- **Subtitle**: Redefining Fairness: From Rigid Baselines to Context-Aware AI
- **Theme/Track**: Problem Statement 4 (Context-Aware Fairness in AI Decision Systems)
- **Tagline**: True fairness is not equal treatment; it is equitable treatment.

---

## Slide 2: The Core Problem (The "Why")
*Addressing the specific context from the problem statement.*

- **The Illusion of Equality**: Current AI systems apply a "one-size-fits-all" threshold.
- **Institutionalized Bias**: Treating everyone the same ignores real-world inequalities.
  - A student scoring 82% from a remote village without reliable internet has demonstrated far more resilience than an urban student scoring 85% with infinite resources.
  - Rigid AI thresholds reject the rural student, effectively penalizing lack of access rather than lack of potential.
- **The Result**: Conventional AI algorithms systematically filter out marginalized, first-generation, and low-income demographics.

---

## Slide 3: Our Solution – EquiDecide
- **What it is**: An adaptive evaluation framework that injects environmental, socio-economic, and access-related factors directly into the AI decision pipeline.
- **How it works**: Instead of judging an applicant strictly by a static threshold, EquiDecide computes an **Opportunity Deficit Score** and dynamically adapts the required threshold relative to their context.
- **Design Philosophy**: Built with a "Doodly Brutalist" UI to contrast the cold, rigid, corporate feel of traditional AI with a human-centric, empathetic, and highly transparent design.

---

## Slide 4: Fulfilling the Deliverables
*Directly mapping our platform to the PS requirements.*

1. **Contextual Signal Integration**: We actively collect and process data beyond raw scores:
   - Location Tier (Rural, Suburban, Urban)
   - Internet Reliability
   - Generational Access (First-Generation student status)
   - Family Income
2. **Side-by-Side Comparison**: Our core UI features a side-by-side battle between **Traditional AI** (which blindly rejects the candidate) and **EquiDecide** (which approves them by understanding their background).
3. **Transparent Explainability**: Every decision is accompanied by an **Explainability Report** showing exactly what variables were injected to adjust the probability.

---

## Slide 5: The Workflow & Architecture
*A step-by-step breakdown of how data flows through the app.*

- **Step 1: Data Intake (The Form)**: The user inputs standard metrics (Age, Academic Score) alongside crucial contextual signals (Location, Internet Access, etc.).
- **Step 2: Processing (The Doodle Engine)**: 
  - The system analyzes the contextual signals to calculate an **Opportunity Deficit Score**.
  - This deficit score is mathematically applied to the candidate's base probability, boosting their effective score to reflect their resilience.
- **Step 3: Evaluation (The Dashboard)**: 
  - Standard Thresholds vs. Adjusted Probabilities are calculated.
- **Step 4: Output (The Comparison UI)**: 
  - The system renders the traditional rejection side-by-side with the EquiDecide approval.
  - Both cards feature massive "Rubber Stamp" outcomes for brutalist visual clarity.
  - The **Explainability Report** is generated to ensure bias-safe personalization without introducing surrogate bias.

---

## Slide 6: Hitting the "Brownie Points"
*How EquiDecide goes above and beyond.*

- 🌟 **Adaptive Fairness Scoring**: Our interactive **Equity Index Gauge** (Chart.js) dynamically tracks the applicant's base probability, visualizes the exact "Context Bias Adjustment," and shows the final adaptive threshold line. It quantifies *how* the context accounted for the decision.
- 🌟 **Bias-Safe Personalization**: We don't alter the candidate's raw academic score; we alter the *system's requirement threshold* based on the Opportunity Deficit. This ensures the primary data remains uncorrupted while mathematically normalizing resource discrepancy.
- 🌟 **Lightweight/Responsive**: Built as a lightning-fast React + Vite SPA (Single Page Application). The heavy use of pure CSS (Tailwind) animations and SVG over bulky media assets ensures it runs smoothly on low-end devices and weak connections.

---

## Slide 7: Technical Stack
- **Frontend Framework**: React 18, TypeScript, Vite
- **Styling & Animation**: Tailwind CSS (featuring complex keyframes, wiggles, and pure CSS marquees)
- **Data Visualization**: Chart.js & React-Chartjs-2 for the interactive Equity Index Gauge
- **Icons**: Lucide-React
- **Architecture**: Context-driven component hierarchy (`ViewHero` -> `IntakeForm` -> `MetricsDashboard` & `ComparisonUI`)

---

## Slide 8: Future Roadmap
- **Real-World Dataset Integration**: Connect the backend to Indian socio-economic API endpoints (e.g., regional infrastructure statistics) to automatically pre-fill context parameters based on postal code.
- **Offline Capability**: Implement PWA (Progressive Web App) service workers to allow the evaluation engine to run locally entirely offline in low-connectivity regions.

---

## Slide 9: Conclusion
- **EquiDecide** doesn't lower the bar; it levels the playing field.
- **Thank You / Q&A**
- *Live Demo Link / QR Code*
