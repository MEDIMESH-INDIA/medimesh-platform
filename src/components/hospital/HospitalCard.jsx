import { MapPin, Heart, GitCompare, Check, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../hooks/useCompare';
import FrostedPanel from '../common/FrostedPanel';
import { formatHospitalType } from '../../lib/utils/formatters';

function FactBox({ label, value, highlight }) {
  let displayValue = 'Not specified';
  let isMuted = true;

  if (value === true) {
    displayValue = label === 'Emergency' ? '24/7 Available' : 'Available';
    isMuted = false;
  } else if (value === false) {
    displayValue = 'Not available';
  } else if (typeof value === 'number') {
    displayValue = String(value);
    isMuted = false;
  } else if (typeof value === 'string' && value.trim() !== '') {
    displayValue = value.trim();
    isMuted = false;
  }

  return (
    <div className="min-w-0 flex flex-col justify-start p-2.5 sm:p-3">
      <span className="mb-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/85">
        {label}
      </span>
      <span
        className={`text-xs sm:text-[13px] leading-snug break-words ${
          highlight
            ? 'text-primary font-bold'
            : isMuted
            ? 'text-muted-foreground/70 font-normal'
            : 'text-foreground font-semibold'
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}

export default function HospitalCard({ hospital = {}, isSaved, onSave, showSaveLabel = false }) {
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();
  const locationPath = useLocation().pathname;
  const basePath = locationPath.startsWith('/app') ? '/app' : '';

  const { slug, name = 'Hospital', location, type, specialties, metrics, provenance } = hospital || {};

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
  const locString = locParts.length > 0 ? locParts.join(', ') : 'Location not specified';

  const safeSpecialties = Array.isArray(specialties) ? specialties : [];
  const compared = isCompared(slug);

  return (
    <FrostedPanel
      variant="elevated"
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col h-full min-w-0 border ${
        compared
          ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.025] shadow-card-hover'
          : 'border-border/70 hover:border-primary/40 bg-surface/90 hover:shadow-card-hover hover:-translate-y-0.5'
      }`}
    >
      {/* Header: Name and Save Button */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`${basePath}/hospitals/${slug}`}
            className="group/link inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
          >
            <h3 className="text-xl md:text-[22px] font-serif font-bold text-foreground leading-snug group-hover/link:text-primary transition-colors">
              {name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1.5">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
              <span className="truncate">{locString}</span>
            </span>
            {type && (
              <>
                <span className="text-border text-xs hidden sm:inline">•</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-elevated text-muted-foreground border border-border/60">
                  {formatHospitalType(type)}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          className={`shrink-0 ${
            showSaveLabel
              ? 'flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl'
              : 'p-2.5 rounded-xl'
          } border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 ${
            isSaved
              ? 'bg-primary/10 border-primary/25 text-primary hover:bg-primary/15'
              : 'bg-surface border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface-elevated hover:border-border'
          }`}
          title={isSaved ? 'Saved to your profile' : 'Save hospital'}
          aria-label={isSaved ? 'Remove from saved hospitals' : 'Save hospital'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          {showSaveLabel && <span>{isSaved ? 'Saved' : 'Save'}</span>}
        </button>
      </div>

      {/* Specialties Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {safeSpecialties.length > 0 ? (
          <>
            {safeSpecialties.slice(0, 3).map(s => (
              <span
                key={s}
                className="px-2.5 py-0.5 text-xs font-medium bg-surface-elevated/70 text-foreground rounded-md border border-border/60 whitespace-nowrap"
              >
                {s}
              </span>
            ))}
            {safeSpecialties.length > 3 && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-elevated/40 text-muted-foreground rounded-md border border-border/40 whitespace-nowrap">
                +{safeSpecialties.length - 3} more
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground/75 italic">Specialties not specified in directory</span>
        )}
      </div>

      {/* Factual Metrics Grid */}
      <div className="hospital-metrics grid grid-cols-2 gap-0 mb-3 mt-auto overflow-hidden rounded-xl border border-border/70 bg-surface-elevated/35">
        <FactBox label="Emergency" value={metrics?.emergency} highlight={metrics?.emergency === true} />
        <FactBox label="ICU Beds" value={metrics?.icuBeds} />
        <FactBox label="Ambulance" value={metrics?.ambulance} />
        <FactBox label="Total Beds" value={metrics?.totalBeds} />
      </div>

      {/* Provenance & Verification Metadata */}
      <div className="text-[11px] font-medium text-muted-foreground/80 mt-1 mb-4 flex items-center gap-1.5 truncate">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/75 shrink-0" />
        <span className="truncate">
          {provenance?.sourceName || 'Public Healthcare Directory'} &middot; Verified{' '}
          {provenance?.checkedAt
            ? new Date(provenance.checkedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'recently'}
        </span>
      </div>

      {/* Footer Actions */}
      <div className="pt-3.5 border-t border-border/60 flex items-center gap-2 mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (compared) removeHospital(slug);
            else if (canAdd) addHospital(hospital);
          }}
          disabled={!compared && !canAdd}
          title={!compared && !canAdd ? 'You can compare up to 3 hospitals at once' : ''}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-h-10 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 border ${
            compared
              ? 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/15'
              : 'border-border/70 text-foreground/80 hover:bg-surface-elevated hover:text-foreground hover:border-border'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {compared ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
          <span>{compared ? 'In comparison' : '+ Compare'}</span>
        </button>

        <Link
          to={`${basePath}/hospitals/${slug}`}
          className="flex-1 sm:flex-none sm:ml-auto inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-sm active:scale-95"
        >
          <span>View details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </FrostedPanel>
  );
}
