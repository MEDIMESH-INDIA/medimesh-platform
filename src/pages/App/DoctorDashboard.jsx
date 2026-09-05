import { AlertCircle, CheckCircle2, MapPin, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const isVerified = profile?.verification_status === 'verified';
  const StatusIcon = isVerified ? CheckCircle2 : AlertCircle;

  return (
    <AppPageContainer>
      <PageHeader eyebrow="Professional workspace" title="Doctor profile" description="Review the professional account information and verification state currently stored for your profile." actions={<Button as={Link} to="/app/profile" variant="outline">Edit profile</Button>} />
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <FrostedPanel variant="elevated" className="rounded-[26px] p-7 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[15px] bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Professional identity</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">{profile?.display_name || 'Name not provided'}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{profile?.city || 'Location not provided'}</p>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm leading-6 text-muted-foreground">Professional qualifications, specialization, and affiliations submitted during onboarding remain protected account data. This dashboard does not publish or rank them.</p>
          </div>
        </FrostedPanel>

        <FrostedPanel className="rounded-[24px] p-6">
          <StatusIcon className={`h-6 w-6 ${isVerified ? 'text-primary' : 'text-amber-600'}`} />
          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Verification state</p>
          <h2 className="mt-2 font-serif text-xl font-semibold capitalize">{profile?.verification_status || 'Not provided'}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{isVerified ? 'Your account record is marked verified.' : 'Creating an account does not verify a medical professional. Review remains pending.'}</p>
          <div className="mt-5 rounded-[12px] border border-border bg-white/55 p-3 text-xs font-medium text-muted-foreground">Onboarding: {profile?.onboarding_completed ? 'Complete' : 'Incomplete'}</div>
        </FrostedPanel>
      </div>
    </AppPageContainer>
  );
}
