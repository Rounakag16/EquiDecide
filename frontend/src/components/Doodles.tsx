

export function Doodles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-50">
      {/* SVG strokes floating around */}
      <svg className="absolute top-[10%] left-[5%] animate-[wiggle_8s_ease-in-out_infinite]" width="60" height="60" viewBox="0 0 100 100">
        <path d="M 10 50 Q 25 25 50 50 T 90 50" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg className="absolute top-[80%] left-[10%] animate-[bounce_10s_ease-in-out_infinite]" width="80" height="80" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 5" />
      </svg>
      <svg className="absolute top-[20%] right-[10%] animate-[pulse_6s_ease-in-out_infinite] rotate-45" width="70" height="70" viewBox="0 0 100 100">
        <rect x="25" y="25" width="50" height="50" fill="none" stroke="#0ea5e9" strokeWidth="4" rx="10" />
      </svg>
      <svg className="absolute bottom-[20%] right-[5%] animate-[spin_12s_linear_infinite]" width="90" height="90" viewBox="0 0 100 100">
        <polygon points="50,15 90,85 10,85" fill="none" stroke="#ec4899" strokeWidth="4" strokeLinejoin="round" />
      </svg>
      <svg className="absolute top-[40%] left-[20%] animate-[wiggle_7s_ease-in-out_infinite]" width="50" height="50" viewBox="0 0 100 100">
        <path d="M 10 90 L 90 10 M 10 10 L 90 90" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg className="absolute top-[70%] right-[25%] animate-[spin_15s_linear_infinite_reverse]" width="60" height="60" viewBox="0 0 100 100">
        <path d="M 50 10 L 60 40 L 90 50 L 60 60 L 50 90 L 40 60 L 10 50 L 40 40 Z" fill="none" stroke="#10b981" strokeWidth="4" strokeLinejoin="round" />
      </svg>
      
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg) translate(0, 0); }
          50% { transform: rotate(5deg) translate(10px, -15px); }
        }
      `}</style>
    </div>
  );
}
