import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Users, Building2, Stethoscope } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-foreground p-8 rounded-[2rem] border border-border shadow-sm text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Platform Administration</h1>
          <p className="text-white/60">Welcome, {profile?.display_name || 'Admin'}. Manage MEDIMESH platform operations.</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-primary-light" />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-xl mb-1">12</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Patients</p>
        </div>
        
        <div className="p-6 bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-secondary-accent/10 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-6 h-6 text-secondary-accent" />
          </div>
          <h3 className="font-bold text-xl mb-1">4</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Doctors</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-sage" />
          </div>
          <h3 className="font-bold text-xl mb-1">2</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Hospitals</p>
        </div>

        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-bold text-xl mb-1 text-amber-800">5</h3>
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Verifications</p>
        </div>
      </div>
      
      <div className="p-8 bg-white rounded-2xl border border-border">
        <h2 className="text-xl font-bold mb-4">Recent Verification Requests</h2>
        <div className="text-center py-12 bg-surface-elevated rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">Verification management panel coming in Phase 3.</p>
        </div>
      </div>
    </div>
  );
}
