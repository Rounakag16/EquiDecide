import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ComparisonUI } from './ComparisonUI';
import { MetricsDashboard } from './MetricsDashboard';
import { PolicyReferenceCard } from './PolicyReferenceCard';
import { ArchetypeTag } from './ArchetypeTag';
import { apiUrl } from '../lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type CardData = {
  outcome: 'APPROVED' | 'REJECTED';
  probabilityScore: number;
  requiredThreshold: number;
  reasonText?: string;
  deficitScore?: number;
  contextApplied?: string[];
  explanationText?: string;
};

export function ConversationalEvalPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm here to gather some quick information for your application. If you prefer to skip straight to the results at any time, just let me know! First, what is your name?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [applicantName, setApplicantName] = useState('Applicant');
  const [traditionalData, setTraditionalData] = useState<CardData | null>(null);
  const [equidecideData, setEquidecideData] = useState<CardData | null>(null);
  const [metrics, setMetrics] = useState<{ equityIndex: number; historicalRate: number } | null>(null);
  const [policyRefs, setPolicyRefs] = useState<any[]>([]);
  const [explanationSource, setExplanationSource] = useState('pending');
  const [archetype, setArchetype] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const triggerDynamicStream = async (extractedData: any) => {
    setIsEvaluating(true);
    setHasEvaluated(false);
    setApplicantName(extractedData?.name || 'Applicant');
    
    // Quick timeout to scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

    try {
      const res = await fetch(apiUrl('/api/evaluate/dynamic/stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: `chat-${Date.now()}`,
          name: extractedData?.name || 'Applicant',
          standard_metrics: extractedData?.standard_metrics || {},
          contextual_signals: extractedData?.contextual_signals || {},
          preferred_provider: 'auto'
        }),
      });

      if (!res.ok) throw new Error('Streaming failed');
      if (!res.body) throw new Error('No body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n').map((l) => l.trim());
          const dataLine = lines.find((l) => l.startsWith('data:'));
          if (!dataLine) continue;

          const jsonStr = dataLine.slice('data:'.length).trim();
          if (!jsonStr) continue;

          const evt = JSON.parse(jsonStr) as { type: string; payload?: any };

          if (evt.type === 'result') {
            const r = evt.payload;
            const toOutcome = (o: string) => o === 'ADMITTED' ? 'APPROVED' as const : 'REJECTED' as const;
            
            setTraditionalData({
              outcome: toOutcome(r.traditional_model.outcome),
              probabilityScore: r.traditional_model.probability_score,
              requiredThreshold: r.traditional_model.threshold_required,
              reasonText: r.traditional_model.decision_reason,
            });
            setEquidecideData({
              outcome: toOutcome(r.equidecide_model.outcome),
              probabilityScore: r.equidecide_model.probability_score,
              requiredThreshold: r.equidecide_model.threshold_required,
              deficitScore: r.equidecide_model.opportunity_deficit_score,
              contextApplied: r.equidecide_model.context_applied,
              explanationText: r.equidecide_model.explanation_text || '',
            });
            setMetrics({
              equityIndex: r.metrics.equity_index,
              historicalRate: r.metrics.historical_group_approval_rate,
            });
            setPolicyRefs((r.policy_references || []));
            setExplanationSource(r.explanation_source || 'unknown');
            setArchetype(r.profile_archetype || '');
            setHasEvaluated(true);
            setIsEvaluating(false);
          }

          if (evt.type === 'chunk') {
            setEquidecideData((prev) => {
              if (!prev) return prev;
              return { ...prev, explanationText: (prev.explanationText || '') + (evt.payload?.text || '') };
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching results.');
      setIsEvaluating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: inputValue.trim() }];
    setMessages(newMsgs);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch(apiUrl('/api/chat/message'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          preferred_provider: 'auto'
        })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }

      if (data.status === 'complete') {
        const extracted = data.extracted_data || {};
        await triggerDynamicStream(extracted);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong connecting to my brain. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-transparent flex flex-col min-h-screen text-[#0f172a] font-sans pt-24">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow transition-all duration-700">
        <div className="mb-6 flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold doodle-box-sm px-4 py-2 hover:bg-[#f8fafc] transition-all no-underline"
          >
            <span className="text-xl">🔙</span> Back Homeward
          </Link>
        </div>

        <div className="bg-[#f472b6] border-4 border-slate-900 p-4 font-black mb-6 flex items-center gap-3 shadow-[4px_4px_0px_#0f172a]">
          <span className="text-2xl">💬</span>
          Conversational Interface: AI Applicant Interview
        </div>

        {/* Chat Layout */}
        <div className="w-full max-w-3xl mx-auto bg-white border-8 border-slate-900 shadow-[8px_8px_0px_#0ea5e9] flex flex-col h-[500px] mb-12">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3 font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-3 h-3 bg-[#10b981] rounded-full animate-pulse"></span>
            AI Interviewer Online
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfaf6]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-pop-in ${
                  m.role === 'user' ? 'bg-[#bae6fd] text-slate-900 font-bold' : 'bg-[#fde047] text-slate-900 font-bold'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 border-4 border-slate-900 bg-[#fde047] shadow-[4px_4px_0px_#0f172a] font-bold flex items-center gap-3 animate-pop-in">
                  <span className="animate-bounce text-2xl">✏️</span>
                  <span className="animate-pulse">Scribbling notes...</span>
                </div>
              </div>
            )}
            
            {hasEvaluated && (
              <div className="flex justify-center mt-6">
                 <div className="px-4 py-2 border-2 border-slate-900 bg-[#10b981] text-white font-black text-sm uppercase transform rotate-2">
                   Interview Completed! Scroll down for results.
                 </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-4 border-slate-900 p-3 bg-white flex gap-2">
            <input 
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isEvaluating || hasEvaluated || isTyping}
              placeholder={hasEvaluated ? "Conversation ended." : "Type your response..."}
              className="flex-1 border-4 border-slate-300 p-2 font-bold brutal-focus outline-none transition-colors"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isEvaluating || hasEvaluated || isTyping}
              className="bg-[#0ea5e9] text-white px-6 font-black uppercase text-lg border-4 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:bg-[#0284c7] disabled:opacity-50 transition-all btn-3d"
            >
              Send
            </button>
          </div>
        </div>

        {/* ── RESULTS ─────────────────────── */}
        <div ref={resultsRef} className="scroll-mt-24">
          {(isEvaluating || hasEvaluated) && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              <div className="mb-6 flex items-center gap-4 flex-wrap max-w-7xl mx-auto">
                {archetype && (
                  <ArchetypeTag archetype={archetype} />
                )}
                {explanationSource !== 'pending' && explanationSource && (
                  <div className="inline-block bg-white border-4 border-slate-900 px-4 py-2 font-black text-sm uppercase tracking-widest shadow-[3px_3px_0px_#0f172a]">
                    Explanation Source: <span className="text-[#0ea5e9]">{explanationSource}</span>
                  </div>
                )}
              </div>

              <ComparisonUI
                isLoading={isEvaluating}
                hasEvaluated={hasEvaluated}
                applicantName={applicantName}
                traditionalData={traditionalData}
                equidecideData={equidecideData}
              />

              {!isEvaluating && hasEvaluated && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                  {metrics && (
                    <MetricsDashboard score={metrics.equityIndex} historicalRate={metrics.historicalRate} />
                  )}
                  <PolicyReferenceCard references={policyRefs} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
