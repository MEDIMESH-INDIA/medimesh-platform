/* eslint-disable react/prop-types */
import { MapPin, Building2, ChevronRight, Heart, GitCompare, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrustMetadata from './TrustMetadata';

// eslint-disable-next-line react/prop-types
export default function HospitalCard({ hospital, isSaved, onSave, onCompare }) {
  // eslint-disable-next-line react/prop-types
  const { slug, name, location, type, specialties, facilities, trustMetadata } = hospital;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 relative group flex flex-col h-full z-10">
      
      {/* Top right actions */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <button 
          onClick={onSave}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-surface hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors active:scale-95"
          title={isSaved ? "Unsave hospital" : "Save hospital"}
        >
          <Heart className={`w-4 h-4 transition-all ${isSaved ? 'fill-primary text-primary' : ''}`} />
        </button>
      </div>

      <div className="mb-4 pr-12">
        <Link to={`/app/hospital/${slug}`} className="hover:underline decoration-primary/30 underline-offset-4">
          <h3 className="text-xl font-serif font-bold text-foreground mb-2 leading-tight">
            {name || 'Not provided'}
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
            {/* eslint-disable-next-line react/prop-types */}
            {specialties?.slice(0, 3).map(s => (
              <span key={s} className="px-2 py-1 text-xs font-medium bg-surface text-foreground rounded-md border border-border/50">
                {s}
              </span>
            ))}
            {/* eslint-disable-next-line react/prop-types */}
            {specialties?.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-surface/50 text-muted-foreground rounded-md">
                {/* eslint-disable-next-line react/prop-types */}
                +{specialties.length - 3}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Top Facilities</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground">
            {/* eslint-disable-next-line react/prop-types */}
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
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {onCompare && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                const list = JSON.parse(localStorage.getItem('compareList') || '[]');
                const isCompared = list.includes(slug);
                if (isCompared) {
                  const newList = list.filter(i => i !== slug);
                  localStorage.setItem('compareList', JSON.stringify(newList));
                  window.dispatchEvent(new Event('compare-updated'));
                } else if (list.length < 3) {
                  onCompare(hospital);
                }
              }}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              title="Add to compare"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          <Link 
              to={`/app/hospital/${slug}`}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              View details
            </Link>
        </div>
      </div>
    </div>
  );
}