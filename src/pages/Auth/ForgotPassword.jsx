import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      if (err.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        // Prevent email enumeration
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout compact title="Check your email" subtitle="Password reset instructions are on their way.">
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            If an account exists for {email}, you will receive a password reset link shortly.
          </p>
          <Link to="/login">
            <Button className="w-full justify-center">Return to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      compact
      title="Reset your password"
      subtitle="Enter your account email and we’ll send a secure reset link."
    >
      <form onSubmit={handleReset} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}
        
        <FormField id="email" label="Email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

        <Button 
          type="submit" 
          className="w-full justify-center shadow-sm hover:-translate-y-0.5" 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
