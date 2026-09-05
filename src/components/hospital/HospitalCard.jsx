import TrustMetadata from "./TrustMetadata";
import { MapPin, Heart, GitCompare, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../hooks/useCompare';
import FrostedPanel from '../common/FrostedPanel';

function FactBox({ label, value, highlight }) {
  return (
    <div className="flex flex-col border border-border/50 rounded-lg p-2.5 bg-surface/30">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value === null ? 'Not provided' : value === true ? '✓ Available' : value === false ? 'No' : value}
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
    <FrostedPanel variant="elevated" className={`rounded-[22px] p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full ${isCompared(slug) ? '!border-primary ring-1 ring-primary/20' : ''}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <Link to={`${basePath}/hospitals/${slug}`} className="hover:underline decoration-primary/30 underline-offset-4 inline-block">
            <h3 className="text-lg font-serif font-bold text-foreground leading-tight truncate">
              {name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{locString}</span>
            </span>
            {type && (
              <>
                <span className="opacity-40 hidden sm:inline">•</span>
                <span className="shrink-0">{type}</span>
              </>
            )}
          </div>
        </div>
        
        <button 
          onClick={onSave}
          className={`shrink-0 p-2 rounded-full transition-colors ${
            isSaved 
              ? 'bg-primary/10 text-primary' 
              : 'bg-surface hover:bg-surface/80 text-muted-foreground hover:text-foreground'
          }`}
          title={isSaved ? "Saved" : "Save hospital"}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Specialties Inline */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {specialties?.slice(0, 3).map(s => (
          <span key={s} className="px-2 py-0.5 text-[11px] font-medium bg-surface text-foreground rounded border border-border/50 whitespace-nowrap">
            {s}
          </span>
        ))}
        {specialties?.length > 3 && (
          <span className="px-2 py-0.5 text-[11px] font-medium bg-surface/50 text-muted-foreground rounded whitespace-nowrap">
            +{specialties.length - 3}
          </span>
        )}
      </div>

      {/* Fact Grid */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <FactBox label="Emergency" value={metrics?.emergency === true ? '24/7' : metrics?.emergency} highlight={metrics?.emergency === true} />
        <FactBox label="ICU" value={metrics?.icuBeds !== null ? (metrics?.icuBeds ? 'Available' : 'No') : null} />
        <FactBox label="Ambulance" value={metrics?.ambulance} />
        <FactBox label="Beds" value={metrics?.totalBeds} />
      </div>



      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
        {/* Source / Provenance block */}
        <TrustMetadata provenance={provenance} compact={true} />
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (isCompared(slug)) removeHospital(slug);
              else if (canAdd) addHospital(slug);
              else alert("You can compare up to 3 hospitals.");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isCompared(slug) 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'border-border text-muted-foreground hover:bg-surface hover:text-foreground'
            }`}
          >
            {isCompared(slug) ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
            {isCompared(slug) ? 'Added' : 'Compare'}
          </button>
          
          <Link 
            to={`${basePath}/hospitals/${slug}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </FrostedPanel>
  );
}
