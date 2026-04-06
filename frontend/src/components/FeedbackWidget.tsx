import { useState } from 'react';
import { apiUrl } from '../lib/api';

export function FeedbackWidget({ applicantId }: { applicantId: string }) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const send = async (r: 'up' | 'down') => {
    setRating(r);
    setStatus('sending');
    try {
      const res = await fetch(apiUrl('/api/feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: applicantId, rating: r, text }),
      });
      if (!res.ok) throw new Error('feedback failed');
      setStatus('sent');
    } catch (_e) {
      setStatus('error');
    }
  };

  if (!applicantId) return null;

  const statusBadge = {
    idle: { text: 'Not submitted', bg: 'bg-slate-200', color: 'text-slate-600' },
    sending: { text: '⏳ Submitting...', bg: 'bg-[#fde047]', color: 'text-slate-900' },
    sent: { text: '✅ Submitted. Thank you!', bg: 'bg-[#dcfce7]', color: 'text-[#15803d]' },
    error: { text: '❌ Failed (backend offline)', bg: 'bg-[#fee2e2]', color: 'text-[#b91c1c]' },
  }[status];

  return (
    <div className="bg-white border-8 border-slate-900 shadow-[8px_8px_0px_#f43f5e] p-6">
      <div className="font-black text-2xl uppercase mb-4 flex items-center gap-3">
        <span className="text-3xl">🗳️</span> Was this fair?
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => send('up')}
          disabled={status === 'sending' || status === 'sent'}
          className={`flex-1 border-4 border-slate-900 px-5 py-3 font-black text-xl transition-all hover:-translate-y-0.5 active:translate-y-1 ${
            rating === 'up'
              ? 'bg-[#86efac] shadow-[4px_4px_0px_#16a34a]'
              : 'bg-white shadow-[4px_4px_0px_#0f172a] hover:bg-[#f0fdf4]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          👍 Yes
        </button>
        <button
          type="button"
          onClick={() => send('down')}
          disabled={status === 'sending' || status === 'sent'}
          className={`flex-1 border-4 border-slate-900 px-5 py-3 font-black text-xl transition-all hover:-translate-y-0.5 active:translate-y-1 ${
            rating === 'down'
              ? 'bg-[#fca5a5] shadow-[4px_4px_0px_#dc2626]'
              : 'bg-white shadow-[4px_4px_0px_#0f172a] hover:bg-[#fef2f2]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          👎 No
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Optional: tell us why (for demo analytics)"
        className="mt-4 w-full bg-[#fdfaf6] border-4 border-slate-900 p-3 font-bold focus:outline-none focus:bg-[#fde047] focus:shadow-[4px_4px_0px_#f472b6] transition-all"
        rows={3}
      />

      <div className="mt-3">
        <span className={`inline-block text-sm font-black uppercase tracking-widest px-3 py-1 border-2 border-slate-900 ${statusBadge.bg} ${statusBadge.color}`}>
          {statusBadge.text}
        </span>
      </div>
    </div>
  );
}
