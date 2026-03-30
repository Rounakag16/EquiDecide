import { useEffect, useState } from 'react';

type Analytics = {
  totals: {
    evaluations: number;
    disagreement_rate: number;
    feedback_up: number;
    feedback_down: number;
  };
  by_location: Record<string, { count: number; equi_admitted: number; trad_admitted: number }>;
  by_archetype: Record<string, { count: number; equi_admitted: number; avg_ods: number }>;
};

const LOCATION_COLORS: Record<string, { bar: string; bg: string; border: string }> = {
  Rural:        { bar: '#f43f5e', bg: '#fff1f2', border: '#fda4af' },
  'Semi-Urban': { bar: '#eab308', bg: '#fefce8', border: '#fde047' },
  Urban:        { bar: '#10b981', bg: '#ecfdf5', border: '#6ee7b7' },
};

export function AnalyticsPanel() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
      } catch (_e) {
        // ignore
      }
    })();
  }, []);

  if (!data) {
    return (
      <div className="bg-white border-8 border-slate-900 shadow-[8px_8px_0px_#0ea5e9] p-6">
        <h3 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
          <span className="text-2xl">📊</span> Demo Analytics
        </h3>
        <div className="bg-[#fdfaf6] border-4 border-dashed border-slate-300 p-6 text-center">
          <p className="font-bold text-slate-500 text-sm">No analytics data yet.</p>
          <p className="font-bold text-slate-400 text-xs mt-1">Run an evaluation to populate metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-8 border-slate-900 shadow-[8px_8px_0px_#0ea5e9] p-6">
      <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span> Demo Analytics
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border-4 border-slate-900 p-3 bg-[#fdfaf6] shadow-[2px_2px_0px_#0f172a]">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Evaluations</div>
          <div className="text-2xl font-black">{data.totals.evaluations}</div>
        </div>
        <div className="border-4 border-slate-900 p-3 bg-[#fdfaf6] shadow-[2px_2px_0px_#0f172a]">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Disagreement</div>
          <div className="text-2xl font-black">{Math.round(data.totals.disagreement_rate * 100)}%</div>
        </div>
        <div className="border-4 border-slate-900 p-3 bg-[#dcfce7] shadow-[2px_2px_0px_#16a34a]">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">👍 Positive</div>
          <div className="text-2xl font-black text-[#16a34a]">{data.totals.feedback_up}</div>
        </div>
        <div className="border-4 border-slate-900 p-3 bg-[#fee2e2] shadow-[2px_2px_0px_#dc2626]">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">👎 Negative</div>
          <div className="text-2xl font-black text-[#dc2626]">{data.totals.feedback_down}</div>
        </div>
      </div>

      {/* Location Breakdown */}
      <div className="mt-6">
        <div className="font-black uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
          Approval by Location
          <span className="text-[10px] font-black bg-[#bae6fd] px-2 py-0.5 border border-slate-900">EquiDecide</span>
        </div>
        <div className="space-y-2">
          {Object.entries(data.by_location).map(([k, v]) => {
            const colors = LOCATION_COLORS[k] || LOCATION_COLORS['Urban'];
            const rate = v.count ? Math.round((v.equi_admitted / v.count) * 100) : 0;
            return (
              <div key={k} className="border-4 border-slate-900 p-3 font-bold relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
                <div className="flex justify-between relative z-10">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 border-2 border-slate-900 inline-block"
                      style={{ backgroundColor: colors.bar }}
                    />
                    {k}
                  </span>
                  <span className="font-black">
                    {rate}% <span className="text-slate-500 text-xs">({v.equi_admitted}/{v.count})</span>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-white border border-slate-300 overflow-hidden relative z-10">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${rate}%`, backgroundColor: colors.bar }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
