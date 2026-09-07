import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck, Stethoscope, UserRound, Users } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import EmptyState from '../../../components/common/EmptyState';
import FrostedPanel from '../../../components/common/FrostedPanel';
import PageHeader from '../../../components/common/PageHeader';
import { HospitalPortalGate, PortalStatusBadge } from '../../../components/hospital/portal/HospitalPortalState';
import { useHospitalPortal } from '../../../hooks/useHospitalPortal';

function related(value) {
  return Array.isArray(value) ? value[0] : value;
}

function DoctorRow({ name, specialty, department, position, current, verification, slug, sourceLabel }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border/65 bg-white/50 p-4 sm:flex-row sm:items-center">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/10 bg-primary/5 text-primary"><UserRound className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{name || 'Doctor name not provided'}</p>
          <PortalStatusBadge tone={current ? 'success' : 'neutral'}>{current ? 'current' : 'past'}</PortalStatusBadge>
          {verification && <PortalStatusBadge tone={verification === 'verified' ? 'success' : 'warning'}>{verification}</PortalStatusBadge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{[specialty, position, department].filter(Boolean).join(' · ') || 'Role details not provided'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sourceLabel}</p>
      </div>
      {slug && (
        <Link to={`/doctors/${slug}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white/70 px-3 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:text-primary">
          Public profile <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </li>
  );
}

function DoctorSection({ title, description, children, empty }) {
  return (
    <FrostedPanel className="p-5 sm:p-6">
      <div className="flex items-start gap-3 border-b border-border/70 pb-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/5 text-primary"><Stethoscope className="h-5 w-5" /></span>
        <div>
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {empty ? <EmptyState icon={Users} title="No affiliations found" description="No doctor affiliation records are currently connected to this hospital." /> : <ul className="mt-4 space-y-3">{children}</ul>}
    </FrostedPanel>
  );
}

function DoctorsContent({ workspace }) {
  return (
    <AppPageContainer>
      <PageHeader eyebrow="Hospital directory" title="Affiliated doctors" description="Review doctor relationships already connected to the canonical hospital record. Hospitals cannot verify doctors from this workspace." />
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3.5 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>Directory records and provider-submitted records remain separate so their provenance is clear. Verification is handled independently by MEDIMESH.</p>
        </div>

        <DoctorSection title="Source-backed directory" description="Affiliations imported from traceable directory datasets." empty={!workspace.directoryDoctors.length}>
          {workspace.directoryDoctors.map(row => {
            const doctor = related(row.doctors) || {};
            return <DoctorRow key={row.id} name={doctor.full_name} specialty={doctor.specialization} department={row.department} position={row.position} current={row.is_current} verification={doctor.verification_status} slug={doctor.publication_status === 'published' ? doctor.slug : null} sourceLabel={row.source_dataset ? `Source: ${row.source_dataset}` : 'Source-backed directory record'} />;
          })}
        </DoctorSection>

        <DoctorSection title="Provider-submitted affiliations" description="Affiliations submitted through doctor provider profiles." empty={!workspace.providerDoctors.length}>
          {workspace.providerDoctors.map(row => {
            const doctor = related(row.doctor_profiles) || {};
            return <DoctorRow key={row.id} name={doctor.public_display_name} department={row.department} position={row.position} current={row.is_current} verification={row.verification_status} sourceLabel="Provider-submitted affiliation" />;
          })}
        </DoctorSection>
      </div>
    </AppPageContainer>
  );
}

export default function HospitalDoctors() {
  const portal = useHospitalPortal();
  return <HospitalPortalGate portal={portal}>{workspace => <DoctorsContent workspace={workspace} />}</HospitalPortalGate>;
}
