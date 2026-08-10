import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyPhone() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!phone) {
      setError('Please enter a valid phone number with country code (e.g., +91).');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({ phone });
      if (error) throw error;
      setStep('otp');
      setCooldown(45);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'phone_change'
      });
      
      if (error) throw error;
      
      // Verification successful, ProtectedRoute will redirect to /onboarding
      window.location.reload(); // Quick way to refresh auth state and trigger redirect
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length, 5)].focus();
    }
  };

  if (step === 'phone') {
    return (
      <AuthLayout 
        title="Verify your phone" 
        subtitle="We need to verify your phone number to secure your account."
      >
        <form onSubmit={handleSendOtp} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">Include country code (e.g., +91 for India)</p>
          </div>

          <Button 
            type="submit" 
            className="w-full justify-center shadow-sm hover:-translate-y-0.5" 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Enter Verification Code" 
      subtitle={`We sent a 6-digit code to ${phone}`}
    >
      <form onSubmit={handleVerifyOtp} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground bg-white"
              value={digit}
              onChange={e => handleOtpChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
            />
          ))}
        </div>

        <Button 
          type="submit" 
          className="w-full justify-center shadow-sm hover:-translate-y-0.5" 
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Phone'}
        </Button>
        
        <div className="flex flex-col items-center gap-2 mt-6">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={cooldown > 0 || loading}
            className="text-sm font-semibold text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Change phone number
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
