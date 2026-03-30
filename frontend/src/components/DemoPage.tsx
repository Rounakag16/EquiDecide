import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ComparisonUI } from './ComparisonUI';
import { PolicyReferenceCard } from './PolicyReferenceCard';
import { AnalyticsPanel } from './AnalyticsPanel';

type UiOutcome = 'APPROVED' | 'REJECTED';

function toUiOutcome(v: 'ADMITTED' | 'REJECTED'): UiOutcome {
  return v === 'ADMITTED' ? 'APPROVED' : 'REJECTED';
}

type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  payload: any;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'rural-firstgen',
    title: 'Rural, First-Gen, Low Internet',
    subtitle: 'High ODS case — should show meaningful context correction',
    badge: '🏘️ Rural',
    badgeColor: '#be123c',
    badgeBg: '#ffe4e6',
    payload: {
      applicant_id: 'demo-1',
      name: 'Ravi Kumar',
      standard_metrics: { academic_score_percentage: 60.0, family_income_monthly_inr: 5000 },
      contextual_signals: {
        location_tier: 'Rural',
        first_generation: true,
        distance_from_hq_km: 65,
        internet_reliability: 'Low',
      },
    },
  },
  {
    id: 'urban-baseline',
    title: 'Urban, High Access Baseline',
    subtitle: 'Low ODS case — models should usually agree',
    badge: '🏙️ Urban',
    badgeColor: '#0369a1',
    badgeBg: '#e0f2fe',
    payload: {
      applicant_id: 'demo-2',
      name: 'Priya Sharma',
      standard_metrics: { academic_score_percentage: 85.0, family_income_monthly_inr: 18000 },
      contextual_signals: {
        location_tier: 'Urban',
        first_generation: false,
        distance_from_hq_km: 4,
        internet_reliability: 'High',
      },
    },
  },
];

export function DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [applicantName, setApplicantName] = useState('Applicant');
  const [traditionalData, setTraditionalData] = useState<any>(null);
  const [equidecideData, setEquidecideData] = useState<any>(null);
  const [policyRefs, setPolicyRefs] = useState<any[]>([]);
  const [demoNote, setDemoNote] = useState('');
  const [demoNoteType, setDemoNoteType] = useState<'success' | 'info' | 'neutral'>('neutral');

  const [selectedScenario, setSelectedScenario] = useState<string>('rural-firstgen');
  const [evalMode, setEvalMode] = useState<'static' | 'dynamic' | 'both'>('both');

  const runCompare = async () => {
    const scenario = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0];

    setIsLoading(true);
    setHasEvaluated(false);
    setApplicantName(scenario.payload.name);
    setTraditionalData(null);
    setEquidecideData(null);
    setPolicyRefs([]);
    setDemoNote('');
    setDemoNoteType('neutral');

    try {
      // Build fetch promises — only for the modes we need
      const fetches: Array<Promise<Response> | null> = [null, null];

      if (evalMode === 'static' || evalMode === 'both') {
        fetches[0] = fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario.payload),
        });
      }

      if (evalMode === 'dynamic' || evalMode === 'both') {
        fetches[1] = fetch('/api/evaluate/dynamic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario.payload),
        });
      }

      // Await only non-null promises
      const nonNullFetches = fetches.filter((f): f is Promise<Response> => f !== null);
      const responses = await Promise.all(nonNullFetches);

      // Map responses back to static/dynamic slots
      let staticResponse: Response | null = null;
      let dynamicResponse: Response | null = null;
      let responseIdx = 0;
      if (fetches[0] !== null) staticResponse = responses[responseIdx++];
      if (fetches[1] !== null) dynamicResponse = responses[responseIdx++];

      let staticData = null;
      let dynamicData = null;

      if (staticResponse) {
        if (!staticResponse.ok) throw new Error('Static evaluation failed');
        staticData = await staticResponse.json();
        setTraditionalData({
          outcome: toUiOutcome(staticData.traditional_model.outcome),
          probabilityScore: staticData.traditional_model.probability_score,
          requiredThreshold: staticData.traditional_model.threshold_required,
          reasonText: staticData.traditional_model.decision_reason,
        });
      }

      if (dynamicResponse) {
        if (!dynamicResponse.ok) throw new Error('Dynamic evaluation failed');
        dynamicData = await dynamicResponse.json();
        setEquidecideData({
          outcome: toUiOutcome(dynamicData.equidecide_model.outcome),
          probabilityScore: dynamicData.equidecide_model.probability_score,
          requiredThreshold: dynamicData.equidecide_model.threshold_required,
          deficitScore: dynamicData.equidecide_model.opportunity_deficit_score,
          contextApplied: dynamicData.equidecide_model.context_applied,
          explanationText: dynamicData.equidecide_model.explanation_text,
        });
        setPolicyRefs(dynamicData.policy_references || []);
      }

      if (evalMode === 'both' && staticData && dynamicData) {
        const disagreement = staticData.traditional_model.outcome !== dynamicData.equidecide_model.outcome;
        if (disagreement) {
          setDemoNote('✅ Disagreement detected: Traditional AI rejected, but EquiDecide approved after context correction.');
          setDemoNoteType('success');
        } else {
          setDemoNote('ℹ️ Both models agree for this case. Try the Rural scenario for a clearer demonstration of context correction.');
          setDemoNoteType('info');
        }
      } else {
        setDemoNote(`✅ Evaluated using ${evalMode === 'static' ? 'Traditional AI (Static)' : 'EquiDecide (Dynamic)'} engine.`);
        setDemoNoteType('info');
      }

      setHasEvaluated(true);
    } catch (err) {
      console.error(err);
      setDemoNote('❌ Evaluation failed. Make sure Flask is running on port 5000.');
      setDemoNoteType('neutral');
    } finally {
      setIsLoading(false);
    }
  };

  const noteStyles = {
    success: 'bg-[#dcfce7] border-[#16a34a] text-[#15803d]',
    info: 'bg-[#dbeafe] border-[#3b82f6] text-[#1e40af]',
    neutral: 'bg-white border-slate-900 text-slate-900',
  };

  const evalModeOptions = [
    { value: 'both' as const, label: '⚖️ Both (Compare)', desc: 'Side-by-side Traditional vs EquiDecide' },
    { value: 'static' as const, label: '🤖 Static Only', desc: 'Traditional AI threshold' },
    { value: 'dynamic' as const, label: '✨ Dynamic Only', desc: 'EquiDecide with context' },
  ];

  return (
    <div className="bg-transparent flex flex-col min-h-screen text-[#0f172a] font-sans pt-24">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-8">
        <div className="mb-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold doodle-box-sm px-4 py-2 hover:bg-[#f8fafc] transition-all no-underline"
          >
            <span className="text-xl">🔙</span> Back Homeward
          </Link>
        </div>

        <div className="bg-[#fde047] border-4 border-slate-900 p-4 font-black flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          Demo Mode: preloaded scenarios for reliable judging.
        </div>

        {demoNote && (
          <div className={`border-4 p-4 font-black flex items-center gap-3 transition-all duration-300 ${noteStyles[demoNoteType]}`}>
            {demoNote}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white border-8 border-slate-900 p-5 shadow-[8px_8px_0px_#f43f5e] space-y-5">
              <h2 className="font-black text-2xl uppercase border-b-4 border-slate-900 pb-2 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Configuration
              </h2>

              {/* Evaluation Mode */}
              <div className="space-y-2">
                <label className="font-black text-slate-800 uppercase tracking-widest text-xs">Evaluation Mode</label>
                <div className="flex flex-col gap-2">
                  {evalModeOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 cursor-pointer p-3 border-4 transition-all duration-200 ${
                        evalMode === opt.value
                          ? 'border-slate-900 bg-[#fde047] shadow-[4px_4px_0px_#0f172a] -translate-y-0.5'
                          : 'border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        className="w-5 h-5 accent-slate-900"
                        name="evalMode"
                        value={opt.value}
                        checked={evalMode === opt.value}
                        onChange={() => setEvalMode(opt.value)}
                      />
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{opt.label}</span>
                        <span className="text-xs font-bold text-slate-500">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Test Case (Scenario) Selector */}
              <div className="space-y-2 pt-2">
                <label className="font-black text-slate-800 uppercase tracking-widest text-xs">Test Case</label>
                <div className="flex flex-col gap-3">
                  {SCENARIOS.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-start gap-3 cursor-pointer p-4 border-4 transition-all duration-200 relative overflow-hidden ${
                        selectedScenario === s.id
                          ? 'border-slate-900 bg-[#f0fdf4] shadow-[4px_4px_0px_#10b981] -translate-y-0.5'
                          : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        className="w-5 h-5 accent-slate-900 mt-1 shrink-0"
                        name="scenario"
                        value={s.id}
                        checked={selectedScenario === s.id}
                        onChange={() => setSelectedScenario(s.id)}
                      />
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-base uppercase leading-tight">{s.title}</span>
                          <span
                            className="text-xs font-black px-2 py-0.5 border-2 border-slate-900 whitespace-nowrap inline-block"
                            style={{ backgroundColor: s.badgeBg, color: s.badgeColor }}
                          >
                            {s.badge}
                          </span>
                        </div>
                        <span className="font-bold text-slate-600 text-xs leading-snug">{s.subtitle}</span>
                      </div>
                      {selectedScenario === s.id && (
                        <div className="absolute top-0 right-0 bg-[#10b981] text-white px-2 py-0.5 text-xs font-black">
                          ✓
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <button
                disabled={isLoading}
                onClick={runCompare}
                className="w-full font-black text-xl border-4 border-slate-900 bg-[#10b981] text-white hover:bg-[#059669] px-4 py-4 uppercase transform transition-all active:scale-95 shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-spin text-2xl">⚙️</span> Running...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-2xl">⚡</span> Run Evaluation
                  </span>
                )}
              </button>
            </div>

            <AnalyticsPanel />
          </div>

          <div className="lg:col-span-2">
            <ComparisonUI
              isLoading={isLoading}
              hasEvaluated={hasEvaluated}
              applicantName={applicantName}
              traditionalData={traditionalData}
              equidecideData={equidecideData}
            />

            <div className="mt-8">
              <PolicyReferenceCard references={policyRefs} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
