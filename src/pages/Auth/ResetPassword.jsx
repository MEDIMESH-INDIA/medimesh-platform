import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionAvailable, setSessionAvailable] = useState(false);
  
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // When clicking the link in the email, Supabase handles the hash fragment in the URL
    // and sets the session. We need to verify that we have an active session to reset the password.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionAvailable(true);
      } else {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) throw updateError;
      
      navigate('/login?message=Password updated successfully');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionAvailable && error) {
    return (
      <AuthLayout title="Reset Password" subtitle="Session Expired">
         <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-6">
            {error}
          </div>
          <Button onClick={() => navigate('/forgot-password')} className="w-full justify-center">
            Request New Link
          </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="Create New Password" 
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleReset} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full justify-center shadow-sm hover:-translate-y-0.5" 
          disabled={loading || !sessionAvailable}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
