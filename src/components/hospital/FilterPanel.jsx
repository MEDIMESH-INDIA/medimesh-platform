import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// A viewport-level drawer avoids clipping inside animated page containers.
export default function FilterPanel({ open, onClose, label, children }) {
  const desktop = useMediaQuery('(min-width: 1024px)');
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open || desktop) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => [...panel.current.querySelectorAll('button, input, select, a[href], [tabindex="0"]')]
      .filter(element => !element.disabled && element.getClientRects().length);
    focusable()[0]?.focus();
    const onKeyDown = event => {
      if (event.key === 'Escape') close.current();
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [open, desktop]);

  if (desktop) return <aside className="discovery-filters w-[248px] shrink-0" aria-label={label}>{children}</aside>;

  return createPortal(
    <div hidden={!open} className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside ref={panel} role="dialog" aria-modal="true" aria-label={label} className="discovery-filters absolute inset-y-0 left-0 w-full max-w-[360px] overflow-y-auto overscroll-contain border-r border-border bg-background p-5 shadow-xl">
        {children}
      </aside>
    </div>, document.body,
  );
}
