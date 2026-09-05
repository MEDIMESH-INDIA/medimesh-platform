import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useAuth } from '../../hooks/useAuth';

const GoogleMark = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09A6.3 6.3 0 015.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoadingAction('email');
    setError('');
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      // GuestRoute will handle the post-login redirect automatically.
    } catch {
      setError('Unable to sign in. Check your email and password, then try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingAction('google');
    setError('');
    try {
      const { error: signInError } = await signInWithGoogle();
      if (signInError) throw signInError;
    } catch {
      setError('Google sign-in could not be started. Please try again.');
      setLoadingAction(null);
    }
  };

  return (
    <AuthLayout title="Sign in to MEDIMESH" subtitle="Continue your healthcare discovery journey.">
      <form onSubmit={handleLogin} className="space-y-5">
        {error && <div className="rounded-[12px] border border-destructive/20 bg-red-50/80 p-3 text-sm text-destructive" role="alert">{error}</div>}
        <FormField id="email" label="Email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <FormField id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} inputClassName="pr-12" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={Boolean(loadingAction)}>{loadingAction === 'email' ? 'Signing in…' : 'Sign in'}</Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <Button type="button" variant="outline" className="w-full gap-3 bg-white/80" onClick={handleGoogleLogin} disabled={Boolean(loadingAction)}>
        <GoogleMark /> {loadingAction === 'google' ? 'Connecting…' : 'Continue with Google'}
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">New to MEDIMESH? <Link to="/register" className="font-bold text-primary hover:underline">Create account</Link></p>
    </AuthLayout>
  );
}
