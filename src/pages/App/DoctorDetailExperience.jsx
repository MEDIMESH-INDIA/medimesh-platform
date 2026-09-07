import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Award, MapPin, Building2, ShieldCheck, CheckCircle2, Share2, AlertCircle, Database, Home, CalendarDays, ClipboardList } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import FrostedPanel from '../../components/common/FrostedPanel';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useDoctorDetail } from '../../hooks/useDoctorDetail';

export default function DoctorDetailExperience() {
  const { slug } = useParams();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/app') ? '/app' : '';
  const { doctor, loading, error } = useDoctorDetail(slug);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AppPageContainer className="py-10 space-y-8">
        <div className="h-6 w-32 bg-muted/40 rounded animate-pulse"></div>
        <div className="rounded-[20px] p-8 bg-surface/50 border border-border space-y-4 animate-pulse">
          <div className="h-8 w-1/2 bg-muted/60 rounded"></div>
          <div className="h-4 w-1/3 bg-muted/40 rounded"></div>
        </div>
      </AppPageContainer>
    );
  }

  if (error || !doctor) {
    return (
      <AppPageContainer className="flex items-center justify-center min-h-[320px]">
        <EmptyState
          icon={AlertCircle}
          eyebrow="Practitioner Profile"
          title="Doctor Profile Not Found"
          description={error ? "We encountered an error loading this profile." : "The requested doctor profile does not exist or has not been published yet."}
          action={
            <Button as={Link} to={`${basePath}/doctors`}>
              &larr; Back to Doctor Directory
            </Button>
          }
        />
      </AppPageContainer>
    );
  }

  const {
    name,
    qualifications,
    medicalRegistrationNumber,
    medicalCouncil,
    registrationYear,
    specialization,
    yearsOfExperience,
    location: loc = {},
    affiliations = [],
    languages,
    consultationModes,
    summary,
    source = {},
    homeVisit
  } = doctor;

  const locParts = [loc.locality, loc.city, loc.state].filter(Boolean);
  const locString = locParts.length > 0 ? locParts.join(', ') : 'Location not provided';

  const checkedDate = source.checkedAt
    ? new Date(source.checkedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recently';

  const isHomeVisitScheduled = Boolean(homeVisit?.days?.length && homeVisit?.startTime && homeVisit?.endTime);
  const isBookable = homeVisit?.enabled && isHomeVisitScheduled;
  const bookingPath = basePath
    ? `/app/doctors/${doctor.slug}/book-home-visit`
    : `/login?redirect=${encodeURIComponent(`/app/doctors/${doctor.slug}/book-home-visit`)}`;

  const isVerified = source.reviewStatus === 'verified';
  const verificationText = isVerified ? 'Verified Practitioner' : 'Verification pending';

  return (
    <AppPageContainer className="space-y-6 lg:space-y-8 pb-16">
      {/* Back link */}
      <div>
        <Link
          to={`${basePath}/doctors`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to doctors directory</span>
        </Link>
      </div>

      {/* Main Hero Header */}
      <FrostedPanel variant="elevated" className="rounded-[20px] p-6 lg:p-8 border-border/80 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Stethoscope className="w-3.5 h-3.5" />
                {specialization || 'Medical Practitioner'}
              </span>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isVerified ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-surface text-muted-foreground border-border/70'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{verificationText}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
              {name}
            </h1>

            <div className="space-y-2 pt-1">
              {qualifications && (
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary shrink-0" />
                  <span>{qualifications}</span>
                </p>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{locString}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border/70 text-xs font-semibold text-foreground transition-all shadow-sm"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link copied' : 'Share profile'}</span>
            </button>
          </div>
        </div>

        {/* Consultation modes & Languages */}
        {(consultationModes?.length > 0 || languages?.length > 0) && (
          <div className="pt-5 mt-5 border-t border-border/60 flex flex-wrap gap-x-6 gap-y-3">
            {consultationModes?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Consultation Modes:</span>
                <span className="text-sm font-medium text-foreground">{consultationModes.join(', ')}</span>
              </div>
            )}
            {languages?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Languages:</span>
                <span className="text-sm font-medium text-foreground">{languages.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </FrostedPanel>

      <div className={`grid gap-6 lg:gap-8 ${homeVisit?.enabled ? 'lg:grid-cols-[minmax(0,2fr)_360px]' : 'lg:grid-cols-1'}`}>
        {/* Left Column: Details & Affiliations */}
        <div className="min-w-0 space-y-6 lg:space-y-8">

          {/* Professional Overview */}
          {summary && (
            <section aria-labelledby="overview-heading" className="space-y-4">
              <h2 id="overview-heading" className="text-xl font-serif font-semibold text-foreground">Professional Overview</h2>
              <div className="p-6 rounded-[20px] bg-white border border-border/60 shadow-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {summary}
                </p>
              </div>
            </section>
          )}

          {/* Medical Registration & Credentials */}
          <section aria-labelledby="credentials-heading" className="space-y-4">
            <h2 id="credentials-heading" className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <span>Medical Credentials</span>
            </h2>
            <div className="p-6 rounded-[20px] bg-white border border-border/60 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Primary Specialization</span>
                  <p className="font-medium text-foreground text-sm">{specialization || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Experience</span>
                  <p className="font-medium text-foreground text-sm">{yearsOfExperience ? `${yearsOfExperience} years` : 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Registration Number</span>
                  <p className="font-medium text-foreground text-sm">{medicalRegistrationNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Medical Council</span>
                  <p className="font-medium text-foreground text-sm">{medicalCouncil || 'Not provided'}</p>
                </div>
                {registrationYear && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Registration Year</span>
                    <p className="font-medium text-foreground text-sm">{registrationYear}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Hospital Affiliations */}
          <section aria-labelledby="affiliations-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="affiliations-heading" className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>Hospital Affiliations</span>
              </h2>
            </div>

            <div className="p-6 rounded-[20px] bg-white border border-border/60 shadow-sm">
              {affiliations.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {affiliations.map((affil, idx) => (
                    <div key={affil.id || idx} className="p-4 rounded-xl bg-surface/50 border border-border/40">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {affil.hospitalSlug ? (
                          <Link to={`${basePath}/hospitals/${affil.hospitalSlug}`} className="hover:text-primary transition-colors">
                            {affil.hospitalName}
                          </Link>
                        ) : (
                          affil.hospitalName
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {affil.position} • {affil.department}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hospital affiliations currently listed.</p>
              )}
            </div>
          </section>

          {/* Provenance */}
          <section aria-labelledby="provenance-heading" className="space-y-4">
            <h2 id="provenance-heading" className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <span>Data Provenance</span>
            </h2>
            <div className="p-6 rounded-[20px] bg-white border border-border/60 shadow-sm">
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Source Dataset</span>
                  <p className="font-medium text-foreground text-sm">{source.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Verification</span>
                  <p className={`font-medium text-sm ${isVerified ? 'text-emerald-700' : 'text-foreground'}`}>{verificationText}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Last Verified</span>
                  <p className="font-medium text-foreground text-sm">{checkedDate}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Home Consultation */}
        {homeVisit?.enabled && (
          <div className="space-y-6">
            <FrostedPanel variant="elevated" className="rounded-[20px] border-border/80 p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary shrink-0"><Home className="h-5 w-5" /></span>
                <h2 className="font-serif text-xl font-semibold text-foreground">Home Consultation</h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Status</span>
                  <span className="font-semibold text-foreground">Available</span>
                </div>

                <div className="flex flex-col gap-1 pb-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Service Areas</span>
                  <span className="font-semibold text-foreground text-right">{homeVisit.serviceAreas?.join(', ') || 'Not provided'}</span>
                </div>

                <div className="flex flex-col gap-1 pb-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Schedule</span>
                  <span className="font-semibold text-foreground text-right">
                    {isHomeVisitScheduled
                      ? `${homeVisit.days.join(', ')} · ${homeVisit.startTime.slice(0, 5)}–${homeVisit.endTime.slice(0, 5)}`
                      : 'Not published'}
                  </span>
                </div>

                {homeVisit.fee && (
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Visit Fee</span>
                    <span className="font-semibold text-foreground">₹{Number(homeVisit.fee).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {homeVisit.contactPublic && homeVisit.professionalPhone && (
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Contact</span>
                    <span className="font-semibold text-foreground">{homeVisit.professionalPhone}</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {isBookable ? (
                  <Button as={Link} to={bookingPath} className="w-full gap-2 justify-center"><CalendarDays className="h-4 w-4" />Book Home Visit</Button>
                ) : (
                  <div className="rounded-xl bg-surface border border-border/70 p-3 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Booking schedule not published yet.</p>
                  </div>
                )}
              </div>
            </FrostedPanel>
          </div>
        )}
      </div>
    </AppPageContainer>
  );
}
