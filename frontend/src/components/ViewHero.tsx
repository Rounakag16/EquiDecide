import { Link } from 'react-router-dom';
import { Target, Users, Scale, ArrowRight, Zap } from 'lucide-react';

export function ViewHero() {
    return (
        <div className="w-full bg-[#fdfaf6] overflow-hidden">
            
            {/* 1. HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4 md:px-6 pt-24 pb-16">
                
                {/* Background scribbles specific to Hero */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Big abstract shape */}
                    <svg className="absolute top-[10%] left-[-5%] w-64 h-64 text-[#fef08a] opacity-50" viewBox="0 0 100 100">
                        <path d="M10,50 Q20,10 50,20 T90,50 Q80,90 50,80 T10,50" fill="currentColor" />
                    </svg>
                    <svg className="absolute bottom-[20%] right-[-10%] w-96 h-96 text-[#bae6fd] opacity-40 animate-[spin_30s_linear_infinite]" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10 15"/>
                    </svg>
                </div>

                {/* Floating Elements (Section-Level Positioning for Safety) */}
                {/* Desktop Elements */}
                <div className="hidden md:block absolute top-[25%] left-[2%] lg:left-[10%] xl:left-[15%] px-4 py-2 border-4 border-slate-900 text-lg leading-snug font-black rotate-12 bg-[#fbcfe8] text-slate-900 shadow-[4px_4px_0px_#0f172a] animate-[wiggle_4s_ease-in-out_infinite] z-30 whitespace-nowrap hover:scale-110 transition-transform">
                    Tier-3 Region
                </div>
                <div className="hidden md:block absolute top-[40%] text-right right-[2%] lg:right-[10%] xl:right-[15%] px-4 py-2 border-4 border-slate-900 text-lg leading-snug font-black -rotate-12 bg-[#bae6fd] text-slate-900 shadow-[4px_4px_0px_#0f172a] animate-[wiggle_5s_ease-in-out_infinite_reverse] z-30 whitespace-nowrap hover:scale-110 transition-transform">
                    First-Gen Student
                </div>

                {/* Mobile Elements */}
                <div className="md:hidden absolute top-[12%] left-[-10px] px-3 py-1 border-[3px] border-slate-900 text-[10px] font-black rotate-[15deg] bg-[#fbcfe8] text-slate-900 shadow-[3px_3px_0px_#0f172a] animate-[wiggle_4s_ease-in-out_infinite] z-30 whitespace-nowrap">
                    Tier-3 Region
                </div>
                <div className="md:hidden absolute top-[30%] sm:top-[35%] right-[-10px] px-3 py-1 border-[3px] border-slate-900 text-[10px] font-black -rotate-12 bg-[#bae6fd] text-slate-900 shadow-[3px_3px_0px_#0f172a] animate-[wiggle_5s_ease-in-out_infinite_reverse] z-30 whitespace-nowrap">
                    First-Gen
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center w-full">
                    
                    {/* Sticker Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#fde047] mb-8 md:mb-10 transform -rotate-3 hover:rotate-3 transition-transform duration-300 border-4 border-slate-900 shadow-[4px_4px_0px_#f472b6]">
                        {/* <span className="text-2xl animate-pulse">👩‍💻</span> */}
                        <span className="text-md text-slate-900 font-black uppercase tracking-widest">
                            Women Techies '26
                        </span>
                    </div>

                    {/* Massive Typography */}
                    <h1 className="text-6xl sm:text-7xl md:text-9xl font-black mb-8 text-[#0f172a] tracking-tighter leading-none relative z-20">
                        <span className="inline-block relative z-10" style={{ textShadow: "6px 6px 0px #0ea5e9, -2px -2px 0px white" }}>
                            Equi
                        </span>
                        <span className="inline-block relative z-10 text-[#fdfaf6]" style={{ textShadow: "6px 6px 0px #f472b6, -2px -2px 0px #0f172a" }}>
                            Decide
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-700 font-bold mb-14 max-w-3xl mx-auto px-4 leading-normal bg-white/70 p-6 rounded-xl border-2 border-dashed border-slate-300 backdrop-blur-sm shadow-[4px_4px_0px_rgba(203,213,225,1)]">
                        Strict algorithmic thresholds punishes resilience. EquiDecide prevents this algorithmic bias using <strong className="bg-[#fefce8] px-2 border-b-4 border-[#fde047] inline-block">opportunity deficit scores</strong> to understand the true context behind the data.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        <Link
                            to="/form"
                            className="group relative inline-flex items-center justify-center gap-3 text-2xl font-black text-white bg-[#0f172a] px-12 py-6 rounded-2xl border-4 border-[#0f172a] hover:bg-[#1e293b] active:scale-95 transition-all outline-none"
                        >
                            <div className="absolute inset-0 bg-[#f472b6] rounded-xl transform translate-x-3 translate-y-3 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 group-active:translate-x-1 group-active:translate-y-1 transition-transform border-4 border-[#0f172a]"></div>
                            <span>Static Form Demo</span>
                            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link
                            to="/dynamic"
                            className="group relative inline-flex items-center justify-center gap-3 text-2xl font-black text-white bg-[#0f172a] px-12 py-6 rounded-2xl border-4 border-[#0f172a] hover:bg-[#1e293b] active:scale-95 transition-all outline-none"
                        >
                            <div className="absolute inset-0 bg-[#0ea5e9] rounded-xl transform translate-x-3 translate-y-3 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 group-active:translate-x-1 group-active:translate-y-1 transition-transform border-4 border-[#0f172a]"></div>
                            <span>Dynamic Beta Demo</span>
                            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
                
                {/* SVG Jagged bottom border overlay */}
                <div className="absolute bottom-[-2px] left-0 w-full h-12 z-20 overflow-hidden">
                    <svg preserveAspectRatio="none" viewBox="0 0 1200 120" className="w-full h-full text-[#1e293b] fill-current" style={{ transform: 'rotate(180deg)' }}>
                         <path d="M0,0 L0,120 Q150,0 300,120 T600,120 T900,120 T1200,120 L1200,0 Z"></path>
                    </svg>
                </div>
            </section>

            {/* 2. THE PROBLEM SECTION (Dark Mode Contrast) */}
            <section className="relative py-32 bg-[#1e293b] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20 relative">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 text-white inline-block relative border-b-8 border-[#f472b6] pb-2 transform -rotate-2">
                           The Problem with Baseline AI
                        </h2>
                        <p className="text-slate-300 font-bold max-w-2xl mx-auto text-xl mt-6">Traditional machine learning applies uniform standards across fundamentally unequal data distributions.</p>
                    </div>

                    {/* Staggered Tilted Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mt-16 px-4">
                        
                        {/* Card 1 */}
                        <div className="bg-[#fdfaf6] text-slate-800 p-8 doodle-box transform -rotate-3 hover:rotate-0 transition-transform relative mt-8 md:mt-0 shadow-[8px_8px_0px_#0ea5e9]">
                            {/* Tape effect */}
                            <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-24 h-8 bg-white/60 shadow-sm border border-slate-200 rotate-2"></div>
                            
                            <div className="w-16 h-16 bg-[#fca5a5] rounded-full flex items-center justify-center mb-6 border-4 border-slate-900 border-dashed">
                                <Target className="text-slate-900 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Hard Checkpoints</h3>
                            <p className="text-slate-700 font-bold text-lg leading-relaxed">A strict 85% algorithmic cutoff doesn't detect the resilience of scoring 82% without reliable internet access.</p>
                        </div>
                        
                        {/* Card 2 */}
                        <div className="bg-[#fefce8] text-slate-800 p-8 doodle-box transform rotate-2 hover:rotate-0 transition-transform relative md:-mt-8 shadow-[8px_8px_0px_#f472b6]">
                             {/* Tape effect */}
                             <div className="absolute top-[-15px] left-1/3 w-20 h-8 bg-white/60 shadow-sm border border-slate-200 -rotate-3"></div>

                            <div className="w-16 h-16 bg-[#bae6fd] rounded-full flex items-center justify-center mb-6 border-4 border-slate-900">
                                <Users className="text-slate-900 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Hidden Context</h3>
                            <p className="text-slate-700 font-bold text-lg leading-relaxed">Generational factors like being a first-generation student are entirely omitted from raw academic processing.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#f0fdf4] text-slate-800 p-8 doodle-box transform -rotate-1 hover:rotate-0 transition-transform relative mt-8 md:mt-16 shadow-[8px_8px_0px_#fde047]">
                             {/* Tape effect */}
                             <div className="absolute top-[-15px] right-1/4 w-24 h-8 bg-white/60 shadow-sm border border-slate-200 rotate-4"></div>

                            <div className="w-16 h-16 bg-[#fde047] rounded-full flex items-center justify-center mb-6 border-4 border-slate-900">
                                <Scale className="text-slate-900 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Accidental Bias</h3>
                            <p className="text-slate-700 font-bold text-lg leading-relaxed">Minority groups get disproportionately penalized when uniform thresholds override nuanced human realities.</p>
                        </div>
                    </div>
                </div>

                {/* SVG Jagged top border overlay (facing up) */}
                <div className="absolute top-[-2px] left-0 w-full h-12 z-20 overflow-hidden">
                    <svg preserveAspectRatio="none" viewBox="0 0 1200 120" className="w-full h-full text-[#1e293b] fill-current" >
                         <path d="M0,0 L0,120 Q150,0 300,120 T600,120 T900,120 T1200,120 L1200,0 Z"></path>
                    </svg>
                </div>
                 {/* SVG wave bottom border going to next section */}
                 <div className="absolute bottom-[-2px] left-0 w-full h-12 z-20 overflow-hidden text-[#fdfaf6]">
                    <svg preserveAspectRatio="none" viewBox="0 0 1200 120" className="w-full h-full fill-current" style={{ transform: 'rotate(180deg)' }}>
                         <path d="M0,0 L0,120 Q150,0 300,120 T600,120 T900,120 T1200,120 L1200,0 Z"></path>
                    </svg>
                </div>
            </section>

            {/* 3. THE SOLUTION SECTION (Abstract CSS Dashboard) */}
            <section className="py-32 bg-[#fdfaf6] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-xl font-bold text-[#f472b6] mb-2 uppercase tracking-widest px-2 bg-white inline-block border-2 border-slate-900 border-dashed ml-2 transform -rotate-1">How it works</h2>
                            <h3 className="text-5xl font-black text-slate-900 mb-8 leading-tight">
                                Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]">EquiDecide</span> Framework
                            </h3>
                            <p className="text-xl text-slate-700 font-bold mb-8 leading-relaxed">
                                Our platform utilizes a custom evaluation module to dynamically adjust rejection thresholds based on socioeconomic realities.
                            </p>
                            
                            <div className="space-y-6 font-bold text-slate-700 text-lg mb-10">
                                <div className="flex items-start gap-4 p-4 bg-white doodle-box-sm border-l-8 border-l-[#10b981]">
                                    <div className="bg-[#d1fae5] text-[#10b981] w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 border-2 border-[#10b981]">1</div>
                                    <p>Computes an <strong className="text-slate-900">Opportunity Deficit Score</strong> based on location and systemic roadblocks.</p>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-white doodle-box-sm border-l-8 border-l-[#0ea5e9]">
                                    <div className="bg-[#bae6fd] text-[#0ea5e9] w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 border-2 border-[#0ea5e9]">2</div>
                                    <p>Injects variables into the classification threshold to visually <strong className="text-slate-900">lower algorithmic barriers</strong>.</p>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-white doodle-box-sm border-l-8 border-l-[#f472b6]">
                                    <div className="bg-[#fbcfe8] text-[#db2777] w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 border-2 border-[#db2777]">3</div>
                                    <p>Maintains high transparency using an interactive <strong className="text-slate-900">Equity Index Gauge</strong>.</p>
                                </div>
                            </div>

                        </div>
                        
                        {/* Pure CSS Mock Dashboard */}
                        <div className="w-full lg:w-1/2 relative mt-10 lg:mt-0">
                            {/* Shadow element */}
                            <div className="absolute inset-0 bg-[#0ea5e9] rounded-[2rem] transform translate-x-4 translate-y-4 border-4 border-slate-900"></div>
                            
                            {/* Dashboard Window */}
                            <div className="relative z-10 bg-white rounded-[2rem] border-4 border-slate-900 overflow-hidden flex flex-col shadow-xl">
                                {/* Browser Chrome */}
                                <div className="bg-slate-100 border-b-4 border-slate-900 px-4 py-3 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-400 border-2 border-slate-900"></div>
                                    <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-slate-900"></div>
                                    <div className="w-4 h-4 rounded-full bg-green-400 border-2 border-slate-900"></div>
                                    <div className="ml-4 bg-white px-4 py-1 rounded-full border-2 border-slate-900 text-xs font-bold text-slate-400 flex-grow mx-4 text-center">app.equidecide.org</div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="p-6 md:p-8 flex flex-col gap-6 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px]">
                                    
                                    {/* Abstract header */}
                                    <div className="flex justify-between items-center bg-white p-4 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#cbd5e1] rounded-full border-2 border-slate-900"></div>
                                            <div>
                                                <div className="h-4 w-24 bg-slate-800 rounded mb-2"></div>
                                                <div className="h-2 w-16 bg-slate-400 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-[#10b981] text-white font-black text-sm rounded border-2 border-slate-900 -rotate-2">APPROVED</div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#f0fdf4] p-4 border-2 border-slate-900 rounded-xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_#0f172a]">
                                            <div className="text-3xl font-black text-[#16a34a] mb-1 gap-2 flex items-center justify-center">
                                                <Zap className="w-6 h-6 fill-current" /> 15
                                            </div>
                                            <div className="text-[10px] md:text-xs font-bold uppercase text-slate-500">Deficit Score</div>
                                        </div>
                                        <div className="bg-[#fefce8] p-4 border-2 border-slate-900 rounded-xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_#0f172a]">
                                            <div className="text-3xl font-black text-[#ca8a04] mb-1">0.72</div>
                                            <div className="text-[10px] md:text-xs font-bold uppercase text-slate-500">Adjusted Prob.</div>
                                        </div>
                                    </div>

                                    {/* Context graph abstract */}
                                    <div className="bg-white p-4 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a]">
                                        <div className="h-3 w-32 bg-slate-200 rounded mb-4"></div>
                                        <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden border-2 border-slate-300 relative">
                                            <div className="absolute top-0 left-0 h-full w-[45%] bg-slate-300 border-r-2 border-slate-400"></div>
                                            <div className="absolute top-0 left-[45%] h-full w-[27%] bg-[#38bdf8] striped-bg"></div>
                                        </div>
                                        <div className="flex justify-between mt-3 text-[9px] md:text-[11px] font-bold text-slate-400">
                                            <span>Baseline (45%)</span>
                                            <span className="text-[#0ea5e9]">Context Bias Adj (+27%)</span>
                                            <span>Required (72%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative element */}
                            <div className="absolute -top-10 -right-10 z-20 animate-[wiggle_6s_ease-in-out_infinite] pointer-events-none">
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#f472b6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" />
                                </svg>
                            </div>
                            <div className="absolute -bottom-8 -left-8 z-20 animate-pulse pointer-events-none">
                                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="#6ee7b7" strokeWidth="6" strokeDasharray="10 10">
                                   <circle cx="50" cy="50" r="40" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. MARQUEE BANNER & FINAL CTA */}
            <section className="bg-[#fef08a] pt-16 pb-24 border-t-4 border-slate-900 overflow-hidden relative">
                
                {/* Marquee effect */}
                <div className="flex whitespace-nowrap overflow-hidden py-4 border-y-4 border-slate-900 bg-[#fde047] transform -rotate-2 scale-110 mb-16 shadow-[0px_8px_0px_rgba(15,23,42,0.1)]">
                    <div className="animate-marquee font-black text-5xl md:text-7xl text-slate-900 uppercase tracking-wide flex items-center gap-12">
                        <span>• Data With Empathy</span>
                        <span>• Dynamic Thresholds</span>
                        <span>• Stop Algorithmic Bias</span>
                        <span>• Context matters</span>
                        <span>• Data With Empathy</span>
                        <span>• Dynamic Thresholds</span>
                        <span>• Stop Algorithmic Bias</span>
                        <span>• Context matters</span>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center mt-8 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-12 tracking-tight block">Ready to evaluate fairly?</h2>
                    
                    <Link
                        to="/form"
                        className="group relative inline-flex items-center justify-center gap-4 text-2xl md:text-4xl font-black text-slate-900 bg-white px-12 md:px-20 py-8 rounded-[2rem] border-8 border-slate-900 hover:bg-[#f8fafc] active:scale-95 transition-all outline-none"
                    >
                        <div className="absolute inset-0 bg-[#f472b6] rounded-[1.5rem] transform translate-x-3 translate-y-3 -z-10 group-hover:translate-x-5 group-hover:translate-y-5 border-4 border-slate-900 transition-all"></div>
                        <div className="absolute inset-0 bg-[#0ea5e9] rounded-[1.5rem] transform translate-x-6 translate-y-6 -z-20 group-hover:translate-x-8 group-hover:translate-y-8 border-4 border-slate-900 transition-all"></div>
                        <span>Try the App Demo</span>
                        <div className="bg-[#fde047] rounded-full p-2 group-hover:rotate-45 transition-transform border-4 border-slate-900 ml-4">
                             <ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-slate-900" />
                        </div>
                    </Link>
                </div>
            </section>

            {/* Added CSS for striped background inside component for ease */}
            <style>{`
                .striped-bg {
                    background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px);
                }
            `}</style>
        </div>
    );
}
