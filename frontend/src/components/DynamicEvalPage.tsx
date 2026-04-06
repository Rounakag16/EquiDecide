import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ContextualChatForm } from './ContextualChatForm';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { ComparisonUI } from './ComparisonUI';
import { MetricsDashboard } from './MetricsDashboard';
import { PolicyReferenceCard } from './PolicyReferenceCard';
import { InferenceDebugPanel } from './InferenceDebugPanel';
import { ArchetypeTag } from './ArchetypeTag';
import { FeedbackWidget } from './FeedbackWidget';
import { apiUrl } from '../lib/api';

type UiOutcome = 'APPROVED' | 'REJECTED';

type CardData = {
  outcome: UiOutcome;
  probabilityScore: number;
  requiredThreshold: number;
  reasonText?: string;
  deficitScore?: number;
  contextApplied?: string[];
  explanationText?: string;
};

type PolicyRef = {
  id?: string;
  title?: string;
  domain?: string;
  stat?: string;
  usage?: string;
};

type InferenceData = {
  inferred_signals: Record<string, unknown>;
  confidence_score: number;
  inference_log: Array<{
    field: string;
    inferred_value: unknown;
    rule: string;
    confidence: number;
  }>;
  profile_archetype?: string;
};

function toUiOutcome(v: 'ADMITTED' | 'REJECTED'): UiOutcome {
  return v === 'ADMITTED' ? 'APPROVED' : 'REJECTED';
}

export function DynamicEvalPage() {
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applicantName, setApplicantName] = useState('Applicant');
  const [traditionalData, setTraditionalData] = useState<CardData | null>(null);
  const [equidecideData, setEquidecideData] = useState<CardData | null>(null);
  const [metrics, setMetrics] = useState<{ equityIndex: number; historicalRate: number } | null>(null);
  const [policyRefs, setPolicyRefs] = useState<PolicyRef[]>([]);
  const [explanationSource, setExplanationSource] = useState('pending');
  const [inferenceData, setInferenceData] = useState<InferenceData | null>(null);
  const [archetype, setArchetype] = useState('');
  const [applicantId, setApplicantId] = useState('');
  const [preferredProvider, setPreferredProvider] = useState<string>('auto');

  const resultsRef = useRef<HTMLDivElement>(null);

  const providerOptions = [
    { value: 'auto', label: '🤖 Auto', desc: 'Fastest available' },
    { value: 'ollama_local', label: '🦙 Ollama Local', desc: 'Secure, offline' },
    { value: 'gemini_api', label: '✨ Gemini Cloud', desc: 'High quality' },
  ];

  const appendExplanationChunk = (chunk: string) => {
    setEquidecideData((prev) => {
      if (!prev) return prev;
      const existing = prev.explanationText ?? '';
      return { ...prev, explanationText: existing + chunk };
    });
  };

  const onSubmit = async (payload: any) => {
    setIsLoading(true);
    setHasEvaluated(false);
    setApplicantName(payload.name || 'Applicant');
    setTraditionalData(null);
    setEquidecideData(null);
    setMetrics(null);
    setPolicyRefs([]);
    setExplanationSource('pending');
    setInferenceData(null);
    setArchetype('');
    setApplicantId('');

    // Scroll to results area
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

    try {
      const res = await fetch(apiUrl('/api/evaluate/dynamic/stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: `dynamic-${Date.now()}`,
          name: payload.name || 'Applicant',
          standard_metrics: payload.standard_metrics,
          contextual_signals: payload.contextual_signals,
          preferred_provider: preferredProvider,
        }),
      });

      if (!res.ok) {
        throw new Error(`Dynamic streaming failed (${res.status})`);
      }
      if (!res.body) {
        throw new Error('Dynamic streaming has no response body.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n').map((l) => l.trim());
          const dataLine = lines.find((l) => l.startsWith('data:'));
          if (!dataLine) continue;

          const jsonStr = dataLine.slice('data:'.length).trim();
          if (!jsonStr) continue;

          const evt = JSON.parse(jsonStr) as {
            type: string;
            payload?: any;
          };

          if (evt.type === 'result') {
            const r = evt.payload as any;
            setApplicantId(r.applicant_id || '');
            setTraditionalData({
              outcome: toUiOutcome(r.traditional_model.outcome),
              probabilityScore: r.traditional_model.probability_score,
              requiredThreshold: r.traditional_model.threshold_required,
              reasonText: r.traditional_model.decision_reason,
            });
            setEquidecideData({
              outcome: toUiOutcome(r.equidecide_model.outcome),
              probabilityScore: r.equidecide_model.probability_score,
              requiredThreshold: r.equidecide_model.threshold_required,
              deficitScore: r.equidecide_model.opportunity_deficit_score,
              contextApplied: r.equidecide_model.context_applied,
              explanationText: r.equidecide_model.explanation_text || '',
            });
            setMetrics({
              equityIndex: r.metrics.equity_index,
              historicalRate: r.metrics.historical_group_approval_rate,
            });
            setPolicyRefs((r.policy_references || []) as PolicyRef[]);
            setExplanationSource(r.explanation_source || 'unknown');
            setInferenceData({
              inferred_signals: r?.inference?.inferred_signals || {},
              confidence_score: r?.inference?.confidence_score || 1,
              inference_log: r?.inference?.inference_log || [],
              profile_archetype: r.profile_archetype,
            });
            setArchetype(r.profile_archetype || '');
            setHasEvaluated(true);
            setIsLoading(false);
          }

          if (evt.type === 'chunk') {
            appendExplanationChunk(evt.payload?.text ?? '');
          }

          if (evt.type === 'done') {
            appendExplanationChunk('');
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Could not reach dynamic streaming endpoint. Make sure Flask is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-transparent flex flex-col min-h-screen text-[#0f172a] font-sans pt-24">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow transition-all duration-700">
        {/* Back nav */}
        <div className="mb-6 flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold doodle-box-sm px-4 py-2 hover:bg-[#f8fafc] transition-all no-underline"
          >
            <span className="text-xl">🔙</span> Back Homeward
          </Link>
        </div>

        {/* Header banner */}
        <div className="bg-[#bae6fd] border-4 border-slate-900 p-4 font-black mb-6 flex items-center gap-3">
          <span className="text-2xl">✨</span>
          Dynamic Eval: KB-grounded explanations with streaming UX.
        </div>

        {/* Source badge */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="inline-block bg-white border-4 border-slate-900 px-4 py-2 font-black text-sm uppercase tracking-widest shadow-[3px_3px_0px_#0f172a]">
            Explanation Source: <span className="text-[#0ea5e9]">{explanationSource}</span>
          </div>
          {archetype && (
            <ArchetypeTag archetype={archetype} />
          )}
        </div>

        {/* Provider Selection */}
        <div className="mb-8 p-5 bg-white border-8 border-slate-900 shadow-[8px_8px_0px_#f43f5e] max-w-3xl mx-auto">
          <h2 className="font-black text-xl uppercase border-b-4 border-slate-900 pb-2 mb-4 flex items-center gap-2">
            <span className="text-2xl">🧠</span> LLM Provider
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {providerOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 cursor-pointer p-3 border-4 transition-all duration-200 ${
                  preferredProvider === opt.value
                    ? 'border-slate-900 bg-[#fde047] shadow-[4px_4px_0px_#0f172a] -translate-y-0.5'
                    : 'border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  className="w-5 h-5 accent-slate-900 mt-0.5 shrink-0"
                  name="providerPref"
                  value={opt.value}
                  checked={preferredProvider === opt.value}
                  onChange={() => setPreferredProvider(opt.value)}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-sm uppercase leading-tight">{opt.label}</span>
                  <span className="text-xs font-bold text-slate-500 leading-snug">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Form Section — always full width at the top */}
        <div className={`transition-all duration-500 ease-out ${hasEvaluated ? 'mb-12' : 'mb-8'}`}>
          <div className="max-w-3xl mx-auto">
            <ContextualChatForm
              onSubmit={onSubmit}
              onInferenceUpdate={(payload) => {
                setInferenceData({
                  inferred_signals: payload.inferred_signals,
                  confidence_score: payload.confidence_score,
                  inference_log: payload.inference_log,
                  profile_archetype: payload.profile_archetype,
                });
                setArchetype(payload.profile_archetype || '');
              }}
              isLoading={isLoading}
            />
          </div>

          {/* Inference debug — below form, narrower */}
          {inferenceData && inferenceData.inference_log?.length > 0 && (
            <div className="max-w-3xl mx-auto mt-6">
              <InferenceDebugPanel
                confidenceScore={inferenceData.confidence_score}
                inferenceLog={inferenceData.inference_log}
                inferredSignals={inferenceData.inferred_signals}
              />
            </div>
          )}
        </div>

        {/* ── RESULTS — Full Width Below ─────────────────────── */}
        <div ref={resultsRef} className="scroll-mt-24">
          {/* Loading / Results area */}
          {(isLoading || hasEvaluated) && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

              {/* Comparison Cards — full width */}
              <ComparisonUI
                isLoading={isLoading}
                hasEvaluated={hasEvaluated}
                applicantName={applicantName}
                traditionalData={traditionalData}
                equidecideData={equidecideData}
              />

              {/* Metrics + Policy side by side on large screens */}
              {!isLoading && hasEvaluated && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {metrics && (
                    <MetricsDashboard score={metrics.equityIndex} historicalRate={metrics.historicalRate} />
                  )}
                  <PolicyReferenceCard references={policyRefs} />
                </div>
              )}

              {/* Feedback widget — full width */}
              {!isLoading && hasEvaluated && applicantId && (
                <FeedbackWidget applicantId={applicantId} />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
