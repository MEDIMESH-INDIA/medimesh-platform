import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';

export default function DoctorSettings() {
  const { user, signOut } = useAuth();

  return (
    <AppPageContainer className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground">Manage your account and security.</p>
      </div>

      <FrostedPanel className="p-6 sm:p-8 rounded-[20px] space-y-6">
        <h2 className="font-semibold text-foreground border-b border-border/60 pb-3">Account</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email Address</label>
            <p className="text-foreground font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60">
          <Button variant="outline" onClick={signOut} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </FrostedPanel>
    </AppPageContainer>
  );
}
