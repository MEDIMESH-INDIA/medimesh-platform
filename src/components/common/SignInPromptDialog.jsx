import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import Button from './Button';
import FrostedPanel from './FrostedPanel';

export default function SignInPromptDialog({ open, onClose, returnTo }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKeyDown = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;
  const loginPath = `/login?redirect=${encodeURIComponent(returnTo || '/discover')}`;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="save-sign-in-title">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-label="Close sign in prompt" />
      <FrostedPanel variant="floating" className="relative z-10 w-full max-w-md rounded-[26px] p-7 text-center">
        <button ref={closeRef} type="button" onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-surface" aria-label="Close"><X className="h-4 w-4" /></button>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Heart className="h-6 w-6" /></span>
        <h2 id="save-sign-in-title" className="mt-5 font-serif text-2xl font-semibold text-foreground">Sign in to save hospitals</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Keep a private shortlist and return to it from any signed-in device.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Not now</Button>
          <Button as={Link} to={loginPath}>Sign in</Button>
        </div>
      </FrostedPanel>
    </div>
  );
}
