import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import MedimeshLogo from '../brand/MedimeshLogo';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { useAuth } from '../../hooks/useAuth';
import { sanitizeReturnDestination } from '../../routes/roleDashboardPaths';

const GoogleMark = () => (
  <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09A6.3 6.3 0 015.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function AuthModal({
  open,
  onClose,
  title = 'Continue with MEDIMESH',
  message = 'Sign in or create an account to continue.',
  returnTo,
  resumeAction,
  initialMode = 'login',
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (open) {
      setMode(initialMode || 'login');
      setError('');
      setSuccessMessage('');
      setLoadingAction(null);
    }
  }, [open, initialMode]);

  // Handle escape key, focus, and background scroll locking
  useEffect(() => {
    if (!open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handlePostAuthSuccess = (intendedPath) => {
    onClose();
    if (typeof resumeAction === 'function') {
      try {
        resumeAction();
      } catch (err) {
        console.error('Error resuming gated action:', err);
      }
    }
    if (intendedPath && typeof window !== 'undefined' && intendedPath !== window.location.pathname + window.location.search) {
      const safePath = sanitizeReturnDestination(intendedPath, 'patient');
      navigate(safePath);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction('email');
    setError('');
    setSuccessMessage('');

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      handlePostAuthSuccess(returnTo);
    } catch {
      setError('Unable to sign in. Please verify your email and password.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoadingAction('register');
    setError('');
    setSuccessMessage('');

    try {
      const profileData = {
        role: 'patient',
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`.trim() || email.split('@')[0],
        country: 'India',
      };

      const { error: signUpError } = await signUp(email, password, profileData);
      if (signUpError) throw signUpError;

      onClose();
      navigate('/verify-email', { state: { email } });
    } catch {
      setError('Could not create account. If you already registered, please sign in.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleSubmit = async () => {
    setLoadingAction('google');
    setError('');
    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) throw googleError;
    } catch {
      setError('Google sign-in could not be initialized. Please try again.');
      setLoadingAction(null);
    }
  };

  const safeReturnTo = sanitizeReturnDestination(returnTo, 'patient');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[26px] border border-white/90 bg-[#FCFBF8] p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,40,35,0.18)] backdrop-blur-2xl max-h-[92vh] overflow-y-auto overscroll-contain custom-scrollbar">
        {/* Close Button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center pt-1">
          <div className="inline-flex justify-center mb-3">
            <MedimeshLogo variant="mark" size="md" />
          </div>
          <h2 id="auth-modal-title" className="font-serif text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mt-5 flex items-center rounded-xl bg-surface-elevated/70 p-1 border border-border/60">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-primary shadow-sm border border-border/40'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-white text-primary shadow-sm border border-border/40'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2" role="status">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            <FormField
              id="auth-modal-email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground" htmlFor="auth-modal-password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FormField
                  id="auth-modal-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  inputClassName="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-xs font-bold py-2.5 shadow-sm"
              disabled={Boolean(loadingAction)}
            >
              {loadingAction === 'email' ? 'Signing in…' : 'Sign in to Continue'}
            </Button>
          </form>
        )}

        {/* Tab 2: Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="auth-modal-first-name"
                label="First name"
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <FormField
                id="auth-modal-last-name"
                label="Last name"
                required
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <FormField
              id="auth-modal-reg-email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5" htmlFor="auth-modal-reg-password">
                Create password (min. 8 characters)
              </label>
              <div className="relative">
                <FormField
                  id="auth-modal-reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  inputClassName="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-1 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary/30 border-border cursor-pointer shrink-0"
              />
              <span>
                I agree to MEDIMESH{' '}
                <Link to="/about" onClick={onClose} className="text-primary underline">Terms</Link>{' '}
                and <Link to="/about" onClick={onClose} className="text-primary underline">Privacy Policy</Link>.
              </span>
            </label>

            <Button
              type="submit"
              className="w-full text-xs font-bold py-2.5 shadow-sm mt-1"
              disabled={Boolean(loadingAction)}
            >
              {loadingAction === 'register' ? 'Creating account…' : 'Create Free Account'}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          <span className="h-px flex-1 bg-border/70" />
          or
          <span className="h-px flex-1 bg-border/70" />
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2.5 bg-white text-xs font-semibold py-2"
          onClick={handleGoogleSubmit}
          disabled={Boolean(loadingAction)}
        >
          <GoogleMark />
          <span>{loadingAction === 'google' ? 'Connecting…' : 'Continue with Google'}</span>
        </Button>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Continue as guest
          </button>

          <Link
            to={`/login?redirect=${encodeURIComponent(safeReturnTo)}`}
            onClick={onClose}
            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            Full login page <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Security badge note */}
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/75">
            <ShieldCheck className="w-3 h-3 text-primary" />
            Healthcare privacy protected with Row-Level Security
          </span>
        </div>
      </div>
    </div>
  );
}

