export function Footer() {
  const spawnRipple = (e: React.MouseEvent) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => document.body.removeChild(ripple), 600);
  };

  return (
    <footer className="w-full bg-[#1e293b] border-t-4 border-slate-900 mt-auto relative overflow-hidden group">
      {/* Decorative top edge */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f472b6] via-[#0ea5e9] to-[#fde047]"></div>
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left: Branding */}
          <div className="flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform" onClick={spawnRipple}>
            <div className="bg-white border-4 border-slate-900 px-4 py-2 transform -rotate-2 shadow-[4px_4px_0px_#f472b6] hover:rotate-2 hover:animate-[wiggle_0.8s_ease-in-out_infinite] transition-all">
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
          <div className="text-center md:text-right cursor-Help">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Built by Team
            </p>
            <p className="text-white font-black text-lg mt-1 relative z-10 marker-highlight px-1 inline-block">
              <span className="relative z-10 text-white hover:text-slate-900 transition-colors duration-300">CodingDivas</span>
            </p>
          </div>
        </div>

        {/* Bottom separator */}
        <div className="mt-6 pt-4 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-slate-500 font-semibold text-xs">
            Fair AI for equitable outcomes
          </p>
          <div 
            className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-800 transition-colors active:scale-95"
            onClick={spawnRipple}
            title="Click for a burst!"
          >
            <span className="w-3 h-3 bg-[#10b981] shadow-[0_0_10px_#10b981] rounded-full animate-pulse"></span>
            <span className="text-slate-400 hover:text-slate-300 font-bold text-xs uppercase tracking-widest">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
