function isValidCoordinate(val) {
  return val !== null && val !== undefined && val !== '' && Number.isFinite(Number(val));
}

export function hasValidCoordinates(hospital) {
  const lat = hospital?.map?.latitude;
  const lng = hospital?.map?.longitude;
  if (!isValidCoordinate(lat) || !isValidCoordinate(lng)) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  return !(numLat === 0 && numLng === 0);
}

export function hasResolvedHospitalLocation(hospital) {
  return Boolean(hospital?.map?.placeId || hasValidCoordinates(hospital));
}

export function getHospitalMapDestination(hospital, fullAddress) {
  if (hospital?.map?.placeId) return { query: fullAddress || hospital?.name || '', placeId: hospital.map.placeId };
  if (hasValidCoordinates(hospital)) {
    const lat = Number(hospital.map.latitude);
    const lng = Number(hospital.map.longitude);
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
