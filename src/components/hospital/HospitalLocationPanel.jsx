import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, MapPin, Navigation } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Button from '../common/Button';
import {
  buildGoogleMapsUrl,
  getHospitalMapDestination,
  hasResolvedHospitalLocation,
  hasValidCoordinates,
} from '../../lib/maps/googleMaps';
import { getFallbackMapStyle, getMapTilerStyle, hasMapTilerKey } from '../../lib/maps/mapTiler';

export default function HospitalLocationPanel({ hospital, fullAddress }) {
  const [useFallbackTiles, setUseFallbackTiles] = useState(false);
  const [mapError, setMapError] = useState(false);

  const hasResolvedLocation = hasResolvedHospitalLocation(hospital);
  const destination = useMemo(() => getHospitalMapDestination(hospital, fullAddress), [fullAddress, hospital]);

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const currentFallbackRef = useRef(false);

  const validCoords = hasValidCoordinates(hospital);
  const lat = validCoords ? Number(hospital.map.latitude) : null;
  const lng = validCoords ? Number(hospital.map.longitude) : null;
  const keyAvailable = hasMapTilerKey();

  const coordTrust = hospital?.map?.trust;
  const isVerifiedCoordinate = coordTrust?.status === 'verified';
  const isCandidateOverride = coordTrust?.origin === 'override';

  // Map is displayable as long as coordinates exist
  const canShowMap = validCoords;

  // Initialize or update MapLibre GL map
  useEffect(() => {
    if (!canShowMap || !mapContainer.current) return;

    if (!mapInstance.current) {
      try {
        const initialStyle = keyAvailable && !useFallbackTiles
          ? getMapTilerStyle('satellite')
          : getFallbackMapStyle('satellite');

        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: initialStyle,
          center: [lng, lat],
          zoom: 15.5,
          attributionControl: false,
        });

        currentFallbackRef.current = useFallbackTiles;

        // Add standard navigation controls (zoom in / zoom out)
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

        // Create custom MEDIMESH themed marker element
        const pinEl = document.createElement('div');
        pinEl.className = 'medimesh-map-pin-wrapper';
        pinEl.setAttribute('role', 'img');
        pinEl.setAttribute('aria-label', hospital?.name || 'Hospital location');
        pinEl.innerHTML = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #0A7A6A; border: 3px solid #ffffff; box-shadow: 0 4px 16px rgba(10, 122, 106, 0.45); cursor: pointer; transition: transform 0.2s ease;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12M6 12h12"/>
            </svg>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 26, closeButton: false })
          .setHTML(`
            <div style="padding: 8px 10px; font-family: ui-sans-serif, system-ui, sans-serif;">
              <p style="font-weight: 700; font-size: 14px; color: #171d1b; margin: 0; line-height: 1.3;">${hospital?.name || ''}</p>
              <p style="font-size: 12px; color: #62716c; margin: 4px 0 0;">${hospital?.location?.locality || hospital?.location?.city || ''}</p>
            </div>
          `);

        const marker = new maplibregl.Marker({ element: pinEl, anchor: 'center' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markerInstance.current = marker;
        mapInstance.current = map;

        // Force resize when map finishes initial load and whenever style loads
        map.once('load', () => {
          map.resize();
          requestAnimationFrame(() => map.resize());
          setTimeout(() => map.resize(), 200);
        });
        map.on('style.load', () => {
          map.resize();
          requestAnimationFrame(() => map.resize());
          setTimeout(() => map.resize(), 200);
        });

        // Graceful error recovery: if MapTiler fails with 401/403 or network error, switch to open tiles
        map.on('error', (e) => {
          const status = e?.error?.status;
          const message = String(e?.error?.message || e?.message || '');
          if (status === 401 || status === 403 || message.includes('Forbidden') || message.includes('Unauthorized') || message.includes('Key usage restricted')) {
            if (!useFallbackTiles) {
              console.warn('MapTiler key authorization restricted, switching to open fallback tiles:', message);
              setUseFallbackTiles(true);
              try {
                map.setStyle(getFallbackMapStyle('satellite'));
              } catch (fallbackErr) {
                console.error('Failed to apply fallback style:', fallbackErr);
                setMapError(true);
              }
            }
          }
        });
      } catch (err) {
        console.error('Failed to instantiate MapLibre map:', err);
        setMapError(true);
      }
    } else {
      // Map instance already exists
      const map = mapInstance.current;

      // Update center and marker if coordinates changed
      const center = map.getCenter();
      if (Math.abs(center.lng - lng) > 0.0001 || Math.abs(center.lat - lat) > 0.0001) {
        map.flyTo({ center: [lng, lat], zoom: 15.5 });
        if (markerInstance.current) {
          markerInstance.current.setLngLat([lng, lat]);
        }
      }

      // Update style if fallback mode changed
      if (currentFallbackRef.current !== useFallbackTiles) {
        currentFallbackRef.current = useFallbackTiles;
        const desiredStyle = keyAvailable && !useFallbackTiles
          ? getMapTilerStyle('satellite')
          : getFallbackMapStyle('satellite');
        try {
          map.setStyle(desiredStyle);
        } catch (styleErr) {
          console.error('Error updating map style:', styleErr);
        }
      }
    }
  }, [canShowMap, useFallbackTiles, keyAvailable, lat, lng, hospital?.name, hospital?.location?.locality, hospital?.location?.city]);

  // Automatic resize handling via ResizeObserver
  useEffect(() => {
    if (!mapContainer.current) return;

    const observer = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    });

    observer.observe(mapContainer.current);

    const handleWindowResize = () => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [canShowMap]);

  // Clean unmount to prevent memory leaks and WebGL context limits
  useEffect(() => {
    return () => {
      if (markerInstance.current) {
        markerInstance.current.remove();
        markerInstance.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <section aria-labelledby="location-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="pb-4 border-b border-border/60">
        <h2 id="location-heading" className="font-serif text-2xl font-bold text-foreground flex items-center gap-2.5">
          <MapPin className="h-6 w-6 text-primary" />
          Location & Directions
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {isVerifiedCoordinate
            ? 'Verified geographic placement and navigation coordinates'
            : validCoords
              ? 'Geographic placement and navigation coordinates (spatial verification pending)'
              : 'Facility address and directions'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Map column: 8 cols on desktop, height 380-440px */}
        <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-border/70 relative h-[380px] sm:h-[420px] lg:h-[440px] bg-[#e8eee9]">
          {canShowMap && !mapError && (
            <div ref={mapContainer} className="absolute inset-0 h-full w-full" style={{ width: '100%', height: '100%' }} />
          )}
          {(!canShowMap || mapError) && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="max-w-md">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-white text-primary shadow-sm">
                  <MapPin className="h-6 w-6" />
                </span>
                <h3 className="mt-3 font-serif text-base font-semibold text-foreground">
                  Coordinates not registered in published catalog
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  This hospital listing does not have geographic coordinates attached. Navigation and street mapping remain accessible using the published address directly via Google Maps.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Address and actions column: 4 cols on desktop */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-border/70 bg-[#fdfbf7] p-6 sm:p-7">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Published Facility Address
              </span>
              <p className="mt-2 text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                {fullAddress || 'Address not published in catalog'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{hospital?.location?.locality || hospital?.location?.city || 'Navi Mumbai'}</span>
              {hospital?.location?.pinCode && <span>• PIN {hospital.location.pinCode}</span>}
            </div>

            <div className={`rounded-xl border p-3.5 text-xs ${
              isVerifiedCoordinate
                ? 'border-primary/20 bg-primary/5 text-primary'
                : validCoords
                  ? 'border-amber-500/25 bg-amber-500/5 text-amber-900'
                  : 'border-border/70 bg-surface/60 text-muted-foreground'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {isVerifiedCoordinate ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                ) : validCoords ? (
                  <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                ) : (
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span>
                  {isVerifiedCoordinate
                    ? 'Verified Destination Pin'
                    : isCandidateOverride
                      ? 'Candidate Destination Pin (Unverified)'
                      : validCoords
                        ? 'Approximate Destination Pin (Unverified)'
                        : hasResolvedLocation
                          ? 'Place Destination Pin'
                          : 'Address Query Destination'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                {isVerifiedCoordinate
                  ? 'Direct destination route coordinates verified by official source evidence.'
                  : isCandidateOverride
                    ? 'Candidate coordinates applied from local review registry; pending on-site evidence verification.'
                    : validCoords
                      ? 'Coordinates derived from locality registry; precise facility entrance pending verification.'
                      : hasResolvedLocation
                        ? 'Place identifier registered for direct navigation lookup.'
                        : 'Directions query uses the published postal address in navigation.'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5 pt-4 border-t border-border/60">
            <Button
              as="a"
              href={buildGoogleMapsUrl('directions', destination)}
              target="_blank"
              rel="noreferrer"
              disabled={!destination.query}
              size="md"
              className="min-h-11 w-full justify-center gap-2 text-sm font-semibold shadow-sm"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
            <Button
              as="a"
              href={buildGoogleMapsUrl('search', destination)}
              target="_blank"
              rel="noreferrer"
              disabled={!destination.query}
              variant="outline"
              size="md"
              className="min-h-11 w-full justify-center gap-2 text-sm font-semibold border-border/80 bg-white hover:bg-surface"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
