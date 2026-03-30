import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  showDynamicLink?: boolean;
}

const NAV_LINKS = [
  { to: '/demo', label: 'Demo Mode', style: 'bg-white shadow-[4px_4px_0px_#0f172a] rotate-1' },
  { to: '/dynamic', label: 'Dynamic Eval', style: 'bg-[#bae6fd] shadow-[4px_4px_0px_#0ea5e9] -rotate-1' },
  { to: '/form', label: 'Static Eval', style: 'bg-[#fde047] shadow-[4px_4px_0px_#f472b6] rotate-2' },
];

export function Navbar({ showDynamicLink = true }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const filteredLinks = showDynamicLink
    ? NAV_LINKS
    : NAV_LINKS.filter(l => l.to !== '/dynamic');

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fdfaf6]/90 backdrop-blur-md border-b-2 border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex-shrink-0 no-underline">
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            <span className="text-[#0ea5e9]">✎</span> 
            <span>EquiDecide</span>
          </h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-3">
          {filteredLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-slate-900 font-black px-4 py-2 border-4 border-slate-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px] active:translate-y-1 transition-all transform ${link.style} ${
                location.pathname === link.to
                  ? 'ring-2 ring-offset-2 ring-[#f472b6] -translate-y-0.5'
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="sm:hidden p-2 border-4 border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a] active:shadow-[1px_1px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-out border-t-2 border-slate-900 bg-[#fdfaf6] ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-3 p-4">
          {filteredLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`text-slate-900 font-black px-4 py-3 border-4 border-slate-900 text-center transition-all no-underline ${link.style} ${
                location.pathname === link.to
                  ? 'ring-2 ring-offset-2 ring-[#f472b6]'
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
