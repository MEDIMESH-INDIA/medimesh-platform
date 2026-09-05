import { useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, Mail } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';

export default function Settings() {
  const { user, resetPassword } = useAuth();
  const [resetStatus, setResetStatus] = useState('idle');

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetStatus('loading');
    const { error } = await resetPassword(user.email);
    setResetStatus(error ? 'error' : 'sent');
  };

  return (
    <AppPageContainer>
      <div className="max-w-[900px]">
        <PageHeader eyebrow="Account control" title="Settings" description="Review your account identity and access security." />

        <div className="space-y-5">
          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Account</p>
                <h2 className="mt-1 font-serif text-xl font-semibold">Email address</h2>
                <p className="mt-2 break-all text-sm text-muted-foreground">{user?.email || 'Not provided'}</p>
              </div>
              <span className={`rounded-[10px] px-2.5 py-1 text-xs font-semibold ${user?.email_confirmed_at ? 'bg-primary/10 text-primary' : 'bg-amber/15 text-amber-700'}`}>
                {user?.email_confirmed_at ? 'Confirmed' : 'Not confirmed'}
              </span>
            </div>
          </FrostedPanel>

          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary"><KeyRound className="h-5 w-5" /></span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Security</p>
                  <h2 className="mt-1 font-serif text-xl font-semibold">Password</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {resetStatus === 'sent' ? 'A password reset email has been sent.' : resetStatus === 'error' ? 'The reset email could not be sent. Please try again.' : 'Send a secure password reset link to your email.'}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handlePasswordReset} disabled={resetStatus === 'loading' || resetStatus === 'sent'} className="shrink-0 gap-2">
                {resetStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                {resetStatus === 'sent' && <CheckCircle2 className="h-4 w-4" />}
                {resetStatus === 'sent' ? 'Email sent' : 'Change password'}
              </Button>
            </div>
          </FrostedPanel>
        </div>
      </div>
    </AppPageContainer>
  );
}
