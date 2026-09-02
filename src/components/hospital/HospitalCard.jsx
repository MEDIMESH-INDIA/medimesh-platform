/* eslint-disable react/prop-types */
import { Heart, MapPin, Building2, Activity, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HospitalCard({ hospital, onCompare, onSave, isSaved = false }) {
  const { name, slug, location, type, specialties, facilities, trustMetadata } = hospital;

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group flex flex-col md:flex-row h-full">
      <div className="p-5 flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground font-serif truncate">
              {name || 'Not provided'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{location || 'Not provided'}</span>
              <span className="text-border">•</span>
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{type || 'Not provided'}</span>
            </div>
          </div>
          {trustMetadata?.reviewState && (
            <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              {trustMetadata.reviewState}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-start gap-2 text-sm">
            <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-foreground line-clamp-2">
              {specialties?.length ? specialties.join(' • ') : 'Specialties not provided'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {facilities?.slice(0, 3).map((facility) => (
              <span key={facility} className="bg-surface px-2 py-1 rounded-md text-muted-foreground border border-border/50">
                {facility}
              </span>
            ))}
            {facilities?.length > 3 && (
              <span className="bg-surface px-2 py-1 rounded-md text-muted-foreground border border-border/50">
                +{facilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground truncate flex-1">
            Source: <span className="font-medium text-foreground">{trustMetadata?.source || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => onSave?.(hospital)}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved ? 'bg-red-50 border-red-200 text-red-600' : 'border-border text-muted-foreground hover:bg-surface hover:text-foreground'
              }`}
              title={isSaved ? "Remove from saved" : "Save hospital"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => onCompare?.(hospital)}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              title="Add to compare"
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <Link 
              to={`/app/hospitals/${slug}`}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
