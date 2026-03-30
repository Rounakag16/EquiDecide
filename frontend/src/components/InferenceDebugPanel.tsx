type InferenceLogItem = {
  field: string;
  inferred_value: unknown;
  rule: string;
  confidence: number;
};

type InferenceDebugPanelProps = {
  confidenceScore: number;
  inferenceLog: InferenceLogItem[];
  inferredSignals: Record<string, unknown>;
};

export function InferenceDebugPanel({
  confidenceScore,
  inferenceLog,
  inferredSignals,
}: InferenceDebugPanelProps) {
  if (!inferenceLog?.length) return null;

  return (
    <div className="bg-white p-6 border-8 border-slate-900 shadow-[8px_8px_0px_#f472b6]">
      <details open>
        <summary className="cursor-pointer select-none font-black text-2xl uppercase tracking-tight text-slate-900">
          Inference Debug Panel
          <span className="ml-3 text-xs bg-[#fde047] px-3 py-1 border-2 border-slate-900 inline-block">
            Confidence {Math.round((confidenceScore || 0) * 100)}%
          </span>
        </summary>

        <div className="mt-4 space-y-3">
          {inferenceLog.map((item, idx) => (
            <div key={`${item.field}-${idx}`} className="bg-[#fdfaf6] border-4 border-slate-900 p-4">
              <div className="font-black text-slate-900 text-sm uppercase tracking-widest">{item.field}</div>
              <div className="text-slate-700 font-bold mt-1">
                assumed: <span className="text-slate-900">{String(item.inferred_value)}</span>
              </div>
              <div className="text-xs font-black uppercase text-slate-500 mt-2">
                {item.rule} • {Math.round(item.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs font-mono bg-slate-100 border-2 border-slate-300 p-3 overflow-x-auto">
          {JSON.stringify(inferredSignals, null, 2)}
        </div>
      </details>
    </div>
  );
}

