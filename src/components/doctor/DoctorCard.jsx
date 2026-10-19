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
  const locality = safeLocation.locality?.trim();
  const city = safeLocation.city?.trim();
  const state = safeLocation.state?.trim();

  // Deduplicate redundant locality and city (e.g. "Vashi, Navi Mumbai")
  const locParts = [];
  if (locality) locParts.push(locality);
  if (city && (!locality || !locality.toLowerCase().includes(city.toLowerCase()))) {
    locParts.push(city);
  }
  if (state && (!city || !city.toLowerCase().includes(state.toLowerCase()))) {
    locParts.push(state);
  }
  const locString = locParts.length > 0 ? locParts.join(', ') : 'Practice location not specified';

  const primaryAffiliation = Array.isArray(affiliations) && affiliations[0];
  const isBookable = Boolean(homeVisit?.enabled && homeVisit?.days?.length && homeVisit?.startTime && homeVisit?.endTime);
  const bookingPath = basePath
    ? `/app/doctors/${slug}/book-home-visit`
    : `/login?redirect=${encodeURIComponent(`/app/doctors/${slug}/book-home-visit`)}`;

  return (
    <FrostedPanel
      variant="elevated"
      className="rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col h-full min-w-0 border border-border/70 hover:border-primary/40 bg-surface/90 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      {/* Header: Name, Specialization, and Experience Badges */}
      <div className="flex flex-col gap-2.5 mb-3.5">
        <div className="min-w-0">
          <Link
            to={`${basePath}/doctors/${slug}`}
            className="group/link inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
          >
            <h3 className="text-xl md:text-[22px] font-serif font-bold text-foreground leading-snug group-hover/link:text-primary transition-colors">
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-1">
            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{specialization}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {typeof yearsOfExperience === 'number' && yearsOfExperience > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
              {yearsOfExperience} yrs experience
            </span>
          )}
          {homeVisit?.enabled && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70 whitespace-nowrap inline-flex items-center gap-1">
              <Home className="w-3 h-3 text-amber-600" />
              <span>Home Visits</span>
            </span>
          )}
        </div>
      </div>

      {/* Qualifications & Location */}
      <div className="space-y-1.5 mb-3.5 text-xs text-muted-foreground">
        {qualifications && (
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
            <span className="truncate font-medium text-foreground/85">{qualifications}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
          <span className="truncate">{locString}</span>
        </div>
      </div>

      {/* Home Visit Service Areas & Timings */}
      {homeVisit?.enabled && homeVisit?.serviceAreas?.length > 0 && (
        <div className="mb-3.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
            <Home className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Coverage Areas</span>
          </div>
          <p className="text-muted-foreground leading-relaxed line-clamp-2">
            {homeVisit.serviceAreas.join(', ')}
          </p>
          {homeVisit.days?.length > 0 && (
            <p className="mt-1.5 text-[11px] font-medium text-amber-800/85">
              Available: {homeVisit.days.join(', ')} {homeVisit.startTime && homeVisit.endTime ? `(${homeVisit.startTime} – ${homeVisit.endTime})` : ''}
            </p>
          )}
        </div>
      )}

      {/* Primary Hospital Affiliation */}
      {primaryAffiliation ? (
        <div className="mb-4 p-3 rounded-xl bg-surface-elevated/60 border border-border/70 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{primaryAffiliation.hospitalName}</span>
          </div>
          {(primaryAffiliation.position || primaryAffiliation.department) && (
            <p className="mt-1 text-[11px] text-muted-foreground truncate pl-5">
              {[primaryAffiliation.position, primaryAffiliation.department].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 p-2.5 rounded-xl border border-dashed border-border/70 text-[11px] text-muted-foreground/75 text-center">
          Hospital affiliation not specified in directory
        </div>
      )}

      {/* Provenance & Actions Footer */}
      <div className="pt-3.5 border-t border-border/60 flex flex-col gap-3 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 truncate">
          <ShieldCheck
            className={`w-3.5 h-3.5 shrink-0 ${
              source?.reviewStatus === 'verified' ? 'text-primary' : 'text-muted-foreground/70'
            }`}
          />
          <span className="truncate">
            {doctor?.recordType === 'demo' || source?.name?.includes('Demonstration')
              ? 'Demonstration Profile'
              : source?.reviewStatus === 'verified'
              ? 'Verified Practitioner'
              : 'Public Medical Directory'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full">
          {isBookable ? (
            <Link
              to={bookingPath}
              className="flex-1 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Book home visit</span>
            </Link>
          ) : homeVisit?.enabled ? (
            <span className="text-[11px] text-muted-foreground/70 italic py-1">Online schedule not configured</span>
          ) : null}

          <Link
            to={`${basePath}/doctors/${slug}`}
            className="flex-1 sm:flex-initial sm:ml-auto inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface px-3.5 py-2 text-xs font-semibold text-foreground/90 hover:border-primary/40 hover:text-primary transition-all duration-150 active:scale-95"
          >
            <span>View profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </FrostedPanel>
  );
}
