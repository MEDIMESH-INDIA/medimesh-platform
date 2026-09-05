import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import MedimeshLogo from '../../components/brand/MedimeshLogo';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerification } = useAuth();
  const email = location.state?.email || null;
  
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resendError } = await resendVerification(email);
      if (resendError) throw resendError;
      
      setMessage('A new verification email has been sent.');
      setCountdown(30);
    } catch {
      setError('We could not resend the verification email. Please wait a moment and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      compact
      title="Check your inbox" 
      subtitle="We've sent you a verification link"
    >
      <div className="flex flex-col items-center justify-center py-6">
        <div className="mb-6 flex justify-center">
          <MedimeshLogo variant="mark" size="xl" className="h-16" />
        </div>
        
        {email && (
          <p className="text-center font-medium text-foreground mb-4">
            {email}
          </p>
        )}

        <p className="text-center text-muted-foreground mb-8 text-sm leading-relaxed">
          Click the link in the email we sent to verify your account. 
          If you don&apos;t see it, check your spam folder.
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="w-full p-3 mb-6 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 text-center">
            {message}
          </div>
        )}

        {!email && (
          <p className="mb-5 rounded-[12px] border border-border bg-surface-elevated/60 p-3 text-center text-xs leading-5 text-muted-foreground">
            Open this page from registration to resend an email. You can still return to sign in.
          </p>
        )}

        {email ? (
          <Button 
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            variant="outline"
            className="w-full justify-center mb-4 border-primary text-primary hover:bg-primary/5"
          >
            {loading ? 'Sending...' : countdown > 0 ? `Resend available in ${countdown}s` : 'Resend verification email'}
          </Button>
        ) : null}

        <Link 
          to="/login"
          className="w-full flex justify-center items-center px-4 py-2 bg-foreground text-white rounded-xl shadow-sm hover:shadow-card-hover transition-all font-semibold hover:-translate-y-0.5 mb-4"
        >
          Return to Login
        </Link>
        
        {email && (
          <button
            onClick={() => navigate('/register')}
            className="text-sm font-semibold text-muted-foreground hover:text-primary hover:underline"
          >
            Change email address
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
