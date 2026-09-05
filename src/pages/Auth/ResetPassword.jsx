import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');
  const [sessionAvailable, setSessionAvailable] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setSessionAvailable(Boolean(session));
      if (!session) setError('Invalid or expired password reset link. Please request a new one.');
      setCheckingSession(false);
    }).catch(() => {
      if (!active) return;
      setError('We could not validate this reset link. Please request a new one.');
      setCheckingSession(false);
    });
    return () => { active = false; };
  }, []);

  const handleReset = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) throw updateError;
      navigate('/login?message=Password updated successfully');
    } catch {
      setError('Your password could not be updated. Request a new link and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return <AuthLayout compact title="Checking your link" subtitle="Please wait while we validate this password reset."><LoadingState label="Validating secure link…" /></AuthLayout>;
  }

  if (!sessionAvailable) {
    return (
      <AuthLayout compact title="Reset password" subtitle="This reset link is no longer available.">
        <div className="rounded-[12px] border border-destructive/20 bg-red-50/80 p-3 text-sm text-destructive" role="alert">{error}</div>
        <Button onClick={() => navigate('/forgot-password')} className="mt-5 w-full">Request new link</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout compact title="Create a new password" subtitle="Use at least eight characters for your new password.">
      <form onSubmit={handleReset} className="space-y-5 text-left">
        {error && <div className="rounded-[12px] border border-destructive/20 bg-red-50/80 p-3 text-sm text-destructive" role="alert">{error}</div>}
        <div className="relative">
          <FormField id="new-password" label="New password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required inputClassName="pr-12" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-[2.55rem] text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FormField id="confirm-password" label="Confirm new password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
      </form>
    </AuthLayout>
  );
}
