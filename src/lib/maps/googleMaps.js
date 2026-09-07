export function hasResolvedHospitalLocation(hospital) {
  const lat = Number(hospital?.map?.latitude);
  const lng = Number(hospital?.map?.longitude);
  return Boolean(hospital?.map?.placeId || (Number.isFinite(lat) && Number.isFinite(lng)));
}

export function getHospitalMapDestination(hospital, fullAddress) {
  const lat = Number(hospital?.map?.latitude);
  const lng = Number(hospital?.map?.longitude);

  if (hospital?.map?.placeId) return { query: fullAddress || hospital.name, placeId: hospital.map.placeId };
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { query: `${lat},${lng}`, placeId: null };
  }
  return { query: fullAddress || hospital?.name || '', placeId: null };
}

export function buildGoogleMapsUrl(type, destination) {
  if (!destination?.query) return null;
  const params = new URLSearchParams({ api: '1' });
  if (type === 'directions') {
    params.set('destination', destination.query);
    if (destination.placeId) params.set('destination_place_id', destination.placeId);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }
  params.set('query', destination.query);
  if (destination.placeId) params.set('query_place_id', destination.placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
