import { MapPin, Heart, GitCompare, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../hooks/useCompare';
import FrostedPanel from '../common/FrostedPanel';
import { formatHospitalType } from '../../lib/utils/formatters';
import TrustMetadata from "./TrustMetadata";

function FactBox({ label, value, highlight }) {
  let displayValue = 'Not provided';
  if (value === true) displayValue = 'Available';
  else if (value === false) displayValue = 'No';
  else if (value !== null && value !== undefined && value !== '') displayValue = value;

  return (
    <div className="flex flex-col border border-border/40 rounded-xl p-2.5 bg-surface/30 min-w-0">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5 truncate">{label}</span>
      <span className={`text-[13px] font-medium leading-tight truncate ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {displayValue}
      </span>
    </div>
  );
}

export default function HospitalCard({ hospital, isSaved, onSave }) {
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();
  const locationPath = useLocation().pathname;
  const basePath = locationPath.startsWith('/app') ? '/app' : '';
  
  const { slug, name, location, type, specialties, metrics, provenance } = hospital;
  
  const locString = location.locality && location.city 
    ? `${location.locality}, ${location.city}` 
    : location.locality || location.city || 'Location not provided';

  return (
    <FrostedPanel 
      variant="elevated" 
      className={`rounded-[20px] p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-[200ms] flex flex-col h-full min-w-0 ${
        isCompared(slug) ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]' : 'border-border/60 hover:border-border/90'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="min-w-0 flex-1 pr-2">
          <Link to={`${basePath}/hospitals/${slug}`} className="hover:text-primary transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm">
            <h3 className="text-lg md:text-[21px] font-serif font-semibold text-foreground leading-[1.2] line-clamp-2" title={name}>
              {name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1.5">
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{locString}</span>
            </span>
            {type && (
              <>
                <span className="opacity-40 hidden sm:inline">•</span>
                <span className="shrink-0">{formatHospitalType(type)}</span>
              </>
            )}
          </div>
        </div>
        
        <button 
          onClick={onSave}
          className={`shrink-0 p-2 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 ${
            isSaved 
              ? 'bg-primary/10 text-primary hover:bg-primary/20' 
              : 'bg-surface border border-border/50 hover:bg-surface/80 text-muted-foreground hover:text-foreground'
          }`}
          title={isSaved ? "Saved" : "Save hospital"}
          aria-label={isSaved ? "Remove from saved" : "Save hospital"}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Specialties Inline */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {specialties?.length > 0 ? (
          <>
            {specialties.slice(0, 3).map(s => (
              <span key={s} className="px-2.5 py-0.5 text-xs font-medium bg-surface/80 text-foreground rounded border border-border/50 whitespace-nowrap">
                {s}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="px-2.5 py-0.5 text-xs font-medium bg-surface/30 text-muted-foreground rounded whitespace-nowrap border border-border/30">
                +{specialties.length - 3}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic">Specialties not provided</span>
        )}
      </div>

      {/* Fact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 mt-auto">
        <FactBox label="Emergency" value={metrics?.emergency} highlight={metrics?.emergency === true} />
        <FactBox label="ICU Beds" value={metrics?.icuBeds} />
        <FactBox label="Ambulance" value={metrics?.ambulance} />
        <FactBox label="Beds" value={metrics?.totalBeds} />
      </div>

      {/* Footer / Actions */}
      <div className="pt-4 border-t border-border/60 flex flex-col gap-4">
        
        {/* Source / Provenance block */}
        <TrustMetadata provenance={provenance} compact={true} />
        
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
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 border ${
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
            className="flex-1 sm:flex-none sm:ml-auto flex items-center justify-center gap-1 px-4 py-2 bg-primary/10 text-primary text-[13px] font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:-translate-y-[1px] active:translate-y-0 active:scale-95"
          >
            View details &rarr;
          </Link>
        </div>
      </div>
    </FrostedPanel>
  );
}
