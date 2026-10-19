import { useState } from 'react';
import { Building2 } from 'lucide-react';

export default function HospitalHeroImage({ hospital, className = '' }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const name = hospital?.name || 'Healthcare Institution';

  // Priority 1: Verified record image
  // Priority 2: Places photo if attached
  const candidateImageUrl = hospital?.imageUrl || hospital?.photo || null;
  const showImage = Boolean(candidateImageUrl) && !imgError;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[20px] border border-border/80 bg-gradient-to-br from-[#fbfcfb] via-[#f4f7f5] to-[#e8eee9] shadow-[0_4px_20px_rgba(15,40,35,0.05)] ${className}`}
      role="region"
      aria-label={`Hospital visual for ${name}`}
    >
      {showImage ? (
        <>
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted/30" aria-hidden="true" />
          )}
          <img
            src={candidateImageUrl}
            alt={`Photograph of ${name}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-4 sm:p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              <Building2 className="h-3.5 w-3.5 text-teal-300" />
              Verified Facility Photograph
            </span>
          </div>
        </>
      ) : (
        /* Polished architectural and clinical fallback visual */
        <div className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6">
          {/* Architectural background pattern */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full stroke-primary/[0.08]"
            viewBox="0 0 500 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern id="arch-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arch-grid)" />
            {/* Architectural elevation outlines */}
            <circle cx="380" cy="90" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="380" cy="90" r="80" stroke="currentColor" strokeWidth="1" />
            <path d="M 280 300 L 280 120 L 480 120 L 480 300" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 320 150 H 350 M 410 150 H 440 M 320 190 H 350 M 410 190 H 440 M 320 230 H 350 M 410 230 H 440" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 380 200 V 300" stroke="currentColor" strokeWidth="1.2" />
            {/* Precision crosshair marker */}
            <path d="M 380 70 V 110 M 360 90 H 400" stroke="#0A7A6A" strokeWidth="1.5" strokeOpacity="0.3" />
          </svg>

          {/* Top header indicator */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-2xs backdrop-blur-sm">
              <Building2 className="h-3.5 w-3.5" />
              Institutional Record
            </span>
            <span className="text-xs font-medium text-muted-foreground/80">
              Architectural Overview
            </span>
          </div>

          {/* Center Graphic Crest */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/20 bg-white/90 text-primary shadow-[0_4px_16px_rgba(10,122,106,0.12)] ring-4 ring-primary/5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v12M6 12h12" />
              </svg>
            </div>
            <p className="mt-3 font-serif text-sm font-medium tracking-wide text-muted-foreground">
              Physical Healthcare Facility
            </p>
          </div>

          {/* Bottom notice */}
          <div className="relative z-10 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span>MEDIMESH Directory</span>
            <span className="font-medium text-muted-foreground/80">
              Official photograph not published
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

