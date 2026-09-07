import { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, FileCheck2, Clock } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import LoadingState from '../../../components/common/LoadingState';
import { useAuth } from '../../../hooks/useAuth';

export default function DoctorVerification() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd fetch verification_requests here.
    // For now, we simulate network loading and rely on profile.verification_status
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <AppPageContainer><LoadingState message="Loading verification status..." /></AppPageContainer>;

  const status = profile?.verification_status || 'unreviewed';
  
  const statusConfig = {
    verified: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'Verified Practitioner' },
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'Pending Review' },
    unreviewed: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'Unreviewed' }
  };

  const current = statusConfig[status] || statusConfig.unreviewed;

  return (
    <AppPageContainer className="!max-w-[800px] space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Verification Status
        </h1>
        <p className="text-muted-foreground">Manage your credentials audit and registry cross-checks.</p>
      </div>

      <FrostedPanel className="p-6 sm:p-8 rounded-[24px] space-y-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between pb-6 border-b border-border/60">
          <div className="space-y-1">
            <h2 className="font-semibold text-foreground">Current Status</h2>
            <p className="text-sm text-muted-foreground">This governs your public verified badge.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${current.bg} ${current.border} ${current.color} font-semibold text-sm`}>
            <current.icon className="w-5 h-5" />
            <span>{current.text}</span>
          </div>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-sm">Strict Independent Verification</p>
              <p className="leading-relaxed">
                Under MEDIMESH trust architecture, healthcare providers and doctors cannot self-verify their listings. Verification is granted after council registries (e.g. Maharashtra Medical Council / National Medical Commission) and hospital panel rosters confirm active accreditation.
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-sm">How to accelerate review</p>
              <p className="leading-relaxed">
                Ensure your <a href="/doctor/qualifications" className="text-primary hover:underline font-medium">Qualifications</a> and <a href="/doctor/affiliations" className="text-primary hover:underline font-medium">Hospital Affiliations</a> are completely filled out with accurate registration numbers.
              </p>
            </div>
          </div>
        </div>
      </FrostedPanel>
    </AppPageContainer>
  );
}
