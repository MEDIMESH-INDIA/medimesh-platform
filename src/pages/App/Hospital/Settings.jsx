import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, KeyRound, LogOut, Mail, Shield, UserCog } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import Button from '../../../components/common/Button';
import FrostedPanel from '../../../components/common/FrostedPanel';
import PageHeader from '../../../components/common/PageHeader';
import Toast from '../../../components/common/Toast';
import { HospitalPortalGate, PortalStatusBadge } from '../../../components/hospital/portal/HospitalPortalState';
import { useAuth } from '../../../hooks/useAuth';
import { useHospitalPortal } from '../../../hooks/useHospitalPortal';

function SettingsContent({ workspace }) {
  const { user, resetPassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [toast, setToast] = useState(null);

  const sendPasswordReset = async () => {
    if (!user?.email || resetting) return;
    setResetting(true);
    try {
      const { error } = await resetPassword(user.email);
      if (error) throw error;
      setToast({ tone: 'success', message: 'Password reset email sent.' });
    } catch (error) {
      console.error('Could not send password reset email:', error);
      setToast({ tone: 'error', message: 'Could not send a password reset email.' });
    } finally {
      setResetting(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Could not sign out:', error);
      setToast({ tone: 'error', message: 'Could not sign out. Please try again.' });
      setSigningOut(false);
    }
  };

  return (
    <AppPageContainer>
      <PageHeader eyebrow="Hospital account" title="Settings" description="Review private account details, organization access, and public profile visibility." />
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <FrostedPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3 border-b border-border/70 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/5 text-primary"><Mail className="h-5 w-5" /></span>
              <div><h2 className="font-serif text-xl font-semibold">Account identity</h2><p className="text-xs text-muted-foreground">Private sign-in information</p></div>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-xs font-medium text-muted-foreground">Email address</dt><dd className="mt-1 break-all font-semibold">{user?.email || 'Not provided'}</dd></div>
              <div><dt className="text-xs font-medium text-muted-foreground">Email confirmation</dt><dd className="mt-1"><PortalStatusBadge tone={user?.email_confirmed_at ? 'success' : 'warning'}>{user?.email_confirmed_at ? 'confirmed' : 'pending'}</PortalStatusBadge></dd></div>
            </dl>
          </FrostedPanel>

          <FrostedPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3 border-b border-border/70 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/5 text-primary"><Building2 className="h-5 w-5" /></span>
              <div><h2 className="font-serif text-xl font-semibold">Organization access</h2><p className="text-xs text-muted-foreground">Canonical ownership connection</p></div>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-xs font-medium text-muted-foreground">Organization</dt><dd className="mt-1 font-semibold">{workspace.organization?.organization_name || workspace.hospital.name}</dd></div>
              <div className="flex flex-wrap gap-6"><div><dt className="text-xs font-medium text-muted-foreground">Membership</dt><dd className="mt-1"><PortalStatusBadge tone="primary">{workspace.membership.membership_role}</PortalStatusBadge></dd></div><div><dt className="text-xs font-medium text-muted-foreground">Status</dt><dd className="mt-1"><PortalStatusBadge tone="success">{workspace.membership.status}</PortalStatusBadge></dd></div></div>
            </dl>
          </FrostedPanel>
        </div>

        <FrostedPanel className="p-5 sm:p-6">
          <div className="flex items-center gap-3 border-b border-border/70 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/5 text-primary"><Shield className="h-5 w-5" /></span>
            <div><h2 className="font-serif text-xl font-semibold">Profile visibility</h2><p className="text-xs text-muted-foreground">Reviewer-controlled public state</p></div>
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <PortalStatusBadge tone={workspace.hospital.publication_status === 'published' ? 'success' : 'neutral'}>{workspace.hospital.publication_status}</PortalStatusBadge>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Hospital members can edit safe profile fields but cannot publish, archive, or verify the canonical record.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><UserCog className="h-4 w-4" /> Managed by MEDIMESH review</div>
          </div>
        </FrostedPanel>

        <FrostedPanel className="p-5 sm:p-6">
          <h2 className="font-serif text-xl font-semibold">Security</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use email-based account recovery or end this session.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={() => void sendPasswordReset()} disabled={resetting || !user?.email} className="gap-2"><KeyRound className="h-4 w-4" /> {resetting ? 'Sending…' : 'Send password reset email'}</Button>
            <Button type="button" variant="outline" onClick={() => void handleSignOut()} disabled={signingOut} className="gap-2 border-red-200 text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" /> {signingOut ? 'Signing out…' : 'Sign out'}</Button>
          </div>
        </FrostedPanel>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </AppPageContainer>
  );
}

export default function HospitalSettings() {
  const portal = useHospitalPortal();
  return <HospitalPortalGate portal={portal}>{workspace => <SettingsContent workspace={workspace} />}</HospitalPortalGate>;
}
