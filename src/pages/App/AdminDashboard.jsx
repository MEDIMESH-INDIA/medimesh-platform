import { ShieldCheck } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import EmptyState from '../../components/common/EmptyState';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <AppPageContainer>
      <PageHeader eyebrow="Authorized workspace" title="Platform administration" description="Administrative controls are shown only where real management functionality exists." />
      <FrostedPanel variant="elevated" className="mb-6 flex items-center gap-4 rounded-[24px] p-6">
        <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-foreground text-white"><ShieldCheck className="h-5 w-5" /></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Signed in as admin</p><h2 className="mt-1 font-serif text-xl font-semibold">{profile?.display_name || 'Admin account'}</h2></div>
      </FrostedPanel>
      <EmptyState icon={ShieldCheck} eyebrow="No fabricated analytics" title="Administration tools are not implemented yet" description="Patient counts, verification queues, and platform statistics will appear only after they are backed by authorized, queryable data." />
    </AppPageContainer>
  );
}
