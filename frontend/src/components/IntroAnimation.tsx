import { useEffect, useState } from 'react';

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Start the exit animation (Slide up)
    const timer1 = setTimeout(() => setIsAnimatingOut(true), 1800);
    // Unmount completely after animation finishes
    const timer2 = setTimeout(() => onComplete(), 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#fde047] flex flex-col items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] border-b-[8px] border-slate-900 ${
        isAnimatingOut ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{
        backgroundImage: 'radial-gradient(rgba(15,23,42,0.2) 2px, transparent 2px)',
        backgroundSize: '40px 40px'
      }}
    >
      <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-sm px-6 md:px-0 mt-[-5vh]">
        
        {/* Background Spinning Doodles - More Aggressive */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 mt-12 opacity-80">
          <svg className="absolute w-[28rem] h-[28rem] animate-[spin_6s_linear_infinite]" viewBox="0 0 100 100">
            <polygon points="50,5 90,90 10,90" fill="none" stroke="#f472b6" strokeWidth="2" strokeDasharray="10 5" />
          </svg>
          <svg className="absolute w-80 h-80 animate-[spin_8s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="#0ea5e9" strokeWidth="3" rx="5" />
          </svg>
        </div>

        {/* Central Animated Box */}
        <div className="animate-bounce bg-white p-8 md:p-10 border-8 border-slate-900 border-dashed transform rotate-2 w-full text-center relative shadow-[16px_16px_0px_#f472b6]">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 flex flex-col items-center justify-center gap-2 mb-6 uppercase tracking-tighter mix-blend-multiply">
            Evaluating
          </h1>
          <div className="h-5 w-full bg-slate-200 border-4 border-slate-900 mx-auto overflow-hidden rounded-full shadow-[inset_0px_3px_6px_rgba(0,0,0,0.2)] relative">
             <div className="absolute inset-0 striped-bg opacity-30"></div>
             <div className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#f472b6] animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
          </div>
          <div className="mt-6 inline-block">
             <span className="font-black text-slate-900 text-lg md:text-xl tracking-widest bg-[#bae6fd] px-6 py-2 border-4 border-slate-900 -rotate-3 inline-block shadow-[4px_4px_0px_#0f172a]">
                DOODLE ENGINE
             </span>
          </div>

          {/* Orbiting text/emojis */}
          <div className="absolute -top-10 -left-6 md:-left-10 text-5xl md:text-6xl animate-[wiggle_2s_ease-in-out_infinite] z-20 hover:scale-110 transition-transform">✏️</div>
          <div className="absolute -bottom-10 -right-6 md:-right-10 text-5xl md:text-6xl animate-bounce z-20 hover:scale-110 transition-transform" style={{ animationDelay: '0.3s' }}>🚀</div>
        </div>
      </div>
      <style>{`
          .striped-bg {
              background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(15,23,42,0.1) 10px, rgba(15,23,42,0.1) 20px);
          }
      `}</style>
    </div>
  );
}
