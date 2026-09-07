import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  ExternalLink,
  ListChecks,
  ShieldCheck,
  Stethoscope,
  Users,
  Wrench,
} from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import { HospitalPortalGate, PortalStatusBadge } from '../../components/hospital/portal/HospitalPortalState';
import { useHospitalPortal } from '../../hooks/useHospitalPortal';
import { getHospitalCompleteness } from '../../lib/data/hospitalPortalRepository';

const quickActions = [
  { to: '/hospital/profile', label: 'Complete hospital profile', detail: 'Contact, location, capacity, and service facts', icon: Building2 },
  { to: '/hospital/specialties', label: 'Review specialties', detail: 'Use the normalized MEDIMESH taxonomy', icon: Stethoscope },
  { to: '/hospital/facilities', label: 'Manage facilities', detail: 'Maintain durable facility attributes', icon: Wrench },
  { to: '/hospital/services', label: 'Manage services', detail: 'Choose from the canonical services catalog', icon: ListChecks },
  { to: '/hospital/doctors', label: 'Review doctor affiliations', detail: 'See directory and provider-submitted records', icon: Users },
  { to: '/hospital/verification', label: 'Verification and evidence', detail: 'Review sources or request an independent check', icon: ShieldCheck },
];

function displayBoolean(value) {
  if (value == null) return 'Not provided';
  return value ? 'Available' : 'Not available';
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <FrostedPanel variant="elevated" className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/10 bg-primary/5 text-primary"><Icon className="h-5 w-5" /></span>
      </div>
    </FrostedPanel>
  );
}

function DashboardContent({ workspace }) {
  const hospital = workspace.hospital;
  const completeness = getHospitalCompleteness(workspace);
  const doctorCount = workspace.directoryDoctors.length + workspace.providerDoctors.length;
  const isPublished = hospital.publication_status === 'published';
  const isVerified = hospital.data_status === 'verified' || workspace.evidence.some(item => item.review_status === 'manually_reviewed');
  const profileFacts = [
    ...(hospital.total_beds != null ? [['Total bed capacity', hospital.total_beds]] : []),
    ...(hospital.icu_beds != null ? [['ICU bed capacity', hospital.icu_beds]] : []),
    ['Emergency department', displayBoolean(hospital.emergency_department)],
    ['Ambulance service', displayBoolean(hospital.ambulance_available)],
  ];

  return (
    <AppPageContainer>
      <PageHeader
        eyebrow="Hospital workspace"
        title={hospital.name}
        description="Maintain factual public profile details and follow MEDIMESH’s independent review status."
        actions={isPublished ? (
          <Button as={Link} to={`/hospitals/${hospital.slug}`} variant="outline" className="gap-2">
            View public profile <ExternalLink className="h-4 w-4" />
          </Button>
        ) : null}
      />

      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <FrostedPanel variant="elevated" className="overflow-hidden p-6 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Profile completeness</p>
                <p className="mt-2 text-5xl font-bold tracking-[-0.055em] text-foreground">{completeness.percentage}%</p>
                <p className="mt-2 text-sm text-muted-foreground">{completeness.completed} of {completeness.total} profile areas complete</p>
              </div>
              <Button as={Link} to="/hospital/profile" variant="secondary" className="gap-2">Edit profile <ArrowRight className="h-4 w-4" /></Button>
            </div>
            <div className="mt-6 h-2.5 overflow-hidden rounded-full border border-border/60 bg-surface" role="progressbar" aria-label="Hospital profile completeness" aria-valuenow={completeness.percentage} aria-valuemin="0" aria-valuemax="100">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${completeness.percentage}%` }} />
            </div>
          </FrostedPanel>

          <FrostedPanel className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Registry state</p>
                <h2 className="mt-2 font-serif text-xl font-semibold">Trust and publication</h2>
              </div>
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <PortalStatusBadge tone={isVerified ? 'success' : 'warning'}>{hospital.data_status || 'unreviewed'}</PortalStatusBadge>
              <PortalStatusBadge tone={isPublished ? 'success' : 'neutral'}>{hospital.publication_status}</PortalStatusBadge>
              <PortalStatusBadge tone="primary">{workspace.membership.membership_role}</PortalStatusBadge>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Verification and publication are controlled by MEDIMESH review. Hospital members cannot self-verify.</p>
          </FrostedPanel>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard label="Specialties" value={workspace.specialties.length} detail="Clinical specialties listed" icon={Stethoscope} />
          <StatCard label="Facilities" value={workspace.facilities.length} detail="Facility attributes listed" icon={Wrench} />
          <StatCard label="Services" value={workspace.services.length} detail="Services in the catalog" icon={ListChecks} />
          <StatCard label="Doctors" value={doctorCount} detail="Affiliation records" icon={Users} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <FrostedPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3 border-b border-border/70 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/5 text-primary"><BedDouble className="h-5 w-5" /></span>
              <div>
                <h2 className="font-serif text-xl font-semibold">Hospital facts</h2>
                <p className="text-xs text-muted-foreground">Static profile information, not live availability.</p>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {profileFacts.map(([term, value]) => (
                <div key={term} className="rounded-xl border border-border/60 bg-white/45 p-4">
                  <dt className="text-xs font-medium text-muted-foreground">{term}</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </FrostedPanel>

          <FrostedPanel className="p-5 sm:p-6">
            <div className="border-b border-border/70 pb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Quick actions</p>
              <h2 className="mt-1 font-serif text-xl font-semibold">Keep the profile useful</h2>
            </div>
            <div className="mt-3 space-y-1">
              {quickActions.map(action => (
                <Link key={action.to} to={action.to} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-white/70">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border/70 bg-white/65 text-primary"><action.icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{action.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{action.detail}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </FrostedPanel>
        </div>

        {!isPublished && (
          <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3.5 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>Your changes update the canonical record. A public link becomes available only after MEDIMESH publishes the profile.</p>
          </div>
        )}
      </div>
    </AppPageContainer>
  );
}

export default function HospitalDashboard() {
  const portal = useHospitalPortal();
  return <HospitalPortalGate portal={portal}>{workspace => <DashboardContent workspace={workspace} />}</HospitalPortalGate>;
}
