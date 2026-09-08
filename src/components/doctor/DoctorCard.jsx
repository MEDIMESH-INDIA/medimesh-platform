import { MapPin, Building2, Stethoscope, ShieldCheck, ArrowRight, Award, Home, CalendarDays } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import FrostedPanel from '../common/FrostedPanel';

export default function DoctorCard({ doctor = {} }) {
  const locationPath = useLocation().pathname;
  const basePath = locationPath.startsWith('/app') ? '/app' : '';

  const {
    slug,
    name = 'Medical Professional',
    qualifications,
    specialization = 'Specialist',
    yearsOfExperience,
    location = {},
    affiliations = [],
    source = {},
    homeVisit = {},
  } = doctor || {};

  const safeLocation = location || {};
  const locString = [safeLocation.locality, safeLocation.city, safeLocation.state].filter(Boolean).join(', ') || 'Location not provided';
  // const _loc = safeLocation.locality



  const primaryAffiliation = affiliations[0];
  const isBookable = Boolean(homeVisit.enabled && homeVisit.days?.length && homeVisit.startTime && homeVisit.endTime);
  const bookingPath = basePath
    ? `/app/doctors/${slug}/book-home-visit`
    : `/login?redirect=${encodeURIComponent(`/app/doctors/${slug}/book-home-visit`)}`;

  return (
    <FrostedPanel
      variant="elevated"
      className="rounded-[20px] p-5 hover:shadow-[0_4px_20px_rgba(18,49,43,0.03)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col h-full min-w-0 border border-border/60 hover:border-border/90 bg-white"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <Link
            to={`${basePath}/doctors/${slug}`}
            className="hover:text-primary transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
          >
            <h3 className="text-[20px] md:text-[22px] font-serif font-bold text-foreground leading-[1.25]">
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
            <span className="break-words">{specialization}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {yearsOfExperience && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
              {yearsOfExperience} yrs exp
            </span>
          )}
          {homeVisit?.enabled && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap flex items-center gap-1">
              <Home className="w-3 h-3" />
              Home Visits
            </span>
          )}
        </div>
      </div>

      {/* Qualifications & Location */}
      <div className="space-y-2 mb-4 text-xs text-muted-foreground">
        {qualifications && (
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
            <span className="break-words font-medium">{qualifications}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
          <span className="break-words">{locString}</span>
        </div>
      </div>

      {homeVisit?.enabled && homeVisit?.serviceAreas?.length > 0 && (
        <p className="mb-3 text-xs leading-5 text-muted-foreground"><span className="font-semibold">Service area:</span> {homeVisit.serviceAreas.join(', ')}</p>
      )}

      {/* Primary Hospital Affiliation */}
      {primaryAffiliation ? (
        <div className="mb-4 p-3 rounded-xl bg-surface/50 border border-border/50 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="break-words">{primaryAffiliation.hospitalName}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground break-words pl-5">
            {primaryAffiliation.position || primaryAffiliation.department}
          </p>
        </div>
      ) : (
        <div className="mb-4 text-xs text-muted-foreground">
          Hospital affiliation details not provided
        </div>
      )}

      {/* Footer / Provenance & Action */}
      <div className="pt-3 border-t border-border/60 flex flex-col items-start gap-3 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground break-words">
          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${source?.reviewStatus === 'verified' ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="break-words">
            {doctor?.recordType === 'demo' || source?.name?.includes('Demonstration')
              ? 'Demonstration Profile'
              : (source?.reviewStatus === 'verified' ? 'Verified Practitioner' : 'Public Directory')}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          {homeVisit?.enabled && !isBookable && <span className="text-xs text-muted-foreground">Online schedule not provided</span>}
          {isBookable && <Link to={bookingPath} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover"><CalendarDays className="h-4 w-4" />Book home visit</Link>}
          <Link
            to={`${basePath}/doctors/${slug}`}
            className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors shrink-0"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </FrostedPanel>
  );
}
