import { useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, Mail, Shield, Sliders, LogOut, Copy, Check, Trash2 } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';

export default function Settings() {
  const { user, profile, resetPassword, signOut } = useAuth();
  const [resetStatus, setResetStatus] = useState('idle');
  const [copiedId, setCopiedId] = useState(false);
  const [clearedCompare, setClearedCompare] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetStatus('loading');
    try {
      const { error } = await resetPassword(user.email);
      setResetStatus(error ? 'error' : 'sent');
    } catch {
      setResetStatus('error');
    }
  };

  const copyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleClearCompare = () => {
    localStorage.removeItem('compareList');
    window.dispatchEvent(new Event('compare-updated'));
    setClearedCompare(true);
    setTimeout(() => setClearedCompare(false), 2500);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      setSigningOut(false);
    }
  };

  const provider = user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email & Password';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not available';

  return (
    <AppPageContainer>
      <div className="space-y-7">
        <PageHeader
          eyebrow="Account control"
          title="Account Settings"
          description="Review your account identity, security options, and platform preferences."
        />

        <div className="space-y-6">
          {/* 1. Account Identity */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">Account Identity</h2>
                <p className="text-xs text-muted-foreground">Credentials and profile association.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-xl border border-border/50 bg-surface/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email Address</span>
                <p className="mt-1 font-medium text-foreground break-all text-sm">{user?.email || 'Not provided'}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    user?.email_confirmed_at ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {user?.email_confirmed_at ? <Check className="w-3 h-3" /> : null}
                    {user?.email_confirmed_at ? 'Verified' : 'Pending confirmation'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-surface/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account Role</span>
                <p className="mt-1 font-medium text-foreground capitalize text-sm">{profile?.role || 'Patient'}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    Active MEDIMESH Account
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Account ID:</span>
                <code className="px-2 py-0.5 rounded bg-surface border border-border/60 font-mono text-[11px] text-foreground">
                  {user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-6)}` : 'N/A'}
                </code>
                <button
                  type="button"
                  onClick={copyUserId}
                  className="p-1 hover:bg-surface rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy User ID"
                  aria-label="Copy User ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div>Member since {memberSince}</div>
            </div>
          </FrostedPanel>

          {/* 2. Security */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">Security & Access</h2>
                <p className="text-xs text-muted-foreground">Sign-in method and password controls.</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sign-in Provider</span>
                <p className="mt-1 font-medium text-foreground text-sm">{provider}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Authentication is verified securely through Supabase Auth.</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Password Management</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {resetStatus === 'sent'
                      ? 'A password reset link has been dispatched to your email.'
                      : resetStatus === 'error'
                      ? 'Unable to send password reset email. Please try again later.'
                      : 'Send a one-time secure link to reset or update your password.'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handlePasswordReset}
                disabled={resetStatus === 'loading' || resetStatus === 'sent'}
                className="shrink-0 gap-2 text-xs font-semibold px-4 py-2"
              >
                {resetStatus === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {resetStatus === 'sent' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                {resetStatus === 'sent' ? 'Reset link sent' : 'Send reset link'}
              </Button>
            </div>
          </FrostedPanel>

          {/* 3. Platform Preferences */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">Application Preferences</h2>
                <p className="text-xs text-muted-foreground">Local session and geographic configuration.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-xl border border-border/50 bg-surface/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Default Geographic Scope</span>
                <p className="mt-1 font-medium text-foreground text-sm">Navi Mumbai, Maharashtra</p>
                <p className="text-xs text-muted-foreground mt-1">MEDIMESH indexed hospital directory active.</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-surface/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Interface Language</span>
                <p className="mt-1 font-medium text-foreground text-sm">English (India)</p>
                <p className="text-xs text-muted-foreground mt-1">Official platform locale.</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Comparison Cache</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clear any temporary hospital selections saved in your browser&apos;s comparison tray.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearCompare}
                className="shrink-0 gap-2 text-xs font-semibold px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                {clearedCompare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Trash2 className="w-3.5 h-3.5" />}
                {clearedCompare ? 'Tray cleared' : 'Clear compare tray'}
              </Button>
            </div>
          </FrostedPanel>

          {/* 4. Session & Sign Out */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 border-red-200/50 bg-red-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-700 shrink-0">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-semibold text-red-900">Sign Out of MEDIMESH</h2>
                <p className="text-xs text-red-700/80 mt-0.5">
                  End your current session on this device. You will need to sign in again to access patient features.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Out'}
            </Button>
          </FrostedPanel>
        </div>
      </div>
    </AppPageContainer>
  );
}
