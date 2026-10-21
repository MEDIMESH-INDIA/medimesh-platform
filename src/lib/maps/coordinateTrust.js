/**
 * MEDIMESH Hospital Coordinate Trust & Provenance Contract
 * 
 * Defines the contract and evaluation rules for hospital geospatial coordinates,
 * ensuring unverified coordinates are never treated as verified facts or used
 * for distance ranking without explicit, reviewed location evidence.
 */

export const COORDINATE_TRUST_STATUS = {
  VERIFIED: 'verified',     // Precise facility location supported by reviewed evidence
  UNVERIFIED: 'unverified', // Coordinates exist, but precise facility placement is not verified
  MISSING: 'missing',       // Complete latitude/longitude pair is unavailable
  INVALID: 'invalid',       // Coordinates are outside valid geographic ranges or unusable
};

export const COORDINATE_ORIGIN = {
  OVERRIDE: 'override',     // Candidate coordinate override from frontend registry
  DATABASE: 'database',     // Coordinate pair loaded from public.hospitals
  NONE: 'none',             // No coordinates provided
};

const EXPLICIT_LOCATION_SCOPES = new Set([
  'coordinates',
  'coordinate',
  'location',
  'latitude',
  'longitude',
  'geospatial_location',
  'geolocation',
  'map_pin',
  'entrance_coordinates',
]);

const REVIEWED_STATUSES = new Set([
  'manually_reviewed',
  'source_matched',
]);

/**
 * Validates whether latitude and longitude are numbers within realistic geographic bounds.
 * Latitude must be within [-90, 90] and Longitude within [-180, 180].
 * Null Island (0, 0) is classified as invalid.
 */
export function validateCoordinates(latitude, longitude) {
  if (
    latitude === null ||
    latitude === undefined ||
    latitude === '' ||
    longitude === null ||
    longitude === undefined ||
    longitude === ''
  ) {
    return { status: COORDINATE_TRUST_STATUS.MISSING, isValid: false, reason: 'missing_field' };
  }

  const numLat = Number(latitude);
  const numLng = Number(longitude);

  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) {
    return { status: COORDINATE_TRUST_STATUS.INVALID, isValid: false, reason: 'non_finite_number' };
  }

  if (numLat === 0 && numLng === 0) {
    return { status: COORDINATE_TRUST_STATUS.INVALID, isValid: false, reason: 'zero_zero_coordinates' };
  }

  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
    return { status: COORDINATE_TRUST_STATUS.INVALID, isValid: false, reason: 'out_of_range_bounds' };
  }

  return { status: 'valid', isValid: true, latitude: numLat, longitude: numLng };
}

/**
 * Inspects hospital evidence records to find reviewed evidence explicitly supporting coordinates.
 * Rule: General hospital verification, publication status, or unsupported scopes do NOT qualify.
 */
export function findExplicitCoordinateEvidence(evidenceRows = []) {
  if (!Array.isArray(evidenceRows)) return null;

  for (const row of evidenceRows) {
    if (!row) continue;
    const reviewStatus = String(row.review_status || '').toLowerCase();
    if (!REVIEWED_STATUSES.has(reviewStatus)) continue;

    const scopes = Array.isArray(row.supported_scope)
      ? row.supported_scope
      : typeof row.supported_scope === 'string'
        ? [row.supported_scope]
        : [];

    const hasLocationScope = scopes.some(scope => {
      if (typeof scope !== 'string') return false;
      const normalized = scope.trim().toLowerCase().replace(/[\s_-]+/g, '_');
      return EXPLICIT_LOCATION_SCOPES.has(normalized);
    });

    if (hasLocationScope) {
      return row;
    }
  }

  return null;
}

/**
 * Evaluates the coordinate trust metadata for a given coordinate pair, origin, and evidence set.
 * 
 * Strict Invariants:
 * 1. A non-null coordinate pair is not proof of verification.
 * 2. General data_status ('verified') does not establish coordinate verification.
 * 3. Candidate overrides or code comments are NOT verification evidence.
 * 4. Publication status ('published') does not imply coordinate verification.
 * 5. Coordinates are eligible for distance ranking ONLY when status is 'verified'.
 */
export function evaluateCoordinateTrust({
  latitude,
  longitude,
  origin = COORDINATE_ORIGIN.NONE,
  evidenceRows = [],
} = {}) {
  const validation = validateCoordinates(latitude, longitude);

  if (!validation.isValid) {
    return {
      status: validation.status,
      origin: origin || COORDINATE_ORIGIN.NONE,
      hasExplicitEvidence: false,
      isEligibleForDistanceRanking: false,
      validationReason: validation.reason,
      evidence: null,
    };
  }

  const explicitEvidence = findExplicitCoordinateEvidence(evidenceRows);
  const isVerified = Boolean(explicitEvidence);

  return {
    status: isVerified ? COORDINATE_TRUST_STATUS.VERIFIED : COORDINATE_TRUST_STATUS.UNVERIFIED,
    origin: origin || COORDINATE_ORIGIN.NONE,
    hasExplicitEvidence: isVerified,
    isEligibleForDistanceRanking: isVerified,
    validationReason: null,
    evidence: explicitEvidence ? {
      sourceName: explicitEvidence.data_sources?.name || null,
      sourceType: explicitEvidence.data_sources?.source_type || null,
      reviewStatus: explicitEvidence.review_status || null,
      checkedAt: explicitEvidence.checked_at || null,
    } : null,
  };
}

/**
 * Safe guard preventing unverified coordinates from being used as ground truth
 * in nearest-first distance calculations or spatial ranking.
 */
export function isEligibleForDistanceRanking(hospitalOrMap) {
  if (!hospitalOrMap) return false;
  const trust = hospitalOrMap?.map?.trust || hospitalOrMap?.trust || hospitalOrMap;
  return trust?.isEligibleForDistanceRanking === true && trust?.status === COORDINATE_TRUST_STATUS.VERIFIED;
}

