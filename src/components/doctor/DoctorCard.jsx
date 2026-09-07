import { MapPin, Building2, Stethoscope, ShieldCheck, ArrowRight, Award } from 'lucide-react';
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
    languages = [],
    consultationModes = [],
    source = {},
  } = doctor || {};

  const safeLocation = location || {};
  const locString = safeLocation.locality && safeLocation.city
    ? `${safeLocation.locality}, ${safeLocation.city}`
    : safeLocation.locality || safeLocation.city || 'Navi Mumbai';

  const primaryAffiliation = affiliations[0];

  return (
    <FrostedPanel
      variant="elevated"
      className="rounded-[20px] p-5 sm:p-6 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full min-w-0 border-border/70 hover:border-border/90"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`${basePath}/doctors/${slug}`}
            className="hover:text-primary transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
          >
            <h3 className="text-lg md:text-[20px] font-serif font-semibold text-foreground leading-[1.25] line-clamp-1" title={name}>
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{specialization}</span>
          </div>
        </div>

        {yearsOfExperience && (
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
            {yearsOfExperience} yrs exp
          </span>
        )}
      </div>

      {/* Qualifications & Location */}
      <div className="space-y-2 mb-4 text-xs text-muted-foreground">
        {qualifications && (
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate font-medium">{qualifications}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
          <span className="truncate">{locString}</span>
        </div>
      </div>

      {/* Primary Hospital Affiliation */}
      {primaryAffiliation ? (
        <div className="mb-4 p-3 rounded-xl bg-surface/50 border border-border/50 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{primaryAffiliation.hospitalName}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate pl-5">
            {primaryAffiliation.position || primaryAffiliation.department}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-xl bg-surface/20 border border-border/30 text-xs text-muted-foreground italic">
          Hospital affiliation details not provided
        </div>
      )}

      {/* Consultation Modes */}
      {consultationModes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {consultationModes.map(mode => (
            <span key={mode} className="px-2.5 py-0.5 text-[11px] font-medium bg-surface text-muted-foreground rounded-md border border-border/50">
              {mode}
            </span>
          ))}
        </div>
      )}
      {/* Consultation Modes & Languages */}
      <div className="flex flex-col gap-2 mb-5 mt-auto">
        {languages?.length > 0 && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
            <span className="font-semibold shrink-0">Speaks:</span>
            <span className="truncate">{languages.join(', ')}</span>
          </div>
        )}

        {consultationModes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {consultationModes.map(mode => (
              <span key={mode} className="px-2.5 py-0.5 text-[11px] font-medium bg-surface text-muted-foreground rounded-md border border-border/50">
                {mode}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Provenance & Action */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{source?.reviewStatus === 'verified' ? 'Verified Practitioner' : 'Public Directory'}</span>
          <span className="truncate">
            {doctor?.recordType === 'demo' || source?.name?.includes('Demonstration')
              ? 'Demonstration Profile'
              : (source?.reviewStatus === 'verified' ? 'Verified Practitioner' : 'Public Directory')}
          </span>
        </div>

        <Link
          to={`${basePath}/doctors/${slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          <span>View profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </FrostedPanel>
  );
}
