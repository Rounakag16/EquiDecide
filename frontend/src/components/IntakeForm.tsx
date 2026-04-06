import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

const CustomSelect = ({ name, value, options, onChange, placeholder, disabled, inputClasses }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`${inputClasses} flex justify-between items-center cursor-pointer select-none`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{value || <span className="text-slate-400">{placeholder}</span>}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <div 
        className={`absolute z-50 w-full mt-2 bg-white border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] transform origin-top transition-all duration-200 ease-out overflow-hidden ${
          isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
      >
        {options.map((opt: string) => (
          <div 
            key={opt}
            className="px-4 py-3 hover:bg-[#fde047] cursor-pointer font-bold text-slate-800 border-b-2 border-slate-100 last:border-0 transition-colors"
            onClick={() => {
              onChange({ target: { name, value: opt, type: 'select' } });
              setIsOpen(false);
            }}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};

interface IntakeFormProps {
  onEvaluate: (formData: {
    name: string;
    age: number | string;
    gender: string;
    academic_score: number | string;
    family_income: number | string;
    location_tier: string;
    first_generation: boolean;
    distance_km: number | string;
    internet_reliability: string;
  }) => void;
  isLoading: boolean;
  compactMode: boolean;
}

export function IntakeForm({ onEvaluate, isLoading, compactMode }: IntakeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '' as number | string,
    gender: '',
    academic_score: '' as number | string,
    family_income: '' as number | string,
    location_tier: '',
    first_generation: false,
    distance_km: '' as number | string,
    internet_reliability: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compactMode && !isLoading) {
      onEvaluate(formData);
    }
  };

  const inputClasses = "w-full bg-white text-slate-800 font-bold border-4 border-slate-900 px-4 py-3 focus:outline-none focus:bg-[#fde047] brutal-focus disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`transition-all duration-700 ease-in-out bg-white border-8 border-slate-900 overflow-hidden shadow-[8px_8px_0px_#0ea5e9] ${compactMode ? 'opacity-90 scale-[0.98]' : 'opacity-100'}`}>
      <div className="p-6 border-b-8 border-slate-900 bg-[#fde047] relative overflow-hidden">
        {/* Striped decorative bg */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #0f172a 10px, #0f172a 20px)' }}></div>
        
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3 relative z-10 uppercase">
          <span className="text-4xl bg-white rounded-full p-2 border-4 border-slate-900 shadow-[2px_2px_0px_#0f172a] transform -rotate-6">📝</span>
          Applicant Profile
        </h2>
        {!compactMode && <p className="text-md font-bold text-slate-800 mt-2 relative z-10 bg-white inline-block px-3 py-1 border-2 border-slate-900">Provide details to calculate contextual opportunity deficit.</p>}
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 bg-[#fdfaf6]">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-4 border-slate-900 pb-2 inline-block">Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ravi Kumar"
                disabled={compactMode || isLoading}
                className={inputClasses}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  placeholder="e.g. 19"
                  onChange={handleChange}
                  disabled={compactMode || isLoading}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Gender</label>
                <CustomSelect
                  name="gender"
                  value={formData.gender}
                  options={['Male', 'Female', 'Non-binary', 'Prefer not to say']}
                  onChange={handleChange}
                  placeholder="Select Gender"
                  disabled={compactMode || isLoading}
                  inputClasses={inputClasses}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Standard Metrics */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-4 border-slate-900 pb-2 inline-block">Standard Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Academic Score (%)</label>
              <input
                type="number"
                step="0.1"
                name="academic_score"
                value={formData.academic_score}
                placeholder="e.g. 82.5"
                onChange={handleChange}
                disabled={compactMode || isLoading}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Family Income (INR)</label>
              <input
                type="number"
                name="family_income"
                value={formData.family_income}
                placeholder="e.g. 8000"
                onChange={handleChange}
                disabled={compactMode || isLoading}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Contextual Signals */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-4 border-slate-900 pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f472b6]" /> Contextual Signals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Location Tier</label>
              <CustomSelect
                name="location_tier"
                value={formData.location_tier}
                options={['Urban', 'Suburban', 'Rural']}
                onChange={handleChange}
                placeholder="Select Tier"
                disabled={compactMode || isLoading}
                inputClasses={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Internet Access</label>
              <CustomSelect
                name="internet_reliability"
                value={formData.internet_reliability}
                options={['High', 'Medium', 'Low']}
                onChange={handleChange}
                placeholder="Quality"
                disabled={compactMode || isLoading}
                inputClasses={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2 uppercase">Dist. from HQ (km)</label>
              <input
                type="number"
                name="distance_km"
                value={formData.distance_km}
                placeholder="e.g. 45"
                onChange={handleChange}
                disabled={compactMode || isLoading}
                className={inputClasses}
              />
            </div>
            
            <div className="flex items-center justify-between col-span-1 md:col-span-2 mt-4 p-4 bg-[#bae6fd] border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] transform rotate-1">
              <div>
                <span className="block text-lg font-black text-slate-900 uppercase">First-Generation Student</span>
                <span className="block text-sm font-bold text-slate-800 bg-white px-2 py-0.5 mt-1 border border-slate-900 inline-block">First in family to attend higher education</span>
              </div>
              <div className="relative inline-block w-14 h-8 align-middle select-none">
                <input
                  id="first_gen_toggle"
                  type="checkbox"
                  name="first_generation"
                  checked={formData.first_generation}
                  onChange={handleChange}
                  disabled={compactMode || isLoading}
                  className="toggle-checkbox absolute block w-8 h-8 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ top: '0', left: '0', transform: formData.first_generation ? 'translateX(1.5rem)' : 'translateX(0)' }}
                />
                <label htmlFor="first_gen_toggle" className={`toggle-label block overflow-hidden h-8 rounded-full cursor-pointer border-4 border-slate-900 ${formData.first_generation ? 'bg-[#f472b6]' : 'bg-slate-300'}`} style={{ width: '3.5rem' }}></label>
              </div>
            </div>

          </div>
        </div>

        {!compactMode && (
          <div className="pt-8 mb-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-4 text-2xl md:text-3xl font-black text-slate-900 bg-[#fde047] px-8 py-6 border-[6px] border-slate-900 shadow-[8px_8px_0px_#f472b6] hover:-translate-y-1 hover:shadow-[12px_12px_0px_#f472b6] btn-3d outline-none transform -rotate-1 hover:rotate-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-3xl">⚙️</span>
                  Crunching Bias Metrics...
                </>
              ) : (
                <>
                  <span className="text-4xl animate-pulse">⚡</span> Evaluate Context
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
