import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [resetStatus, setResetStatus] = useState('idle'); // idle, loading, sent, error

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetStatus('loading');
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      console.error(error);
      setResetStatus('error');
    } else {
      setResetStatus('sent');
    }
  };
  
  return (
    <AppPageContainer>
      <div className="max-w-[900px] space-y-8">
        <div>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">ACCOUNT CONTROL</p>
          <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and security.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 font-serif">Account Information</h3>
            <div className="p-4 bg-surface/50 rounded-xl border border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground uppercase tracking-wider">Email Address</p>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Verified</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 font-serif">Security</h3>
            <div className="p-4 bg-surface/50 rounded-xl border border-border flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-foreground uppercase tracking-wider">Password</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {resetStatus === 'sent' 
                    ? 'A password reset email has been sent.' 
                    : resetStatus === 'error' 
                      ? 'Error sending reset email. Please try again.'
                      : 'Update your account password'}
                </p>
              </div>
              <button 
                onClick={handlePasswordReset}
                disabled={resetStatus === 'loading' || resetStatus === 'sent'}
                className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
              >
                {resetStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                {resetStatus === 'sent' && <CheckCircle2 className="w-4 h-4" />}
                {resetStatus === 'sent' ? 'Sent' : 'Change'}
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 font-serif">Notifications</h3>
            <div className="text-center py-8 bg-surface/50 rounded-xl border border-dashed border-border/60 opacity-60 pointer-events-none">
              <p className="text-muted-foreground text-sm font-medium">Notification preferences coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </AppPageContainer>
  );
}
