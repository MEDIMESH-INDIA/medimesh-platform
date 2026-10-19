export const mapTilerKey =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_MAPTILER_API_KEY
    : globalThis.process?.env?.VITE_MAPTILER_API_KEY;

export function hasMapTilerKey() {
  return Boolean(mapTilerKey) && mapTilerKey !== 'your_maptiler_api_key_here';
}

export function getMapTilerStyle(type = 'roadmap') {
  if (type === 'satellite') return `https://api.maptiler.com/maps/satellite/style.json?key=${mapTilerKey}`;
  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
}

export function getFallbackMapStyle(type = 'roadmap') {
  if (type === 'satellite') {
    return {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri',
        },
      },
      layers: [
        {
          id: 'esri-satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }

  return {
    version: 8,
    sources: {
      'esri-street': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri',
      },
    },
    layers: [
      {
        id: 'esri-street-layer',
        type: 'raster',
        source: 'esri-street',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}
