import { useAuth } from '../../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4">Account Information</h3>
          <div className="p-4 bg-surface-elevated rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground">Email Address</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Security</h3>
          <div className="p-4 bg-surface-elevated rounded-xl border border-border flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-sm text-muted-foreground mt-1">Update your password</p>
            </div>
            <button className="text-sm font-semibold text-primary hover:underline">Change</button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-4">Notifications</h3>
          <div className="text-center py-8 bg-surface-elevated rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm">Notification preferences coming in Phase 3.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
