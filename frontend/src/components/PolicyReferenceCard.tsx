type PolicyRef = {
  id?: string;
  title?: string;
  domain?: string;
  stat?: string;
  usage?: string;
};

export function PolicyReferenceCard({ references }: { references: PolicyRef[] }) {
  if (!references || references.length === 0) return null;

  return (
    <div className="bg-white p-6 border-8 border-slate-900 shadow-[8px_8px_0px_#0ea5e9]">
      <details open>
        <summary className="cursor-pointer select-none font-black text-2xl uppercase tracking-tight text-slate-900">
          Policy References (KB Grounding)
          <span className="ml-3 text-xs bg-[#fde047] px-3 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] transform -rotate-2 inline-block">
            {references.length}
          </span>
        </summary>

        <div className="mt-4 space-y-3">
          {references.map((r, idx) => (
            <div key={r.id || idx} className="bg-[#fdfaf6] border-4 border-slate-900 p-4">
              <div className="font-black text-slate-900 text-lg">
                {r.title || 'Untitled'}
              </div>
              {r.stat && (
                <div className="mt-2 text-slate-700 font-bold leading-relaxed">
                  {r.stat}
                </div>
              )}
              {(r.domain || r.usage) && (
                <div className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  {[r.domain, r.usage].filter(Boolean).join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

