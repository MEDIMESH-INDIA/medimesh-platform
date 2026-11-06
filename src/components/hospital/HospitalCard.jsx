import { MapPin, Heart, Stethoscope, Check, ArrowRight, Hospital, Siren, Bed, BedDouble, Ambulance } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../hooks/useCompare';
import { useAuthGate } from '../../hooks/useAuthGate';
import { formatHospitalType } from '../../lib/utils/formatters';

function formatMetricValue(label, value) {
  if (value === true) {
    return label === 'Emergency' ? '24/7 Available' : 'Available';
  }
  if (value === false) {
    return 'Not available';
  }
  if (typeof value === 'number' && value > 0) {
    return String(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }
  return 'Not specified';
}

export default function HospitalCard({ hospital = {}, isSaved, onSave, showSaveLabel = false }) {
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();
  const { requireAuth } = useAuthGate();
  const locationPath = useLocation().pathname;
  const basePath = locationPath.startsWith('/app') ? '/app' : '';

  const { slug, name = 'Hospital', location, type, specialties, metrics, provenance } = hospital || {};

  const safeLocation = location || {};
  const locality = safeLocation.locality?.trim();
  const city = safeLocation.city?.trim();
  const state = safeLocation.state?.trim();

  // Deduplicate redundant locality, city, state
  const locParts = [];
  if (locality) locParts.push(locality);
  if (city && (!locality || !locality.toLowerCase().includes(city.toLowerCase()))) {
    locParts.push(city);
  }
  if (state && (!city || !city.toLowerCase().includes(state.toLowerCase()))) {
    locParts.push(state);
  }
  const locString = locParts.length > 0 ? locParts.join(', ') : 'Location not specified';

  const safeSpecialties = Array.isArray(specialties) ? specialties : [];
  const compared = isCompared(slug);

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col h-full min-w-0 border bg-white ${
        compared
          ? 'border-primary ring-2 ring-primary/20 shadow-card-hover'
          : 'border-border/80 hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5'
      }`}
    >
      {/* Top Row: Hospital Icon Badge and Save / Favorite Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E6F4F1] flex items-center justify-center shrink-0">
          <Hospital className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
        </div>

        <button
          type="button"
          onClick={onSave}
          className={`shrink-0 ${
            showSaveLabel
              ? 'flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-2xl'
              : 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl'
          } border border-border/80 bg-white flex items-center justify-center hover:bg-surface-elevated transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95`}
          title={isSaved ? 'Saved to your profile' : 'Save hospital'}
          aria-label={isSaved ? 'Remove from saved hospitals' : 'Save hospital'}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'text-primary fill-current' : 'text-foreground/80'}`} />
          {showSaveLabel && <span>{isSaved ? 'Saved' : 'Save'}</span>}
        </button>
      </div>

      {/* Hospital Name */}
      <Link
        to={`${basePath}/hospitals/${slug}`}
        className="group/link block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm mt-4 mb-2"
      >
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground leading-snug group-hover/link:text-primary transition-colors line-clamp-2">
          {name}
        </h3>
      </Link>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-1">
        <MapPin className="w-4 h-4 shrink-0 text-muted-foreground/80" />
        <span className="truncate">{locString}</span>
      </div>

      {/* Specialties */}
      <div className="mb-2">
        {safeSpecialties.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {safeSpecialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="px-2.5 py-0.5 text-xs font-medium bg-surface-elevated/80 text-foreground rounded-md border border-border/60 whitespace-nowrap"
              >
                {s}
              </span>
            ))}
            {safeSpecialties.length > 3 && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-elevated/40 text-muted-foreground rounded-md border border-border/40 whitespace-nowrap">
                +{safeSpecialties.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <div className="italic text-xs sm:text-sm text-muted-foreground/80">Specialties not specified in directory</div>
        )}
      </div>

      {/* Hospital Type Pill */}
      {type && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-[#F5EFE6] text-[#4F4A43] border border-border/40">
            {formatHospitalType(type)}
          </span>
        </div>
      )}

      {/* 2x2 Facilities Grid */}
      <div className="rounded-2xl bg-[#EEF7F4]/90 border border-[#D5EAE2] grid grid-cols-2 mb-4 overflow-hidden">
        {/* Emergency */}
        <div className="p-3 sm:p-3.5 border-r border-b border-[#D5EAE2] flex items-center gap-2.5 min-w-0">
          <Siren className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">Emergency</div>
            <div
              className={`text-xs sm:text-sm truncate ${
                metrics?.emergency === true
                  ? 'text-primary font-bold'
                  : metrics?.emergency === false
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground/80 font-normal'
              }`}
            >
              {formatMetricValue('Emergency', metrics?.emergency)}
            </div>
          </div>
        </div>

        {/* ICU Beds */}
        <div className="p-3 sm:p-3.5 border-b border-[#D5EAE2] flex items-center gap-2.5 min-w-0">
          <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">ICU Beds</div>
            <div
              className={`text-xs sm:text-sm truncate ${
                typeof metrics?.icuBeds === 'number' && metrics.icuBeds > 0
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground/80 font-normal'
              }`}
            >
              {formatMetricValue('ICU Beds', metrics?.icuBeds)}
            </div>
          </div>
        </div>

        {/* Ambulance */}
        <div className="p-3 sm:p-3.5 border-r border-[#D5EAE2] flex items-center gap-2.5 min-w-0">
          <Ambulance className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">Ambulance</div>
            <div
              className={`text-xs sm:text-sm truncate ${
                metrics?.ambulance === true
                  ? 'text-primary font-bold'
                  : metrics?.ambulance === false
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground/80 font-normal'
              }`}
            >
              {formatMetricValue('Ambulance', metrics?.ambulance)}
            </div>
          </div>
        </div>

        {/* Total Beds */}
        <div className="p-3 sm:p-3.5 flex items-center gap-2.5 min-w-0">
          <BedDouble className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">Total Beds</div>
            <div
              className={`text-xs sm:text-sm truncate ${
                typeof metrics?.totalBeds === 'number' && metrics.totalBeds > 0
                  ? 'text-foreground font-bold text-sm sm:text-base'
                  : 'text-muted-foreground/80 font-normal'
              }`}
            >
              {formatMetricValue('Total Beds', metrics?.totalBeds)}
            </div>
          </div>
        </div>
      </div>

      {/* Provenance & Verification Metadata */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4 mt-auto">
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <span className="truncate">
          {provenance?.reviewStatus === 'verified' ? 'Verified directory record' : 'Public directory record'}
          {provenance?.sourceName ? ` • ${provenance.sourceName}` : ''}
        </span>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-3 pt-1 mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (compared) {
              removeHospital(slug);
            } else if (canAdd) {
              requireAuth({
                action: () => addHospital(hospital),
                resumeAction: () => addHospital(hospital),
                title: 'Compare Hospitals',
                message: 'Sign in or create an account to compare hospitals side-by-side.',
              });
            }
          }}
          disabled={!compared && !canAdd}
          title={!compared && !canAdd ? 'You can compare up to 3 hospitals at once' : ''}
          className={`flex-1 h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-border/80 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition active:scale-95 ${
            compared
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-white hover:bg-surface-elevated text-foreground'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {compared ? (
            <Check className="w-4 h-4 text-primary shrink-0" />
          ) : (
            <Stethoscope className="w-4 h-4 text-foreground shrink-0" />
          )}
          <span className="truncate">{compared ? 'In comparison' : '+ Compare'}</span>
        </button>

        <Link
          to={`${basePath}/hospitals/${slug}`}
          className="flex-1 h-11 sm:h-12 px-3 sm:px-4 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 shrink-0"
        >
          <span>View details</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
