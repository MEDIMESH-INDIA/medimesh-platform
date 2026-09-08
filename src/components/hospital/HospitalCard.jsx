import { MapPin, Heart, GitCompare, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../hooks/useCompare';
import FrostedPanel from '../common/FrostedPanel';
import { formatHospitalType } from '../../lib/utils/formatters';

function FactBox({ label, value, highlight }) {
  let displayValue = 'Not provided';
  if (value === true) displayValue = label === 'Emergency' ? '24/7' : 'Available';
  else if (value === false) displayValue = 'No';
  else if (typeof value === 'number') displayValue = String(value);
  else if (typeof value === 'string' && value.trim() !== '') displayValue = value;

  return (
    <div className="min-w-0 flex flex-col justify-start p-2.5">
      <span className="mb-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-[13px] sm:text-[14px] font-medium leading-snug break-words ${highlight ? 'text-primary' : 'text-foreground'}`}>
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
  const locString = [safeLocation.locality, safeLocation.city, safeLocation.district, safeLocation.state].filter(Boolean).join(', ') || 'Location not provided';
  // const _loc = safeLocation.locality



  const safeSpecialties = Array.isArray(specialties) ? specialties : [];

  return (
    <FrostedPanel
      variant="elevated"
      className={`rounded-[20px] p-5 hover:border-border/90 hover:shadow-[0_4px_20px_rgba(18,49,43,0.03)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col h-full min-w-0 ${
        isCompared(slug) ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]' : 'border-border/60 hover:border-border/90'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <Link to={`${basePath}/hospitals/${slug}`} className="hover:text-primary transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm">
            <h3 className="text-[20px] md:text-[22px] font-serif font-bold text-foreground leading-[1.25]">
              {name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1.5">
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{locString}</span>
            </span>
            {type && (
              <>
                <span className="opacity-40 hidden sm:inline">•</span>
                <span className="">{formatHospitalType(type)}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onSave}
          className={`shrink-0 ${showSaveLabel ? 'flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl' : 'p-2 rounded-full'} transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 ${
            isSaved
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-surface border border-border/50 hover:bg-surface/80 text-muted-foreground hover:text-foreground'
          }`}
          title={isSaved ? "Saved" : "Save hospital"}
          aria-label={isSaved ? "Remove from saved" : "Save hospital"}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          {showSaveLabel && <span>{isSaved ? 'Remove' : 'Save'}</span>}
        </button>
      </div>

      {/* Specialties Inline */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {safeSpecialties.length > 0 ? (
          <>
            {safeSpecialties.slice(0, 3).map(s => (
              <span key={s} className="px-2.5 py-0.5 text-xs font-medium bg-surface/80 text-foreground rounded border border-border/50 whitespace-nowrap">
                {s}
              </span>
            ))}
            {safeSpecialties.length > 3 && (
              <span className="px-2.5 py-0.5 text-xs font-medium bg-surface/30 text-muted-foreground rounded whitespace-nowrap border border-border/30">
                +{safeSpecialties.length - 3}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Specialties not provided</span>
        )}
      </div>

      {/* Fact Grid */}
      <div className="hospital-metrics grid grid-cols-2 gap-0 mb-3 mt-auto overflow-hidden rounded-xl border border-border/60 bg-surface/35">
        <FactBox label="Emergency" value={metrics?.emergency} highlight={metrics?.emergency === true} />
        <FactBox label="ICU Beds" value={metrics?.icuBeds} />
        <FactBox label="Ambulance" value={metrics?.ambulance} />
        <FactBox label="Beds" value={metrics?.totalBeds} />
      </div>

      <div className="text-[12px] font-medium text-muted-foreground/80 mt-1 mb-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span>
          {provenance?.sourceName || 'Public Dataset'} &middot; Verified {provenance?.checkedAt ? new Date(provenance.checkedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'recently'}
        </div>

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-border/60 flex flex-col gap-2">

        {/* Source / Provenance block */}


        {/* Actions */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (isCompared(slug)) removeHospital(slug);
              else if (canAdd) addHospital(hospital);
            }}
            disabled={!isCompared(slug) && !canAdd}
            title={!isCompared(slug) && !canAdd ? "You can compare up to 3 hospitals" : ""}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-h-10 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 border ${
              isCompared(slug)
                ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
                : 'border-border/60 text-muted-foreground hover:bg-surface hover:text-foreground hover:border-border'
            } disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed`}
          >
            {isCompared(slug) ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
            {isCompared(slug) ? 'In comparison' : '+ Compare'}
          </button>

          <Link
            to={`${basePath}/hospitals/${slug}`}
            className="flex-1 sm:flex-none sm:ml-auto flex items-center justify-center gap-1 min-h-10 px-3 py-2 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:-translate-y-[1px] active:translate-y-0 active:scale-95"
          >
            View details &rarr;
          </Link>
        </div>
      </div>
    </FrostedPanel>
  );
}
