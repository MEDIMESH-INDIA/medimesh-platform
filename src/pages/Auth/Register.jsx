import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, UserCircle, Stethoscope, Building2 } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  
  // Basic Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Hospital specific
  const [hospitalName, setHospitalName] = useState('');

  // Location Info
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UX State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setError('');
  };

  const handleBasicInfoSubmit = (e) => {
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

    setStep(3);
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
        country,
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

  if (step === 1) {
    return (
      <AuthLayout 
        title="Create an account" 
        subtitle="How will you use MEDIMESH?"
      >
        <div className="space-y-4">
          <button 
            type="button"
            onClick={() => handleRoleSelect('patient')}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border border-border bg-white shadow-sm hover:shadow-card-hover hover:border-primary/40 transition-all text-left group"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
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
            <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary-accent/10 text-secondary-accent flex items-center justify-center border border-secondary-accent/10">
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
            <div className="w-12 h-12 shrink-0 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center border border-foreground/10">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-1">Hospital or Clinic</h3>
              <p className="text-sm text-muted-foreground">Present your institution and help patients find specialized services.</p>
            </div>
          </button>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  if (step === 2) {
    return (
      <AuthLayout 
        title="Basic Information"
        subtitle={`Tell us about yourself to set up your ${role} account`}
      >
        <form onSubmit={handleBasicInfoSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {role === 'hospital' ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Organization Name *</label>
              <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
              <input required type="email" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
              <input required type="tel" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
              <input required type={showPassword ? "text" : "password"} className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password *</label>
              <input required type={showPassword ? "text" : "password"} className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-2 rounded-xl border border-border text-foreground hover:bg-surface-elevated transition-colors font-medium">
              Back
            </button>
            <Button type="submit" className="flex-1 justify-center shadow-sm hover:-translate-y-0.5">
              Continue
            </Button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Location Profile"
      subtitle="Just a few more details to finish setting up"
    >
      <form onSubmit={handleFinalSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">City *</label>
            <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
            <input required type="text" className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-elevated text-muted-foreground" value={country} disabled />
          </div>
        </div>

        <div className="flex items-start gap-3 mt-6 bg-surface-elevated/50 p-4 rounded-xl border border-border/50">
          <input 
            type="checkbox" 
            id="terms" 
            className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary shrink-0"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            {(role === 'doctor' || role === 'hospital') && " I understand that creating an account does not mean professional verification."}
          </label>
        </div>

        <div className="flex gap-4 mt-6">
          <button type="button" onClick={() => setStep(2)} className="px-6 py-2 rounded-xl border border-border text-foreground hover:bg-surface-elevated transition-colors font-medium">
            Back
          </button>
          <Button type="submit" className="flex-1 justify-center shadow-sm hover:-translate-y-0.5" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
