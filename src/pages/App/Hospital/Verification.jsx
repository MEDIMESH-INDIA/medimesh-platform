import { useState } from 'react';
import { CalendarClock, CheckCircle2, FileCheck2, Send, ShieldCheck } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import FrostedPanel from '../../../components/common/FrostedPanel';
import PageHeader from '../../../components/common/PageHeader';
import Toast from '../../../components/common/Toast';
import { HospitalPortalGate, PortalStatusBadge } from '../../../components/hospital/portal/HospitalPortalState';
import { useHospitalPortal } from '../../../hooks/useHospitalPortal';
import { canManageHospital, submitHospitalVerificationRequest } from '../../../lib/data/hospitalPortalRepository';

function related(value) {
  return Array.isArray(value) ? value[0] : value;
}

function displayDate(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EvidenceCard({ evidence }) {
  const source = related(evidence.data_sources);
  return (
    <li className="rounded-2xl border border-border/65 bg-white/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{source?.name || 'Evidence source'}</p>
          <p className="mt-1 text-xs capitalize text-muted-foreground">{source?.source_type?.replaceAll('_', ' ') || 'Source type not provided'}</p>
        </div>
        <PortalStatusBadge tone={['source_matched', 'manually_reviewed'].includes(evidence.review_status) ? 'success' : 'neutral'}>{evidence.review_status.replaceAll('_', ' ')}</PortalStatusBadge>
      </div>
      {evidence.public_notes && <p className="mt-3 text-sm leading-6 text-muted-foreground">{evidence.public_notes}</p>}
      <p className="mt-3 text-xs text-muted-foreground">Last checked: {displayDate(evidence.checked_at)}</p>
    </li>
  );
}

function VerificationContent({ workspace, user, refresh }) {
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const request = workspace.verificationRequest;
  const requestOpen = ['pending', 'under_review'].includes(request?.status);
  const canSubmit = canManageHospital(workspace) && !requestOpen;

  const submit = async () => {
    if (!canSubmit || !user?.id) return;
    setSubmitting(true);
    try {
      await submitHospitalVerificationRequest(workspace.hospital.id, user.id);
      await refresh();
      setToast({ tone: 'success', message: 'Verification request submitted for independent review.' });
    } catch (error) {
      console.error('Could not submit hospital verification request:', error);
      setToast({ tone: 'error', message: 'Could not submit the request. No verification state was changed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageContainer>
      <PageHeader eyebrow="Trust and provenance" title="Verification" description="Review evidence connected to this hospital and request an independent MEDIMESH assessment." />
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <FrostedPanel variant="elevated" className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Canonical record</p>
                <h2 className="mt-2 font-serif text-xl font-semibold">Current data status</h2>
              </div>
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-5"><PortalStatusBadge tone={workspace.hospital.data_status === 'verified' ? 'success' : 'warning'}>{(workspace.hospital.data_status || 'unreviewed').replaceAll('_', ' ')}</PortalStatusBadge></div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">This status is read-only for hospital members. It changes only through MEDIMESH review and source validation.</p>
          </FrostedPanel>

          <FrostedPanel className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Latest request</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold">Independent review</h2>
                  {request && <PortalStatusBadge tone={request.status === 'approved' ? 'success' : 'warning'}>{request.status.replaceAll('_', ' ')}</PortalStatusBadge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{request ? `Submitted ${displayDate(request.submitted_at)}` : 'No verification request has been submitted.'}</p>
              </div>
              <Button type="button" onClick={() => void submit()} disabled={!canSubmit || submitting} className="gap-2">
                <Send className="h-4 w-4" /> {submitting ? 'Submitting…' : requestOpen ? 'Review in progress' : 'Request review'}
              </Button>
            </div>
            {!canManageHospital(workspace) && <p className="mt-4 text-xs text-muted-foreground">A viewer membership cannot submit verification requests.</p>}
          </FrostedPanel>
        </div>

        <FrostedPanel className="p-5 sm:p-6">
          <div className="flex items-start gap-3 border-b border-border/70 pb-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/5 text-primary"><FileCheck2 className="h-5 w-5" /></span>
            <div>
              <h2 className="font-serif text-xl font-semibold">Evidence trail</h2>
              <p className="mt-1 text-sm text-muted-foreground">Reviewed and member-visible sources associated with this canonical hospital.</p>
            </div>
          </div>
          {workspace.evidence.length ? <ul className="mt-4 grid gap-3 md:grid-cols-2">{workspace.evidence.map(item => <EvidenceCard key={item.id} evidence={item} />)}</ul> : <EmptyState icon={CalendarClock} title="No evidence is visible yet" description="Evidence will appear after a source record is associated with this hospital and made visible under MEDIMESH review policy." />}
        </FrostedPanel>

        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Submitting a request does not grant a verified badge or publish the profile. Those remain reviewer-controlled decisions.</p>
        </div>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </AppPageContainer>
  );
}

export default function HospitalVerification() {
  const portal = useHospitalPortal();
  return <HospitalPortalGate portal={portal}>{workspace => <VerificationContent workspace={workspace} user={portal.user} refresh={portal.refresh} />}</HospitalPortalGate>;
}
