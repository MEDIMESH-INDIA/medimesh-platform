import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock,
  ExternalLink,
  GitCompare,
  Heart,
  Mail,
  MapPin,
  Phone,
  PlusSquare,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import FrostedPanel from '../../components/common/FrostedPanel';
import Toast from '../../components/common/Toast';
import TrustMetadata from '../../components/hospital/TrustMetadata';
import HospitalLocationPanel from '../../components/hospital/HospitalLocationPanel';
import HospitalHeroImage from '../../components/hospital/HospitalHeroImage';
import { useCompare } from '../../hooks/useCompare';
import { useHospitalDetail } from '../../hooks/useHospitalDetail';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { useAuthGate } from '../../hooks/useAuthGate';
import { formatHospitalType } from '../../lib/utils/formatters';

const availability = value => (value === true ? 'Available' : value === false ? 'Unavailable' : 'Not provided');
const safeWebsiteUrl = value => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

export default function HospitalDetailExperience({ mode = 'canonical' }) {
  const { slug } = useParams();
  const route = useLocation();
  const basePath = route.pathname.startsWith('/app') ? '/app' : '';
  const { hospital, loading, error, notFound } = useHospitalDetail(slug, { mode });
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();
  const { savedSlugs, toggleSave } = useSavedHospitals();
  const { requireAuth } = useAuthGate();
  const [toast, setToast] = useState(null);

  const handleSave = () => {
    requireAuth({
      action: async () => {
        const result = await toggleSave(slug);
        if (result?.error) {
          setToast({ message: 'We couldn’t update your saved hospitals. Please try again.', tone: 'error' });
        } else if (typeof result?.saved === 'boolean') {
          setToast({
            message: result.saved ? `${hospital.name} saved.` : `${hospital.name} removed from saved hospitals.`,
            tone: 'success',
          });
        }
      },
      message: 'Sign in to save hospitals to your personal shortlist.',
      returnTo: `${route.pathname}${route.search}`,
      resumeAction: async () => {
        const result = await toggleSave(slug);
        if (typeof result?.saved === 'boolean') {
          setToast({
            message: result.saved ? `${hospital.name} saved.` : `${hospital.name} removed from saved hospitals.`,
            tone: 'success',
          });
        }
      },
    });
  };

  const handleCompare = () => {
    if (isCompared(slug)) {
      removeHospital(slug);
      setToast({ message: `${hospital.name} removed from comparison.`, tone: 'success' });
    } else if (canAdd) {
      addHospital(hospital);
      setToast({ message: `${hospital.name} added to comparison.`, tone: 'success' });
    } else {
      setToast({ message: 'You can compare up to three hospitals.', tone: 'error' });
    }
  };

  if (loading) return <HospitalDetailSkeleton basePath={basePath} />;

  if (error) {
    return (
      <AppPageContainer className="py-12 max-w-[1360px]">
        <EmptyState
          icon={CircleAlert}
          title="We couldn’t load this hospital."
          description="The healthcare catalog could not be reached. Please try again in a moment."
          action={<Button type="button" onClick={() => window.location.reload()}>Try again</Button>}
        />
      </AppPageContainer>
    );
  }

  if (notFound) {
    return (
      <AppPageContainer className="py-12 max-w-[1360px]">
        <EmptyState
          icon={Building2}
          title="Hospital not found"
          description="This hospital profile is not available in the published MEDIMESH catalog."
          action={<Button as={Link} to={`${basePath}/discover`}><ArrowLeft className="h-4 w-4" /> Back to Discover</Button>}
        />
      </AppPageContainer>
    );
  }

  const { name, location, type, specialties, facilities, services, metrics, provenance, contact, yearEstablished } = hospital;
  const locality = [location.locality, location.city, location.district, location.state].filter(Boolean).join(', ') || 'Location not provided';
  const fullAddress = [location.addressLine1, location.addressLine2, location.locality, location.city, location.district, location.state, location.pinCode].filter(Boolean).join(', ');

  const reviewBadgeText = provenance?.reviewStatus === 'manually_reviewed'
    ? 'Manually Reviewed'
    : provenance?.reviewStatus === 'source_matched'
    ? 'Source Matched'
    : provenance?.reviewStatus === 'demonstration'
    ? 'Demonstration Record'
    : 'Catalog Record';

  return (
    <AppPageContainer className="space-y-8 sm:space-y-10 pb-16 max-w-[1360px]">
      {/* Back navigation */}
      <div>
        <Link
          to={`${basePath}/discover`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </Link>
      </div>

      {/* Editorial Hospital Hero Header */}
      <FrostedPanel variant="elevated" className="overflow-hidden rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Hero Left Identity Area */}
          <div className="flex flex-col justify-between lg:col-span-7 xl:col-span-8">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Building2 className="h-3.5 w-3.5" />
                  {formatHospitalType(type) || 'Healthcare Facility'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-[#fdfbf7] px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  {reviewBadgeText}
                </span>
              </div>

              <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                {name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:text-base text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {locality}
                </span>
                {yearEstablished && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground/80">
                    <Clock className="h-4 w-4 text-primary/70 shrink-0" />
                    Est. {yearEstablished}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button
                type="button"
                variant={isCompared(slug) ? 'secondary' : 'primary'}
                size="md"
                onClick={handleCompare}
                className="min-h-11 px-6 text-sm font-semibold gap-2 shadow-sm"
              >
                {isCompared(slug) ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
                {isCompared(slug) ? 'In comparison' : 'Compare Hospital'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => void handleSave()}
                className="min-h-11 px-5 text-sm font-semibold gap-2 border-border/80 bg-white hover:bg-surface"
              >
                <Heart className={`h-4 w-4 ${savedSlugs.has(slug) ? 'fill-current text-rose-500' : 'text-muted-foreground'}`} />
                {savedSlugs.has(slug) ? 'Saved' : 'Save Hospital'}
              </Button>
            </div>
          </div>

          {/* Hero Right Visual Area (35-45% width, generous landscape) */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-end items-center">
            <HospitalHeroImage hospital={hospital} className="h-[220px] sm:h-[260px] lg:h-[260px] w-full" />
          </div>
        </div>
      </FrostedPanel>

      {/* Two-Column Clinical & Capacity Information Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Column: Overview, Specialties, Facilities & Services */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Catalog Overview */}
          <section aria-labelledby="overview-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-sm space-y-3">
            <h2 id="overview-heading" className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Directory Overview
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Structured institutional facts published from official public health registers and municipal authorities. Capacity and clinical information represent reported directory data; unlisted fields have not been supplied in published registries.
            </p>
          </section>

          {/* Specialties Card */}
          <section aria-labelledby="specialties-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 id="specialties-heading" className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-primary" />
                Specialties & Clinical Departments
              </h2>
              {specialties?.length > 0 && (
                <span className="text-xs font-semibold text-muted-foreground bg-[#fdfbf7] border border-border/70 px-2.5 py-1 rounded-full">
                  {specialties.length} listed
                </span>
              )}
            </div>

            <div>
              {specialties?.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {specialties.map(item => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-xl border border-border/80 bg-[#fdfbf7] px-3.5 py-2 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Specialties not provided in the published directory record.
                </p>
              )}
            </div>
          </section>

          {/* Facilities and Services Card */}
          <section aria-labelledby="facilities-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-sm space-y-8">
            {/* Facilities subsection */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <h2 id="facilities-heading" className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5">
                  <PlusSquare className="h-5 w-5 text-primary" />
                  Hospital Facilities
                </h2>
                {facilities?.length > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground bg-[#fdfbf7] border border-border/70 px-2.5 py-1 rounded-full">
                    {facilities.length} available
                  </span>
                )}
              </div>
              <div className="pt-5">
                {facilities?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {facilities.map(item => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-[#fdfbf7] px-4 py-3 text-xs sm:text-sm font-medium text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Hospital facilities data not provided in published registry.
                  </p>
                )}
              </div>
            </div>

            {/* Services subsection */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Clinical & Patient Services
                </h3>
                {services?.length > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground bg-[#fdfbf7] border border-border/70 px-2.5 py-1 rounded-full">
                    {services.length} services
                  </span>
                )}
              </div>
              <div className="pt-5">
                {services?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.map(item => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-[#fdfbf7] px-4 py-3 text-xs sm:text-sm font-medium text-foreground"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Clinical services data not provided in published registry.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Supporting Column: Capacity, Access & Emergency, Direct Contact */}
        <div className="min-w-0 lg:col-span-5 xl:col-span-4 space-y-8">
          {/* Capacity Section */}
          <section aria-labelledby="capacity-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <h2 id="capacity-heading" className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5 pb-4 border-b border-border/60">
              <BedDouble className="h-5 w-5 text-primary" />
              Bed Capacity
            </h2>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-border/70 bg-[#fdfbf7] p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Total Beds
                </span>
                <p className="mt-1.5 font-serif text-3xl font-bold text-foreground">
                  {metrics?.totalBeds ?? '—'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Sanctioned capacity</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-[#fdfbf7] p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  ICU Beds
                </span>
                <p className="mt-1.5 font-serif text-3xl font-bold text-foreground">
                  {metrics?.icuBeds ?? '—'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Critical care</p>
              </div>
            </div>
          </section>

          {/* Access and Emergency Section */}
          <section aria-labelledby="access-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <h2 id="access-heading" className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5 pb-4 border-b border-border/60">
              <AlertCircle className="h-5 w-5 text-primary" />
              Access & Emergency
            </h2>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-[#fdfbf7] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground block">
                      Emergency Department
                    </span>
                    <span className="text-xs text-muted-foreground">24-hour urgent intake</span>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  metrics?.emergency === true
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : metrics?.emergency === false
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-surface text-muted-foreground border border-border'
                }`}>
                  {availability(metrics?.emergency)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-[#fdfbf7] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground block">
                      Ambulance Fleet
                    </span>
                    <span className="text-xs text-muted-foreground">Emergency transport</span>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  metrics?.ambulance === true
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : metrics?.ambulance === false
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-surface text-muted-foreground border border-border'
                }`}>
                  {availability(metrics?.ambulance)}
                </span>
              </div>
            </div>
          </section>

          {/* Public Contact Section */}
          <section aria-labelledby="contact-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <h2 id="contact-heading" className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5 pb-4 border-b border-border/60">
              <Phone className="h-5 w-5 text-primary" />
              Public Contact
            </h2>
            <div className="space-y-3">
              {contact?.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-[#fdfbf7] p-3.5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 group"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{contact.phone}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-[#fdfbf7] p-3.5 text-xs sm:text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground/50" />
                  <span>Telephone not published</span>
                </div>
              )}

              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-[#fdfbf7] p-3.5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
                </a>
              )}

              {contact?.website && safeWebsiteUrl(contact.website) && (
                <a
                  href={safeWebsiteUrl(contact.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-[#fdfbf7] p-3.5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{contact.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
                </a>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Location and Directions Section with 440px Map */}
      <HospitalLocationPanel hospital={hospital} fullAddress={fullAddress} />

      {/* Refined Source Transparency Card */}
      <TrustMetadata provenance={provenance} compact={false} />

      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </AppPageContainer>
  );
}

function HospitalDetailSkeleton({ basePath }) {
  return (
    <AppPageContainer className="space-y-8 sm:space-y-10 pb-16 max-w-[1360px]">
      <div>
        <Link
          to={`${basePath}/discover`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </Link>
      </div>

      <div className="animate-pulse space-y-8" role="status" aria-label="Loading hospital profile">
        <FrostedPanel className="overflow-hidden rounded-[24px] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-8">
              <div className="h-6 w-36 rounded-full bg-muted/50" />
              <div className="h-12 max-w-lg rounded-xl bg-muted/60" />
              <div className="h-5 w-72 max-w-full rounded bg-muted/40" />
              <div className="flex gap-3 pt-3">
                <div className="h-11 w-36 rounded-xl bg-muted/50" />
                <div className="h-11 w-32 rounded-xl bg-muted/50" />
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <div className="h-[220px] sm:h-[260px] w-full rounded-2xl bg-muted/40" />
            </div>
          </div>
        </FrostedPanel>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="h-48 rounded-[24px] bg-muted/30" />
            <div className="h-64 rounded-[24px] bg-muted/30" />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <div className="h-56 rounded-[24px] bg-muted/30" />
            <div className="h-56 rounded-[24px] bg-muted/30" />
          </div>
        </div>

        <div className="h-96 rounded-[24px] bg-muted/30" />
      </div>
    </AppPageContainer>
  );
}
