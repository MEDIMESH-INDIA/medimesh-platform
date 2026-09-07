import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BedDouble,
  Building2,
  Check,
  CircleAlert,
  GitCompare,
  Heart,
  Mail,
  MapPin,
  Phone,
  PlusSquare,
  ShieldCheck,
} from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import FrostedPanel from '../../components/common/FrostedPanel';
import SignInPromptDialog from '../../components/common/SignInPromptDialog';
import Toast from '../../components/common/Toast';
import TrustMetadata from '../../components/hospital/TrustMetadata';
import HospitalLocationPanel from '../../components/hospital/HospitalLocationPanel';
import { useCompare } from '../../hooks/useCompare';
import { useHospitalDetail } from '../../hooks/useHospitalDetail';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { formatHospitalType } from '../../lib/utils/formatters';

const availability = value => value === true ? 'Available' : value === false ? 'No' : 'Not provided';
const valueOrFallback = value => value === null || value === undefined || value === '' ? 'Not provided' : value;
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
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSave = async () => {
    const result = await toggleSave(slug);
    if (result?.requiresAuth) setSignInPromptOpen(true);
    else if (result?.error) setToast({ message: 'We couldn’t update your saved hospitals. Please try again.', tone: 'error' });
    else if (typeof result?.saved === 'boolean') setToast({ message: result.saved ? `${hospital.name} saved.` : `${hospital.name} removed from saved hospitals.`, tone: 'success' });
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

  if (loading) return <HospitalDetailSkeleton />;

  if (error) {
    return (
      <AppPageContainer>
        <EmptyState icon={CircleAlert} title="We couldn’t load this hospital." description="The catalog could not be reached. Please try again in a moment." action={<Button type="button" onClick={() => window.location.reload()}>Try again</Button>} />
      </AppPageContainer>
    );
  }

  if (notFound) {
    return (
      <AppPageContainer>
        <EmptyState icon={Building2} title="Hospital not found" description="This hospital is not available in the published MEDIMESH catalog." action={<Button as={Link} to={`${basePath}/discover`}><ArrowLeft className="h-4 w-4" /> Back to Discover</Button>} />
      </AppPageContainer>
    );
  }

  const { name, location, type, specialties, facilities, services, metrics, provenance, contact, yearEstablished } = hospital;
  const locality = [location.locality, location.city, location.state].filter(Boolean).join(' · ') || 'Location not provided';
  const fullAddress = [location.addressLine1, location.addressLine2, location.locality, location.city, location.state, location.pinCode].filter(Boolean).join(', ');

  return (
    <AppPageContainer className="">
      <Link to={`${basePath}/discover`} className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
        <ArrowLeft className="h-4 w-4" /> Back to Discover
      </Link>

      <FrostedPanel variant="elevated" className="overflow-hidden rounded-[20px]">
        <header className="border-b border-border/70 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Published hospital profile</p>
              <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">{name}</h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{locality}</span>
                <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" />{formatHospitalType(type)}</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" onClick={() => void handleSave()} className="gap-2">
                <Heart className={`h-4 w-4 ${savedSlugs.has(slug) ? 'fill-current' : ''}`} />{savedSlugs.has(slug) ? 'Saved' : 'Save'}
              </Button>
              <Button type="button" variant={isCompared(slug) ? 'secondary' : 'primary'} onClick={handleCompare} className="gap-2">
                {isCompared(slug) ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}{isCompared(slug) ? 'In comparison' : 'Compare'}
              </Button>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
            <div className="space-y-6">
              <section aria-labelledby="overview-heading">
                <SectionTitle id="overview-heading" icon={ShieldCheck}>Overview</SectionTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">This profile presents the structured information currently available for this hospital in the MEDIMESH catalog. Fields marked “Not provided” have not been supplied by a source.</p>
                {yearEstablished && <p className="mt-3 text-sm text-foreground"><span className="font-semibold">Year established:</span> {yearEstablished}</p>}
              </section>

              <InfoSection title="Specialties" icon={Activity} items={specialties} />
              <InfoSection title="Facilities" icon={PlusSquare} items={facilities} />
              <InfoSection title="Services" icon={Check} items={services} />
            </div>

            <div className="space-y-6">
              <section aria-labelledby="capacity-heading">
                <SectionTitle id="capacity-heading" icon={BedDouble}>Capacity</SectionTitle>
                <DataList rows={[
                  ['Total bed capacity', valueOrFallback(metrics?.totalBeds)],
                  ['ICU bed capacity', valueOrFallback(metrics?.icuBeds)],
                ]} />
              </section>
              <section aria-labelledby="access-heading">
                <SectionTitle id="access-heading" icon={CircleAlert}>Access and emergency</SectionTitle>
                <DataList rows={[
                  ['Emergency department', availability(metrics?.emergency)],
                  ['Ambulance', availability(metrics?.ambulance)],
                ]} />
              </section>
            </div>
          </div>

          <HospitalLocationPanel hospital={hospital} fullAddress={fullAddress} />

          {(contact?.phone || contact?.email || contact?.website) && (
            <section aria-labelledby="contact-heading">
              <SectionTitle id="contact-heading" icon={Phone}>Public contact</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                {contact?.phone && <ContactItem icon={Phone} label="Public phone" value={contact.phone} href={`tel:${contact.phone}`} />}
                {contact?.email && <ContactItem icon={Mail} label="Public email" value={contact.email} href={`mailto:${contact.email}`} />}
                {contact?.website && <ContactItem icon={Building2} label="Website" value={contact.website} href={safeWebsiteUrl(contact.website)} external />}
              </div>
            </section>
          )}

          <section aria-labelledby="provenance-heading">
            <SectionTitle id="provenance-heading" icon={ShieldCheck}>Source transparency</SectionTitle>
            <TrustMetadata provenance={provenance} />
          </section>
        </div>
      </FrostedPanel>

      <SignInPromptDialog open={signInPromptOpen} onClose={() => setSignInPromptOpen(false)} returnTo={route.pathname} />
      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </AppPageContainer>
  );
}

function HospitalDetailSkeleton() {
  return (
    <AppPageContainer className="" >
      <div className="animate-pulse space-y-6" role="status" aria-label="Loading hospital profile">
        <div className="h-5 w-36 rounded bg-muted/50" />
        <FrostedPanel className="overflow-hidden rounded-[20px]">
          <div className="space-y-4 border-b border-border p-8"><div className="h-4 w-32 rounded bg-muted/50" /><div className="h-10 max-w-xl rounded bg-muted/60" /><div className="h-5 w-80 max-w-full rounded bg-muted/40" /></div>
          <div className="grid gap-8 p-8 md:grid-cols-2"><div className="h-56 rounded-2xl bg-muted/35" /><div className="h-56 rounded-2xl bg-muted/35" /></div>
        </FrostedPanel>
      </div>
    </AppPageContainer>
  );
}

function SectionTitle({ id, icon: Icon, children }) {
  return <h2 id={id} className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-foreground"><Icon className="h-5 w-5 text-primary" />{children}</h2>;
}

function InfoSection({ title, icon, items }) {
  return (
    <section aria-label={title}>
      <SectionTitle icon={icon}>{title}</SectionTitle>
      {items?.length ? <div className="flex flex-wrap gap-2">{items.map(item => <span key={item} className="rounded-xl border border-border bg-surface/55 px-3 py-2 text-sm font-medium text-foreground">{item}</span>)}</div> : <p className="text-sm text-muted-foreground">Not provided</p>}
    </section>
  );
}

function DataList({ rows }) {
  return <dl className="overflow-hidden rounded-2xl border border-border/70 bg-surface/35">{rows.map(([label, value], index) => <div key={label} className={`flex items-center justify-between gap-4 px-4 py-3 ${index ? 'border-t border-border/60' : ''}`}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-right text-sm font-semibold text-foreground">{value}</dd></div>)}</dl>;
}

function ContactItem({ icon: Icon, label, value, href, external }) {
  const content = <><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span><span className="mt-1 block text-sm leading-6 text-foreground">{value}</span></span></>;
  const className = 'flex items-start gap-3 rounded-[16px] border border-border/80 bg-white p-3 hover:shadow-sm transition-all h-full';
  return href ? <a href={href} className={`${className} transition-colors hover:border-primary/30 hover:bg-primary/[0.03]`} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{content}</a> : <div className={className}>{content}</div>;
}
