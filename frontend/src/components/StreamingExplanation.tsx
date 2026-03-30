interface StreamingExplanationProps {
  text: string;
  isStreaming?: boolean;
}

export function StreamingExplanation({ text, isStreaming = false }: StreamingExplanationProps) {
  return (
    <div className="bg-white border-8 border-slate-900 shadow-[8px_8px_0px_#f472b6] p-6">
      <h4 className="text-xl font-black uppercase mb-3">Live Explanation Stream</h4>
      <p className="font-bold text-slate-700 leading-relaxed min-h-[100px]">
        {text || 'Waiting for dynamic explanation...'}
      </p>
      {isStreaming && (
        <div className="mt-4 inline-block bg-[#fde047] px-3 py-1 border-2 border-slate-900 font-black text-sm">
          Streaming...
        </div>
      )}
    </div>
  );
}
