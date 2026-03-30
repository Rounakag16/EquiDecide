export function Footer() {
  return (
    <footer className="w-full bg-[#1e293b] border-t-4 border-slate-900 mt-auto relative overflow-hidden">
      {/* Decorative top edge */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f472b6] via-[#0ea5e9] to-[#fde047]"></div>
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left: Branding */}
          <div className="flex items-center gap-4">
            <div className="bg-white border-4 border-slate-900 px-4 py-2 transform -rotate-2 shadow-[4px_4px_0px_#f472b6]">
              <span className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <span className="text-[#0ea5e9]">✎</span> EquiDecide
              </span>
            </div>
            <div className="hidden sm:block text-slate-400 font-bold text-sm border-l-2 border-slate-600 pl-4">
              Context-Aware<br />Evaluation Engine
            </div>
          </div>

          {/* Center: Hackathon Badge */}
          <div className="bg-[#fde047] border-4 border-slate-900 px-5 py-2 transform rotate-1 shadow-[3px_3px_0px_#0f172a]">
            <p className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">👩‍💻</span> Women Techies Hackathon 2026
            </p>
          </div>

          {/* Right: Credits */}
          <div className="text-center md:text-right">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Built by Team
            </p>
            <p className="text-white font-black text-sm mt-1">
              GDG VIT Vellore
            </p>
          </div>
        </div>

        {/* Bottom separator */}
        <div className="mt-6 pt-4 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-slate-500 font-semibold text-xs">
            Fair AI for equitable outcomes
          </p>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
            <span className="text-slate-500 font-bold text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
