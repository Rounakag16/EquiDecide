import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ViewHero } from './components/ViewHero';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { IntakeForm } from './components/IntakeForm';
import { ComparisonUI } from './components/ComparisonUI';
import { MetricsDashboard } from './components/MetricsDashboard';
import { Doodles } from './components/Doodles';
import { IntroAnimation } from './components/IntroAnimation';

type UiOutcome = "APPROVED" | "REJECTED";

type ApiResponse = {
  name: string;
  traditional_model: {
    outcome: "ADMITTED" | "REJECTED";
    probability_score: number;
    threshold_required: number;
    decision_reason: string;
  };
  equidecide_model: {
    outcome: "ADMITTED" | "REJECTED";
    probability_score: number;
    threshold_required: number;
    opportunity_deficit_score: number;
    context_applied: string[];
    explanation_text: string;
  };
  metrics: {
    equity_index: number;
    historical_group_approval_rate: number;
  };
};

const toUiOutcome = (value: "ADMITTED" | "REJECTED"): UiOutcome =>
  value === "ADMITTED" ? "APPROVED" : "REJECTED";

function EvaluationFlow() {
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applicantName, setApplicantName] = useState('Applicant');
  const [traditionalData, setTraditionalData] = useState<{
    outcome: UiOutcome;
    probabilityScore: number;
    requiredThreshold: number;
    reasonText: string;
  } | null>(null);
  const [equidecideData, setEquidecideData] = useState<{
    outcome: UiOutcome;
    probabilityScore: number;
    requiredThreshold: number;
    deficitScore: number;
    contextApplied: string[];
    explanationText: string;
  } | null>(null);
  const [metrics, setMetrics] = useState<{
    equityIndex: number;
    historicalRate: number;
  } | null>(null);

  const handleEvaluate = async (formData: {
    name: string;
    age: number | string;
    gender: string;
    academic_score: number | string;
    family_income: number | string;
    location_tier: string;
    first_generation: boolean;
    distance_km: number | string;
    internet_reliability: string;
  }) => {
    setIsLoading(true);
    setHasEvaluated(true);
    try {
      const payload = {
        applicant_id: `app-${Date.now()}`,
        name: formData.name || 'Applicant',
        standard_metrics: {
          academic_score_percentage: Number(formData.academic_score),
          family_income_monthly_inr: Number(formData.family_income),
        },
        contextual_signals: {
          location_tier: formData.location_tier,
          first_generation: formData.first_generation,
          distance_from_hq_km: Number(formData.distance_km || 0),
          internet_reliability: formData.internet_reliability || 'Medium',
        },
      };

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Evaluation failed (${res.status})`);
      }

      const data: ApiResponse = await res.json();
      setApplicantName(data.name || 'Applicant');
      setTraditionalData({
        outcome: toUiOutcome(data.traditional_model.outcome),
        probabilityScore: data.traditional_model.probability_score,
        requiredThreshold: data.traditional_model.threshold_required,
        reasonText: data.traditional_model.decision_reason,
      });
      setEquidecideData({
        outcome: toUiOutcome(data.equidecide_model.outcome),
        probabilityScore: data.equidecide_model.probability_score,
        requiredThreshold: data.equidecide_model.threshold_required,
        deficitScore: data.equidecide_model.opportunity_deficit_score,
        contextApplied: data.equidecide_model.context_applied ?? [],
        explanationText: data.equidecide_model.explanation_text,
      });
      setMetrics({
        equityIndex: data.metrics.equity_index,
        historicalRate: data.metrics.historical_group_approval_rate,
      });
    } catch (err) {
      console.error(err);
      alert('Could not reach backend. Make sure Flask is running on port 5000.');
      setHasEvaluated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-transparent flex flex-col min-h-screen text-[#0f172a] font-sans pt-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow transition-all duration-700">
        
        {/* Navigation Control */}
        <div className="mb-6 flex justify-start">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold doodle-box-sm px-4 py-2 hover:bg-[#f8fafc] transition-all no-underline"
            >
                <span className="text-xl">🔙</span> Back Homeward
            </Link>
        </div>

        {/* Dynamic Layout for the APP state */}
        <div className={`flex gap-8 transition-all duration-700 ease-in-out split-screen-container ${hasEvaluated ? 'flex-row' : 'flex-col items-center'}`}>
          
          {/* Form Column */}
          <div className={`transition-all duration-700 ease-in-out flex-shrink-0 relative ${hasEvaluated ? 'w-full lg:w-[35%] opacity-90' : 'w-full lg:w-[60%] mx-auto'}`}>
            <IntakeForm 
              onEvaluate={handleEvaluate} 
              isLoading={isLoading} 
              compactMode={hasEvaluated} 
            />
          </div>

          {/* Results Column (Mounts after evaluation begins) */}
          <div className={`transition-all duration-700 ease-in-out ${hasEvaluated ? 'w-full lg:w-[65%] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-12 overflow-hidden'}`}>
            <ComparisonUI 
              isLoading={isLoading}
              hasEvaluated={hasEvaluated}
              applicantName={applicantName}
              traditionalData={traditionalData}
              equidecideData={equidecideData}
            />
          </div>
        </div>

        {/* Dashoard (Bottom Row) */}
        <div className={`mt-8 transition-all duration-1000 delay-300 ease-bouncy pb-12 ${!isLoading && hasEvaluated && metrics ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-90 h-0 overflow-hidden'}`}>
          {metrics && <MetricsDashboard score={metrics.equityIndex} historicalRate={metrics.historicalRate} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <Doodles />
      <Routes>
        <Route path="/" element={
          <div className="bg-transparent flex flex-col min-h-screen text-[#0f172a] font-sans">
            <Navbar />
            <div className="flex-grow">
              <ViewHero />
            </div>
            <Footer />
          </div>
        } />
        <Route path="/form" element={<EvaluationFlow />} />
      </Routes>
    </>
  );
}

export default App;
