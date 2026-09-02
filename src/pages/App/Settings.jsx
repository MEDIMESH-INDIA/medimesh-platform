import { useAuth } from '../../hooks/useAuth';
import AppPageContainer from '../../components/layout/AppPageContainer';

export default function Settings() {
  const { user } = useAuth();
  
  return (
    <AppPageContainer className="max-w-3xl mx-0">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security.</p>
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
              <p className="text-sm text-muted-foreground mt-1">Update your account password</p>
            </div>
            <button className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors">Change</button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-4 font-serif">Notifications</h3>
          <div className="text-center py-8 bg-surface/50 rounded-xl border border-dashed border-border/60">
            <p className="text-muted-foreground text-sm font-medium">Notification preferences coming soon.</p>
          </div>
        </div>
      </div>
    </AppPageContainer>
  );
}
