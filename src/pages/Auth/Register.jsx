import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, UserCircle, Stethoscope, Building2, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  
  // Personal / Org Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  
  // Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Final
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UX State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp, signInWithGoogle, user, role: sessionRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && sessionRole) {
      navigate('/app');
    }
  }, [user, sessionRole, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await signInWithGoogle();
      if (signInError) throw signInError;
      // AuthContext handles redirect
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google.');
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setError('');
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    setError('');
    setStep(3);
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setStep(4);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!termsAccepted) {
      setError("You must accept the Terms and Privacy Policy.");
      setLoading(false);
      return;
    }

    try {
      const profileData = {
        role,
        first_name: role === 'hospital' ? null : firstName,
        last_name: role === 'hospital' ? null : lastName,
        display_name: role === 'hospital' ? hospitalName : `${firstName} ${lastName}`,
        phone,
        city,
        country: 'India', // Default as requested
      };

      const { error: signUpError } = await signUp(email, password, profileData);
      
      if (signUpError) throw signUpError;
      
      // Redirect to verification email notice
      navigate('/verify-email', { state: { email } });
      
    } catch (err) {
      if (err.message.includes('User already registered')) {
        setError('This email is already registered.');
      } else {
        setError(err.message || 'Something went wrong while creating your account.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step indicator component
  const StepIndicator = ({ current }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className={`h-1.5 rounded-full transition-all duration-300 ${
            current >= i ? 'w-8 bg-primary' : 'w-4 bg-primary/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <AuthLayout 
      title="Create your MEDIMESH account" 
      subtitle="Join the healthcare discovery ecosystem."
    >
      <StepIndicator current={step} />

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            type="button"
            onClick={() => handleRoleSelect('patient')}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border border-border bg-white shadow-sm hover:shadow-card-hover hover:border-primary/40 transition-all text-left group"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-1">Patient</h3>
              <p className="text-sm text-muted-foreground">Find hospitals, compare healthcare options, and make informed choices.</p>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => handleRoleSelect('doctor')}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border border-border bg-white shadow-sm hover:shadow-card-hover hover:border-secondary-accent/40 transition-all text-left group"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary-accent/10 text-secondary-accent flex items-center justify-center border border-secondary-accent/10 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-1">Doctor</h3>
              <p className="text-sm text-muted-foreground">Highlight your specialties and establish a trusted professional presence.</p>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => handleRoleSelect('hospital')}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border border-border bg-white shadow-sm hover:shadow-card-hover hover:border-foreground/40 transition-all text-left group"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center border border-foreground/10 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-1">Hospital or Clinic</h3>
              <p className="text-sm text-muted-foreground">Present your institution and help patients find specialized services.</p>
            </div>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">OR</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-xl border border-border bg-white text-foreground hover:bg-surface-elevated transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleInfoSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {role === 'hospital' ? 'Organization Details' : 'Personal Details'}
          </h2>
          
          {role === 'hospital' ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Organization Name *</label>
              <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
            <input required type="email" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
              <input required type="tel" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City *</label>
              <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={city} onChange={e => setCity(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-4">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-2 rounded-xl border border-border text-foreground hover:bg-surface-elevated transition-colors font-medium">
              Back
            </button>
            <Button type="submit" className="flex-1 justify-center shadow-sm hover:-translate-y-0.5">
              Continue
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-semibold text-foreground mb-4">Secure your account</h2>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm Password *</label>
            <input required type={showPassword ? "text" : "password"} className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          <div className="flex gap-4 mt-8 pt-4">
            <button type="button" onClick={() => setStep(2)} className="px-6 py-2 rounded-xl border border-border text-foreground hover:bg-surface-elevated transition-colors font-medium">
              Back
            </button>
            <Button type="submit" className="flex-1 justify-center shadow-sm hover:-translate-y-0.5">
              Continue
            </Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">You're almost ready!</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Review and agree to the terms to complete your {role} account setup.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-surface-elevated/50 p-4 rounded-xl border border-border/50">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary shrink-0 transition-colors"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                I agree to the <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.
                {(role === 'doctor' || role === 'hospital') && " I understand that creating an account does not mean professional verification."}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setStep(3)} className="px-6 py-2 rounded-xl border border-border text-foreground hover:bg-surface-elevated transition-colors font-medium">
              Back
            </button>
            <Button type="submit" className="flex-1 justify-center shadow-sm hover:-translate-y-0.5" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
