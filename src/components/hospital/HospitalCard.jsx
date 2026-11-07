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
      className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col h-full min-w-0 border bg-white ${
        compared
          ? 'border-primary ring-2 ring-primary/20 shadow-card-hover'
          : 'border-border/80 hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5'
      }`}
    >
      {/* Top Row: Hospital Icon Badge and Save / Favorite Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#E6F4F1] flex items-center justify-center shrink-0">
          <Hospital className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-primary" />
        </div>

        <button
          type="button"
          onClick={onSave}
          className={`shrink-0 ${
            showSaveLabel
              ? 'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl'
              : 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl'
          } border border-border/80 bg-white flex items-center justify-center hover:bg-surface-elevated transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95`}
          title={isSaved ? 'Saved to your profile' : 'Save hospital'}
          aria-label={isSaved ? 'Remove from saved hospitals' : 'Save hospital'}
        >
          <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isSaved ? 'text-primary fill-current' : 'text-foreground/80'}`} />
          {showSaveLabel && <span>{isSaved ? 'Saved' : 'Save'}</span>}
        </button>
      </div>

      {/* Hospital Name */}
      <Link
        to={`${basePath}/hospitals/${slug}`}
        className="group/link block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm mt-2.5 mb-1"
      >
        <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground leading-snug group-hover/link:text-primary transition-colors line-clamp-2">
          {name}
        </h3>
      </Link>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 min-w-0">
        <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
        <span className="truncate" title={locString}>{locString}</span>
      </div>

      {/* Specialties */}
      {safeSpecialties.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1 min-w-0">
          {safeSpecialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 text-[11px] font-medium bg-surface-elevated/80 text-foreground rounded-md border border-border/60 whitespace-nowrap"
            >
              {s}
            </span>
          ))}
          {safeSpecialties.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-surface-elevated/40 text-muted-foreground rounded-md border border-border/40 whitespace-nowrap">
              +{safeSpecialties.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Hospital Type Pill */}
      {type && (
        <div className="mb-2.5">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F5EFE6] text-[#4F4A43] border border-border/40">
            {formatHospitalType(type)}
          </span>
        </div>
      )}

      {/* 2x2 Facilities Grid */}
      <div className="rounded-xl bg-[#EEF7F4]/90 border border-[#D5EAE2] grid grid-cols-2 mb-2.5 sm:mb-3 overflow-hidden">
        {/* Emergency */}
        <div className="p-2 sm:p-2.5 border-r border-b border-[#D5EAE2] flex items-center gap-2 min-w-0">
          <Siren className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">Emergency</div>
            <div
              title={formatMetricValue('Emergency', metrics?.emergency)}
              className={`text-[11px] sm:text-xs truncate ${
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
        <div className="p-2 sm:p-2.5 border-b border-[#D5EAE2] flex items-center gap-2 min-w-0">
          <Bed className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">ICU Beds</div>
            <div
              title={formatMetricValue('ICU Beds', metrics?.icuBeds)}
              className={`text-[11px] sm:text-xs truncate ${
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
        <div className="p-2 sm:p-2.5 border-r border-[#D5EAE2] flex items-center gap-2 min-w-0">
          <Ambulance className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">Ambulance</div>
            <div
              title={formatMetricValue('Ambulance', metrics?.ambulance)}
              className={`text-[11px] sm:text-xs truncate ${
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
        <div className="p-2 sm:p-2.5 flex items-center gap-2 min-w-0">
          <BedDouble className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">Total Beds</div>
            <div
              title={formatMetricValue('Total Beds', metrics?.totalBeds)}
              className={`text-[11px] sm:text-xs truncate ${
                typeof metrics?.totalBeds === 'number' && metrics.totalBeds > 0
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground/80 font-normal'
              }`}
            >
              {formatMetricValue('Total Beds', metrics?.totalBeds)}
            </div>
          </div>
        </div>
      </div>

      {/* Provenance & Verification Metadata */}
      {(() => {
        const provText = `${provenance?.reviewStatus === 'verified' ? 'Verified directory record' : 'Public directory record'}${provenance?.sourceName ? ` • ${provenance.sourceName}` : ''}`;
        return (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-2.5 mt-auto min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="truncate" title={provText}>
              {provText}
            </span>
          </div>
        );
      })()}

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2.5 pt-1 mt-auto">
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
          className={`flex-1 h-9 sm:h-10 px-3 rounded-xl border border-border/80 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition active:scale-95 ${
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
          className="flex-1 h-9 sm:h-10 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 shrink-0"
        >
          <span>View details</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
