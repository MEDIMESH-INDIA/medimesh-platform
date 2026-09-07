export const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;

export function hasMapTilerKey() {
  return Boolean(mapTilerKey);
}

export function getMapTilerStyle(type = 'roadmap') {
  if (type === 'satellite') return `https://api.maptiler.com/maps/satellite/style.json?key=${mapTilerKey}`;
  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
}
