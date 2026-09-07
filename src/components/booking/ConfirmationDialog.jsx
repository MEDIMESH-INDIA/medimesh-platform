import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';

export default function ConfirmationDialog({ open, title, description, confirmLabel, cancelLabel = 'Keep visit', tone = 'primary', busy = false, onConfirm, onClose, children }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;
    closeRef.current?.focus();
    const handleKeyDown = event => {
      if (event.key === 'Escape' && !busy) onClose();
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [href]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      returnFocusRef.current?.focus?.();
    };
  }, [busy, onClose, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#102c27]/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => event.target === event.currentTarget && !busy && onClose()}>
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description" className="w-full max-w-md rounded-[22px] border border-white/70 bg-[#fffdf8] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <button ref={closeRef} type="button" onClick={onClose} disabled={busy} className="rounded-full p-2 text-muted-foreground hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Close dialog">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 id="confirmation-title" className="mt-4 font-serif text-2xl font-semibold text-foreground">{title}</h2>
        <p id="confirmation-description" className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
          <Button type="button" onClick={onConfirm} disabled={busy} className={tone === 'danger' ? 'bg-rose-700 hover:bg-rose-800' : ''}>
            {busy ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
