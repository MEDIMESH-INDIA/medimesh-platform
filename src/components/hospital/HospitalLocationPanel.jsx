import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Map, MapPin, Navigation, Satellite } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Button from '../common/Button';
import { buildGoogleMapsUrl, getHospitalMapDestination, hasResolvedHospitalLocation } from '../../lib/maps/googleMaps';
import { getMapTilerStyle, hasMapTilerKey } from '../../lib/maps/mapTiler';

export default function HospitalLocationPanel({ hospital, fullAddress }) {
  const [mapType, setMapType] = useState('roadmap');
  const hasResolvedLocation = hasResolvedHospitalLocation(hospital);
  const destination = useMemo(() => getHospitalMapDestination(hospital, fullAddress), [fullAddress, hospital]);

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const mapErrorState = useState(false);
  const mapError = mapErrorState[0];
  const setMapError = mapErrorState[1];

  const lat = Number(hospital?.map?.latitude);
  const lng = Number(hospital?.map?.longitude);

  const canShowMap = hasResolvedLocation && hasMapTilerKey() && Number.isFinite(lat) && Number.isFinite(lng);

  useEffect(() => {
    if (!canShowMap || !mapContainer.current) return;

    if (!mapInstance.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: getMapTilerStyle(mapType),
        center: [lng, lat],
        zoom: 15.5,
        attributionControl: false
      });

      map.on('error', (e) => {
        if (e && e.error && e.error.message) {
          console.error('Map load error:', e.error.message);
          setMapError(true);
        }
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      markerInstance.current = new maplibregl.Marker({ color: '#0F2823' })
        .setLngLat([lng, lat])
        .addTo(map);

      mapInstance.current = map;
    } else {
      mapInstance.current.setStyle(getMapTilerStyle(mapType));
    }
  }, [canShowMap, mapType, lat, lng, setMapError]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <section aria-labelledby="location-heading">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Getting there</p><h2 id="location-heading" className="mt-2 flex items-center gap-2 font-serif text-2xl font-semibold text-foreground"><MapPin className="h-5 w-5 text-primary" />Location and directions</h2></div>
        <div className="inline-flex w-fit rounded-full border border-border bg-white/75 p-1" aria-label="Map style">
          <button type="button" onClick={() => setMapType('roadmap')} aria-pressed={mapType === 'roadmap'} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${mapType === 'roadmap' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}><Map className="h-3.5 w-3.5" />Map</button>
          <button type="button" onClick={() => setMapType('satellite')} aria-pressed={mapType === 'satellite'} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${mapType === 'satellite' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}><Satellite className="h-3.5 w-3.5" />Satellite</button>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-[22px] border border-border/80 bg-white/75 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.65fr)]">
        <div className="relative min-h-[320px] bg-[#e8eee9] sm:min-h-[390px]">
          {canShowMap && !mapError && (
            <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
          )}
          {(!canShowMap || mapError) && (
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/15 bg-white/80 text-primary shadow-sm">
                  <MapPin className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                  {mapError ? "We couldn't load the map" : hasResolvedLocation ? 'Map preview is not configured' : 'Map location is not available for this hospital yet'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {mapError ? "There was a network or configuration error while loading the interactive map." : hasResolvedLocation && !hasMapTilerKey()
                    ? 'Add the MapTiler API key to show the interactive map. Directions can still open in Google Maps.'
                    : 'MEDIMESH has an address for this profile, but no source-backed map identifier or coordinates. No pin is shown until the location is resolved.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Published address</p>
          <p className="mt-2 text-sm font-medium leading-6 text-foreground">{fullAddress || 'Address not provided'}</p>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{hasResolvedLocation ? 'The map destination is linked to a retained place identifier or stored coordinates.' : 'Directions use the published address as a search query and may require you to confirm the destination in Google Maps.'}</p>
          <div className="mt-auto grid gap-3 pt-7">
            <Button as="a" href={buildGoogleMapsUrl('directions', destination)} target="_blank" rel="noreferrer" disabled={!destination.query} className="w-full gap-2"><Navigation className="h-4 w-4" />Directions</Button>
            <Button as="a" href={buildGoogleMapsUrl('search', destination)} target="_blank" rel="noreferrer" disabled={!destination.query} variant="secondary" className="w-full gap-2"><ExternalLink className="h-4 w-4" />Open in Google Maps</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
