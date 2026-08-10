import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function HospitalDashboard() {
  const { profile } = useAuth();
  
  const isVerified = profile?.verification_status === 'verified';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Verification Pending</h3>
            <p className="text-sm text-amber-700 mt-1">
              Your organizational credentials are currently under review. Your facility will not be listed publicly until verification is complete.
            </p>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-4 items-start">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Verified Organization</h3>
            <p className="text-sm text-green-700 mt-1">
              Your hospital is verified and visible to patients on the MEDIMESH platform.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Hospital Portal</h1>
        <p className="text-muted-foreground mb-6">Welcome, {profile?.display_name}. Manage your institutional presence.</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface-elevated rounded-xl border border-border">
            <h3 className="font-bold mb-2">Departments</h3>
            <p className="text-3xl font-light text-primary">0</p>
            <p className="text-xs text-muted-foreground mt-2">Update your active departments</p>
          </div>
          
          <div className="p-6 bg-surface-elevated rounded-xl border border-border">
            <h3 className="font-bold mb-2">Registered Doctors</h3>
            <p className="text-3xl font-light text-secondary-accent">0</p>
            <p className="text-xs text-muted-foreground mt-2">Doctors affiliated with this branch</p>
          </div>

          <div className="p-6 bg-surface-elevated rounded-xl border border-border">
            <h3 className="font-bold mb-2">Profile Completion</h3>
            <div className="w-full bg-border rounded-full h-2 mb-2 mt-4">
              <div className="bg-primary h-2 rounded-full w-[20%]"></div>
            </div>
            <p className="text-xs text-muted-foreground">Add facilities and services</p>
          </div>
        </div>
      </div>
    </div>
  );
}
