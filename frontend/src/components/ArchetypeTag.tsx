export function ArchetypeTag({ archetype }: { archetype: string }) {
  if (!archetype) return null;
  return (
    <div
      className="inline-flex items-center gap-2 bg-[#fde047] border-4 border-slate-900 px-4 py-2 font-black uppercase tracking-wide shadow-[4px_4px_0px_#0f172a]"
      title="Profile cluster inferred from context and baseline signals."
    >
      <span>Archetype:</span>
      <span className="bg-white border-2 border-slate-900 px-2 py-0.5">{archetype}</span>
    </div>
  );
}

