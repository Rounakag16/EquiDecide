import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type ContextualPayload = {
  name: string;
  standard_metrics: {
    academic_score_percentage: number;
    family_income_monthly_inr: number;
  };
  contextual_signals: {
    location_tier: string;
    first_generation: boolean;
    distance_from_hq_km: number;
    internet_reliability: string;
  };
};

type InferencePayload = {
  inferred_signals: {
    location_tier: string;
    first_generation_student: boolean;
    distance_from_institution_km: number;
    internet_access_reliability: string;
  };
  confidence_score: number;
  inference_log: Array<{
    field: string;
    inferred_value: unknown;
    rule: string;
    confidence: number;
  }>;
  profile_archetype: string;
};

interface ContextualChatFormProps {
  onSubmit: (payload: ContextualPayload) => Promise<void> | void;
  onInferenceUpdate?: (payload: InferencePayload) => void;
  isLoading?: boolean;
}

/* Custom styled select matching IntakeForm's design */
function StyledSelect({ value, options, onChange, placeholder, disabled, className }: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className={`${className} flex justify-between items-center cursor-pointer select-none`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{value || <span className="text-slate-400">{placeholder}</span>}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <div
        className={`absolute z-50 w-full mt-2 bg-white border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] transform origin-top transition-all duration-200 ease-out overflow-hidden ${
          isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
      >
        {options.map(opt => (
          <div
            key={opt}
            className="px-4 py-3 hover:bg-[#fde047] cursor-pointer font-bold text-slate-800 border-b-2 border-slate-100 last:border-0 transition-colors"
            onClick={() => { onChange(opt); setIsOpen(false); }}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContextualChatForm({
  onSubmit,
  onInferenceUpdate,
  isLoading = false,
}: ContextualChatFormProps) {
  const [step, setStep] = useState(0); // 0..2

  const [name, setName] = useState('');
  const [academic, setAcademic] = useState('');
  const [income, setIncome] = useState('');

  const [location, setLocation] = useState('');
  const [internet, setInternet] = useState('');

  const [distance, setDistance] = useState('');
  const [firstGen, setFirstGen] = useState(false);
  const [firstGenTouched, setFirstGenTouched] = useState(false);

  const inputClasses =
    'w-full bg-white text-slate-800 font-bold border-4 border-slate-900 px-4 py-3 focus:outline-none focus:bg-[#fde047] focus:shadow-[4px_4px_0px_#f472b6] transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const btnPrimary =
    'text-xl font-black bg-[#fde047] border-4 border-slate-900 px-6 py-3 shadow-[4px_4px_0px_#0f172a] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0f172a] active:translate-y-1 active:shadow-[2px_2px_0px_#0f172a] transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const btnSecondary =
    'text-xl font-black bg-white border-4 border-slate-900 px-6 py-3 shadow-[4px_4px_0px_#0f172a] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0f172a] active:translate-y-1 active:shadow-[2px_2px_0px_#0f172a] transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const progressLabel = useMemo(() => {
    if (step === 0) return 'Step 1 of 3: Core metrics';
    if (step === 1) return 'Step 2 of 3: Context basics';
    return 'Step 3 of 3: Access constraints';
  }, [step]);

  const canGoNext = () => {
    if (step === 0) return Boolean(name && academic && income);
    if (step === 1) return Boolean(location || internet);
    return true;
  };

  const runInference = async () => {
    try {
      const response = await fetch('/api/context/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: `infer-${Date.now()}`,
          name: name || 'Applicant',
          standard_metrics: {
            academic_score_percentage: Number(academic || 0),
            family_income_monthly_inr: Number(income || 0),
          },
          contextual_signals: {
            location_tier: location || undefined,
            first_generation: firstGenTouched ? firstGen : undefined,
            distance_from_hq_km: distance ? Number(distance) : undefined,
            internet_reliability: internet || undefined,
          },
        }),
      });
      if (!response.ok) return;
      const data: InferencePayload = await response.json();
      onInferenceUpdate?.(data);

      if (!location) setLocation(data.inferred_signals.location_tier || '');
      if (!internet) setInternet(data.inferred_signals.internet_access_reliability || '');
      if (!distance && data.inferred_signals.distance_from_institution_km !== undefined) {
        setDistance(String(data.inferred_signals.distance_from_institution_km));
      }
      if (!firstGenTouched) {
        setFirstGen(Boolean(data.inferred_signals.first_generation_student));
      }
    } catch (_e) {
      // Silent fail: form remains user-editable even if inference endpoint is unavailable.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    await onSubmit({
      name,
      standard_metrics: {
        academic_score_percentage: Number(academic),
        family_income_monthly_inr: Number(income),
      },
      contextual_signals: {
        location_tier: location,
        first_generation: firstGen,
        distance_from_hq_km: Number(distance),
        internet_reliability: internet,
      },
    });
  };

  /* Step progress bar */
  const progressWidth = `${((step + 1) / 3) * 100}%`;

  return (
    <form onSubmit={handleSubmit} className="bg-white border-8 border-slate-900 shadow-[8px_8px_0px_#0ea5e9] p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-black uppercase">Dynamic Interview</h3>
        <div className="text-xs font-black uppercase tracking-widest bg-[#bae6fd] border-2 border-slate-900 px-3 py-1">
          {progressLabel}
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="w-full h-3 bg-slate-200 border-2 border-slate-900 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#f472b6] transition-all duration-500 ease-out"
          style={{ width: progressWidth }}
        />
      </div>

      {step === 0 && (
        <>
          <p className="font-bold text-slate-700">Let's start with the baseline application details.</p>

          <input
            className={inputClasses}
            placeholder="What is your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className={inputClasses}
              type="number"
              step="0.1"
              placeholder="Academic score %"
              value={academic}
              onChange={(e) => setAcademic(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              className={inputClasses}
              type="number"
              placeholder="Family monthly income (INR)"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            disabled={!canGoNext() || isLoading}
            onClick={async () => {
              await runInference();
              setStep(1);
            }}
            className={`w-full ${btnPrimary}`}
          >
            Next →
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <p className="font-bold text-slate-700">Where are you located, and how reliable is your internet?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-2 uppercase">Location Tier</label>
              <StyledSelect
                value={location}
                options={['Urban', 'Semi-Urban', 'Rural']}
                onChange={setLocation}
                placeholder="Select Location"
                disabled={isLoading}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-900 mb-2 uppercase">Internet Access</label>
              <StyledSelect
                value={internet}
                options={['High', 'Medium', 'Low']}
                onChange={setInternet}
                placeholder="Select Quality"
                disabled={isLoading}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setStep(0)}
              className={`w-1/2 ${btnSecondary}`}
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!canGoNext() || isLoading}
              onClick={async () => {
                await runInference();
                setStep(2);
              }}
              className={`w-1/2 ${btnPrimary}`}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="font-bold text-slate-700">Finally, let's capture travel burden and first-generation status.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <input
              className={inputClasses}
              type="number"
              placeholder="Distance from institution (km)"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between p-3 bg-[#bae6fd] border-4 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
              <span className="font-black text-sm">First-generation student</span>
              <div className="relative inline-block w-14 h-8 align-middle select-none">
                <input
                  id="chat_first_gen_toggle"
                  type="checkbox"
                  checked={firstGen}
                  onChange={(e) => {
                    setFirstGenTouched(true);
                    setFirstGen(e.target.checked);
                  }}
                  disabled={isLoading}
                  className="toggle-checkbox absolute block w-8 h-8 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ top: '0', left: '0', transform: firstGen ? 'translateX(1.5rem)' : 'translateX(0)' }}
                />
                <label htmlFor="chat_first_gen_toggle" className={`toggle-label block overflow-hidden h-8 rounded-full cursor-pointer border-4 border-slate-900 ${firstGen ? 'bg-[#f472b6]' : 'bg-slate-300'}`} style={{ width: '3.5rem' }}></label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setStep(1)}
              className={`w-1/2 ${btnSecondary}`}
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-1/2 ${btnPrimary}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span> Evaluating...
                </span>
              ) : (
                '⚡ Run Dynamic Evaluation'
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
