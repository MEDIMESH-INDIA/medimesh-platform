import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function Toast({ message, tone = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div className="fixed bottom-5 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-white/95 px-4 py-3 text-sm font-medium text-foreground shadow-xl backdrop-blur-xl" role="status" aria-live="polite">
      <Icon className={`h-5 w-5 shrink-0 ${tone === 'error' ? 'text-red-600' : 'text-primary'}`} />
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-surface hover:text-foreground" aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
    </div>
  );
}
