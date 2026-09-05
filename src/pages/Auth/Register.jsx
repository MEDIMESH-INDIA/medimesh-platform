import { useState } from 'react';
import { Building2, CheckCircle2, Eye, EyeOff, Stethoscope, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import FrostedPanel from '../../components/common/FrostedPanel';
import { useAuth } from '../../hooks/useAuth';
import { useGuestGuard } from '../../hooks/useGuestGuard';

const roles = [
  { id: 'patient', label: 'Patient', description: 'Discover and compare healthcare options.', icon: UserCircle, tone: 'text-primary bg-primary/10' },
  { id: 'doctor', label: 'Doctor', description: 'Build a professional presence and manage affiliations.', icon: Stethoscope, tone: 'text-coral bg-coral/10' },
  { id: 'hospital', label: 'Hospital', description: 'Represent your healthcare organization.', icon: Building2, tone: 'text-blue-muted bg-blue-light/15' },
];

const progressLabels = ['Account', 'Profile', 'Details', 'Review'];

export default function Register() {
  useGuestGuard();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setError('');
    setStep(2);
  };

  const submitProfile = (event) => {
    event.preventDefault();
    setError('');
    setStep(3);
  };

  const submitPassword = (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    setStep(4);
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    setError('');
    if (!termsAccepted) return setError('Accept the Terms and Privacy Policy to continue.');
    setLoading(true);
    try {
      const profileData = {
        role,
        first_name: role === 'hospital' ? null : firstName,
        last_name: role === 'hospital' ? null : lastName,
        display_name: role === 'hospital' ? hospitalName : `${firstName} ${lastName}`,
        phone,
        city,
        country: 'India',
      };
      const { error: signUpError } = await signUp(email, password, profileData);
      if (signUpError) throw signUpError;
      navigate('/verify-email', { state: { email } });
    } catch {
      setError('We could not create your account. If you already registered, sign in or use password recovery.');
    } finally {
      setLoading(false);
    }
  };

  const startGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: oauthError } = await signInWithGoogle();
      if (oauthError) throw oauthError;
    } catch {
      setError('Google sign-in could not be started. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your MEDIMESH account"
      subtitle="Choose how you’ll use MEDIMESH."
      eyebrow="Join the mesh"
      statement="One clear place for healthcare context."
      description="Create a workspace for discovery, professional identity, or organization information—without implying verification."
    >
      <div className="mb-7 grid grid-cols-4 gap-2" aria-label={`Registration step ${step} of 4`}>
        {progressLabels.map((label, index) => (
          <div key={label}>
            <div className={`h-1.5 rounded-full transition-all ${step >= index + 1 ? 'bg-primary' : 'bg-primary/15'}`} />
            <p className={`mt-2 hidden text-[9px] font-bold uppercase tracking-[0.1em] sm:block ${step === index + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
          </div>
        ))}
      </div>

      {error && <div className="mb-5 rounded-[12px] border border-destructive/20 bg-red-50/80 p-3 text-sm text-destructive" role="alert">{error}</div>}

      {step === 1 && (
        <div className="space-y-3">
          {roles.map((item) => (
            <FrostedPanel
              as="button"
              type="button"
              key={item.id}
              onClick={() => selectRole(item.id)}
              className="group flex w-full items-center gap-4 rounded-[20px] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white/85"
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[14px] ${item.tone}`}><item.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><strong className="block font-serif text-lg font-semibold">{item.label}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span></span>
              <span className="h-2 w-2 rounded-full bg-primary/20 transition group-hover:bg-primary" />
            </FrostedPanel>
          ))}
          <div className="flex items-center gap-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button type="button" variant="outline" className="w-full" onClick={startGoogle} disabled={loading}>{loading ? 'Connecting…' : 'Continue with Google'}</Button>
          <p className="pt-2 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link></p>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={submitProfile} className="space-y-4">
          <h3 className="font-serif text-xl font-semibold">{role === 'hospital' ? 'Organization profile' : 'Your profile'}</h3>
          {role === 'hospital' ? (
            <FormField id="organization-name" label="Organization name" required value={hospitalName} onChange={(event) => setHospitalName(event.target.value)} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="first-name" label="First name" autoComplete="given-name" required value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              <FormField id="last-name" label="Last name" autoComplete="family-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
          )}
          <FormField id="register-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="phone" label="Phone" type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} />
            <FormField id="city" label="City" autoComplete="address-level2" required value={city} onChange={(event) => setCity(event.target.value)} />
          </div>
          <StepActions back={() => setStep(1)} />
        </form>
      )}

      {step === 3 && (
        <form onSubmit={submitPassword} className="space-y-4">
          <h3 className="font-serif text-xl font-semibold">Secure your account</h3>
          <div className="relative">
            <FormField id="register-password" label="Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required helpText="Use at least eight characters." inputClassName="pr-12" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-[2.55rem] text-muted-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          <FormField id="register-password-confirm" label="Confirm password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <StepActions back={() => setStep(2)} />
        </form>
      )}

      {step === 4 && (
        <form onSubmit={submitRegistration} className="space-y-5">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-primary/10 text-primary"><CheckCircle2 className="h-6 w-6" /></span>
            <h3 className="mt-4 font-serif text-xl font-semibold">Review your {role} account</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Professional and organization accounts begin with verification pending. Account creation is not verification.</p>
          </div>
          <label className="flex items-start gap-3 rounded-[14px] border border-border bg-white/55 p-4 text-sm leading-6 text-muted-foreground">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>I agree to the MEDIMESH Terms of Service and Privacy Policy.</span>
          </label>
          <StepActions back={() => setStep(3)} loading={loading} final />
        </form>
      )}
    </AuthLayout>
  );
}

function StepActions({ back, loading = false, final = false }) {
  return (
    <div className="flex gap-3 border-t border-border pt-5">
      <Button type="button" variant="ghost" onClick={back}>Back</Button>
      <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Creating account…' : final ? 'Create account' : 'Continue'}</Button>
    </div>
  );
}
