import { MapPin, Building2, Heart, GitCompare, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../hooks/useCompare';
import FrostedPanel from '../common/FrostedPanel';
import TrustMetadata from './TrustMetadata';

export default function HospitalCard({ hospital, isSaved, onSave }) {
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();
  const locationPath = useLocation().pathname;
  const basePath = locationPath.startsWith('/app') ? '/app' : '';
  const { slug, name, location, type, specialties, facilities, trustMetadata } = hospital;

  return (
    <FrostedPanel variant="elevated" className={`rounded-[22px] p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 relative group flex flex-col h-full z-10 ${isCompared(slug) ? '!border-primary ring-1 ring-primary/20' : ''}`}>
      
      <div className="mb-4 pr-12">
        <Link to={`${basePath}/hospitals/${slug}`} className="hover:underline decoration-primary/30 underline-offset-4">
          <h3 className="text-xl font-serif font-bold text-foreground mb-2 leading-tight">
            {name}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{type || 'Not provided'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Key Specialties</p>
          <div className="flex flex-wrap gap-1.5">
            {specialties?.slice(0, 3).map(s => (
              <span key={s} className="px-2 py-1 text-xs font-medium bg-surface text-foreground rounded-md border border-border/50">
                {s}
              </span>
            ))}
            {specialties?.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-surface/50 text-muted-foreground rounded-md">
                +{specialties.length - 3}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Top Facilities</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground">
            {facilities?.slice(0, 3).map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary/40"></div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <TrustMetadata trustMetadata={trustMetadata} compact />
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={onSave}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border ${
              isSaved 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'border-border text-muted-foreground hover:bg-surface hover:text-foreground'
            }`}
            title={isSaved ? "Unsave hospital" : "Save hospital"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (isCompared(slug)) {
                removeHospital(slug);
              } else if (canAdd) {
                addHospital(slug);
              } else {
                alert("You can compare up to 3 hospitals.");
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border ${
              isCompared(slug) 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'border-border text-muted-foreground hover:bg-surface hover:text-foreground'
            }`}
          >
            {isCompared(slug) ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
            {isCompared(slug) ? 'Added' : '+ Compare'}
          </button>
          
          <Link 
            to={`${basePath}/hospitals/${slug}`}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            View details
          </Link>
        </div>
      </div>
    </FrostedPanel>
  );
}
