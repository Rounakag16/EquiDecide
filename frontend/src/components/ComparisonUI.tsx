import { Info } from 'lucide-react';

interface CardData {
  outcome: "APPROVED" | "REJECTED";
  probabilityScore: number;
  requiredThreshold: number;
  reasonText?: string;
  deficitScore?: number;
  contextApplied?: string[];
  explanationText?: string;
}

interface CardProps {
  type: "traditional" | "equidecide";
  data: CardData;
}

function Card({ type, data }: CardProps) {
  const isTraditional = type === 'traditional';
  const isApproved = data.outcome === 'APPROVED';

  const containerClasses = isTraditional
    ? "bg-slate-200 border-8 border-slate-400 translate-y-2 opacity-90 saturate-50 shadow-inner relative"
    : "bg-[#fdfaf6] border-8 border-slate-900 -translate-y-2 relative shadow-[12px_12px_0px_#10b981]";
  
  const stampColor = isApproved ? "text-[#16a34a] border-[#16a34a]" : "text-[#ef4444] border-[#ef4444]";
  const stampAngle = isApproved ? "rotate-[-12deg]" : "rotate-[15deg]";

  return (
    <div className={`p-6 flex flex-col h-full ${containerClasses} transition-all hover:translate-y-0`} style={!isTraditional ? { backgroundImage: 'radial-gradient(circle, #86efac 2px, transparent 2px)', backgroundSize: '30px 30px' } : {}}>
      {/* Stamp attached to the top right of the absolute main card border */}
      <div className={`absolute -right-4 -top-6 md:-right-6 md:-top-8 text-3xl md:text-5xl font-black uppercase stamp ${stampColor} ${stampAngle} shadow-[4px_4px_0px_#000] bg-white px-6 py-2 border-[6px] z-50`}>
        {data.outcome}
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10 bg-white p-4 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a]">
        <div>
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            {isTraditional ? "🤖 Traditional AI" : "✨ EquiDecide"}
            {!isTraditional && <div className="ml-2 px-3 py-1 bg-[#fde047] text-slate-900 text-xs font-black tracking-widest border-2 border-slate-900 transform -rotate-3">CONTEXT ACTIVE</div>}
          </h3>
          <p className="text-slate-600 font-bold mt-2 text-sm uppercase tracking-widest">{isTraditional ? "Rigid Baseline Filtering" : "Dynamic Context Matrix"}</p>
        </div>
      </div>

      <div className="mb-6 pb-6 border-b-4 border-slate-900 border-dashed relative z-10 mt-2">
        
        <div className="mt-4 grid grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white p-4 border-4 border-slate-900 shadow-[2px_2px_0px_#0f172a] relative z-10">
            <div className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Score</div>
            <div className="text-3xl lg:text-4xl font-black text-slate-900 whitespace-nowrap">{(data.probabilityScore * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-slate-100 p-4 border-4 border-slate-900 shadow-[2px_2px_0px_#0f172a] relative z-10">
            <div className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Threshold</div>
            <div className="text-3xl lg:text-4xl font-black text-slate-900 whitespace-nowrap">{(data.requiredThreshold * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="flex-grow space-y-6 relative z-10">
        {isTraditional && data.reasonText && (
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2 bg-slate-300 inline-block text-white">Decision Logic</h4>
            <p className="text-slate-700 font-bold leading-relaxed text-md bg-white p-6 border-4 border-slate-400">
              "{data.reasonText}"
            </p>
          </div>
        )}

        {!isTraditional && data.contextApplied && (
          <div className="bg-white p-5 border-4 border-slate-900 shadow-[4px_4px_0px_#f472b6] transform rotate-1">
            <h4 className="text-xs font-black text-white bg-[#f472b6] uppercase tracking-widest mb-3 px-2 py-1 inline-block border-2 border-slate-900 -rotate-2">Variables Injected</h4>
            <ul className="space-y-2 mb-2 font-black text-slate-800 text-sm">
              {data.contextApplied.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-slate-50 p-2 border-2 border-slate-300">
                  <span className="text-[#16a34a] text-lg bg-green-100 px-1 rounded border border-green-500">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export interface ComparisonUIProps {
  isLoading: boolean;
  hasEvaluated: boolean;
  applicantName: string;
  traditionalData: CardData | null;
  equidecideData: CardData | null;
}

export function ComparisonUI({ isLoading, hasEvaluated, applicantName, traditionalData, equidecideData }: ComparisonUIProps) {
  if (!hasEvaluated && !isLoading) return null;

  return (
    <div className={`transition-all duration-700 ease-in-out h-full flex flex-col ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
      <div className="mb-8 bg-white px-6 py-3 border-4 border-slate-900 inline-block self-start shadow-[6px_6px_0px_#f43f5e] transform -rotate-1">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Case: <span className="text-[#0ea5e9] underline decoration-wavy decoration-[#f43f5e]">{applicantName}</span></h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-grow">
        {isLoading ? (
          <>
            <div className="bg-slate-200 border-8 border-slate-300 p-6 h-[500px] animate-pulse">
              <div className="h-10 bg-slate-300 border-4 border-slate-400 w-2/3 mb-4"></div>
              <div className="h-4 bg-slate-300 w-1/2 mb-12"></div>
              <div className="flex gap-6 mb-12">
                <div className="h-24 bg-white border-4 border-slate-300 w-1/2"></div>
                <div className="h-24 bg-white border-4 border-slate-300 w-1/2"></div>
              </div>
              <div className="h-40 bg-white border-4 border-slate-300 w-full"></div>
            </div>
            <div className="bg-[#f0fdf4] border-8 border-slate-900 p-6 h-[500px] animate-pulse">
              <div className="h-10 bg-green-200 border-4 border-slate-900 w-2/3 mb-4"></div>
              <div className="h-4 bg-green-200 w-1/2 mb-12"></div>
              <div className="flex gap-6 mb-12">
                <div className="h-24 bg-white border-4 border-slate-900 w-1/2"></div>
                <div className="h-24 bg-white border-4 border-slate-900 w-1/2"></div>
              </div>
              <div className="space-y-4">
                <div className="h-16 bg-white border-4 border-slate-900 w-full"></div>
                <div className="h-24 bg-white border-4 border-slate-900 w-full"></div>
              </div>
            </div>
          </>
        ) : (
          <>
            {traditionalData && <Card type="traditional" data={traditionalData} />}
            {equidecideData && <Card type="equidecide" data={equidecideData} />}
          </>
        )}
      </div>

      {!isLoading && equidecideData?.explanationText && (
        <div className="mt-8 bg-white p-6 md:p-8 border-8 border-slate-900 shadow-[8px_8px_0px_#0ea5e9]">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                <div className="bg-[#bae6fd] p-3 border-4 border-slate-900 rotate-2">
                    <Info className="w-8 h-8 md:w-10 md:h-10 text-slate-900 shrink-0" />
                </div>
                <div>
                  <h5 className="font-black text-2xl md:text-3xl text-slate-900 mb-2 md:mb-4 uppercase tracking-tight flex flex-wrap items-center gap-3">
                    Explainability Report
                    <span className="text-xs bg-[#fde047] px-2 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] transform -rotate-2">AI CONTEXT REASONING</span>
                  </h5>
                  <p className="text-lg md:text-xl text-slate-700 font-bold leading-relaxed border-l-4 border-[#0ea5e9] pl-4 md:pl-6 py-2">
                    {equidecideData.explanationText}
                  </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
