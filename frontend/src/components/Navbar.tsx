import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fdfaf6]/90 backdrop-blur-md border-b-2 border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex-shrink-0 no-underline">
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            <span className="text-[#0ea5e9]">✎</span> 
            <span>EquiDecide</span>
          </h1>
        </Link>
        <Link to="/form" className="text-slate-900 font-black px-6 py-2 border-4 border-slate-900 bg-[#fde047] shadow-[4px_4px_0px_#f472b6] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#f472b6] active:translate-y-1 active:shadow-[2px_2px_0px_#f472b6] transition-all hidden sm:block transform rotate-2">
          Women Techies Demo
        </Link>
      </div>
    </nav>
  );
}
