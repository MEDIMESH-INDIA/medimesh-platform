import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeHospital, normalizeDemoHospital } from '../src/lib/data/hospitalRepository.js';
import {
  COORDINATE_TRUST_STATUS,
  COORDINATE_ORIGIN,
  validateCoordinates,
  evaluateCoordinateTrust,
  isEligibleForDistanceRanking,
} from '../src/lib/maps/coordinateTrust.js';
import { hasValidCoordinates, getHospitalMapDestination } from '../src/lib/maps/googleMaps.js';

test('1. Missing latitude or longitude yields status missing and ineligible for distance ranking', () => {
  // Direct validateCoordinates unit test
  assert.equal(validateCoordinates(null, null).status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(validateCoordinates(19.0682, null).status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(validateCoordinates(null, 72.9965).status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(validateCoordinates('', '').status, COORDINATE_TRUST_STATUS.MISSING);

  // Both null
  const nullCoords = evaluateCoordinateTrust({ latitude: null, longitude: null, origin: COORDINATE_ORIGIN.NONE });
  assert.equal(nullCoords.status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(nullCoords.isEligibleForDistanceRanking, false);

  // Missing longitude only
  const missingLng = evaluateCoordinateTrust({ latitude: 19.0682, longitude: null, origin: COORDINATE_ORIGIN.DATABASE });
  assert.equal(missingLng.status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(missingLng.origin, COORDINATE_ORIGIN.DATABASE);
  assert.equal(missingLng.isEligibleForDistanceRanking, false);

  // Missing latitude only
  const missingLat = evaluateCoordinateTrust({ latitude: undefined, longitude: 72.9965, origin: COORDINATE_ORIGIN.DATABASE });
  assert.equal(missingLat.status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(missingLat.isEligibleForDistanceRanking, false);

  // Empty string
  const emptyStr = evaluateCoordinateTrust({ latitude: '', longitude: '72.9965', origin: COORDINATE_ORIGIN.DATABASE });
  assert.equal(emptyStr.status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(emptyStr.isEligibleForDistanceRanking, false);

  // Normalized hospital representation
  const normalized = normalizeHospital({
    id: 'sindhudurg-rural-1',
    slug: 'rural-hospital-devgad',
    latitude: null,
    longitude: null,
  });
  assert.equal(normalized.map.status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(normalized.map.trust.isEligibleForDistanceRanking, false);
  assert.equal(isEligibleForDistanceRanking(normalized), false);
});

test('2. Invalid coordinates are detected (out of bounds, non-numeric, Null Island 0,0)', () => {
  // Out of range latitude (> 90 or < -90)
  const outOfRangeLat = evaluateCoordinateTrust({ latitude: 95.123, longitude: 72.9965 });
  assert.equal(outOfRangeLat.status, COORDINATE_TRUST_STATUS.INVALID);
  assert.equal(outOfRangeLat.isEligibleForDistanceRanking, false);

  const negOutOfRangeLat = evaluateCoordinateTrust({ latitude: -91.0, longitude: 72.9965 });
  assert.equal(negOutOfRangeLat.status, COORDINATE_TRUST_STATUS.INVALID);

  // Out of range longitude (> 180 or < -180)
  const outOfRangeLng = evaluateCoordinateTrust({ latitude: 19.0682, longitude: 185.0 });
  assert.equal(outOfRangeLng.status, COORDINATE_TRUST_STATUS.INVALID);

  // Non-numeric string / NaN
  const nonNumeric = evaluateCoordinateTrust({ latitude: 'invalid_lat', longitude: '72.9965' });
  assert.equal(nonNumeric.status, COORDINATE_TRUST_STATUS.INVALID);

  // Null Island (0, 0)
  const zeroZero = evaluateCoordinateTrust({ latitude: 0, longitude: 0 });
  assert.equal(zeroZero.status, COORDINATE_TRUST_STATUS.INVALID);
  assert.equal(zeroZero.isEligibleForDistanceRanking, false);

  // googleMaps hasValidCoordinates integration
  assert.equal(hasValidCoordinates({ map: { latitude: 95.0, longitude: 72.0 } }), false);
  assert.equal(hasValidCoordinates({ map: { latitude: 0, longitude: 0 } }), false);
  assert.equal(hasValidCoordinates({ map: { latitude: 19.0682, longitude: 72.9965 } }), true);
});

test('3. Valid-range database coordinates without coordinate evidence are classified as unverified', () => {
  // Standard Navi Mumbai database record without explicit coordinate evidence
  const record = {
    id: 'db-hospital-1',
    slug: 'fortis-hiranandani-hospital',
    name: 'Fortis Hiranandani Hospital',
    latitude: 19.0682,
    longitude: 72.9965,
    hospital_evidence: [
      {
        review_status: 'source_matched',
        supported_scope: ['bed capacity', 'public phone', 'hospital classification'],
        data_sources: { name: 'NMMC Hospital Directory', source_type: 'government_open_data' },
      },
    ],
  };

  const normalized = normalizeHospital(record);
  assert.equal(normalized.map.status, COORDINATE_TRUST_STATUS.UNVERIFIED);
  assert.equal(normalized.map.origin, COORDINATE_ORIGIN.DATABASE);
  assert.equal(normalized.map.trust.hasExplicitEvidence, false);
  assert.equal(normalized.map.trust.isEligibleForDistanceRanking, false);
  assert.equal(isEligibleForDistanceRanking(normalized), false);
});

test('4. Frontend override coordinates without verification evidence are tagged override and unverified', () => {
  // Life Line Hospital has a candidate override correcting 13.8km Sanpada displacement
  const record = {
    id: '06ceccf9-f578-4ac7-aabe-d3ee7e26ce6e',
    slug: 'life-line-hospital-medical-research-centre',
    name: 'Life Line Hospital & Medical Research Centre',
    latitude: 19.0675788,
    longitude: 73.0123031,
    hospital_evidence: [
      {
        review_status: 'source_matched',
        supported_scope: ['hospital classification', 'public phone'],
        data_sources: { name: 'Maharashtra Police Panel List', source_type: 'government_open_data' },
      },
    ],
  };

  const normalized = normalizeHospital(record);
  assert.equal(normalized.map.latitude, 18.991176);
  assert.equal(normalized.map.longitude, 73.115263);
  assert.equal(normalized.map.origin, COORDINATE_ORIGIN.OVERRIDE);
  assert.equal(normalized.map.status, COORDINATE_TRUST_STATUS.UNVERIFIED);
  assert.equal(normalized.map.trust.hasExplicitEvidence, false);
  assert.equal(normalized.map.trust.isEligibleForDistanceRanking, false);
  assert.equal(isEligibleForDistanceRanking(normalized), false);
});

test('5. Explicitly supported coordinates with reviewed evidence are classified as verified', () => {
  const record = {
    id: 'vetted-facility-1',
    slug: 'vetted-facility',
    name: 'Vetted Medical Institute',
    latitude: 19.0314,
    longitude: 73.0161,
    hospital_evidence: [
      {
        review_status: 'manually_reviewed',
        supported_scope: ['coordinates', 'address', 'bed capacity'],
        checked_at: '2026-10-22T00:00:00Z',
        data_sources: { name: 'Official Surveyor Audit 2026', source_type: 'government_open_data' },
      },
    ],
  };

  const normalized = normalizeHospital(record);
  assert.equal(normalized.map.status, COORDINATE_TRUST_STATUS.VERIFIED);
  assert.equal(normalized.map.trust.hasExplicitEvidence, true);
  assert.equal(normalized.map.trust.isEligibleForDistanceRanking, true);
  assert.equal(isEligibleForDistanceRanking(normalized), true);
  assert.equal(normalized.map.trust.evidence.sourceName, 'Official Surveyor Audit 2026');
});

test('6. Current map and hospital detail behavior is strictly preserved', () => {
  const hospital = normalizeHospital({
    id: '8776103e-7c97-4c8a-93c3-89218d30e2ee',
    slug: 'medicover-hospital',
    name: 'Medicover Hospital',
    latitude: 19.0435,
    longitude: 73.0569,
  });

  // Coordinates are preserved
  assert.equal(hospital.map.latitude, 19.0435);
  assert.equal(hospital.map.longitude, 73.0569);

  // Destination resolver works
  const destination = getHospitalMapDestination(hospital, 'Sector 38, Kharghar');
  assert.deepEqual(destination, { query: '19.0435,73.0569', placeId: null });

  // Demo hospital normalization preserves contract
  const demo = normalizeDemoHospital({ name: 'Demo Clinic', location: 'Navi Mumbai' });
  assert.equal(demo.map.status, COORDINATE_TRUST_STATUS.MISSING);
  assert.equal(demo.map.trust.isEligibleForDistanceRanking, false);
});

test('7. Publication status and data_status cannot implicitly verify coordinates', () => {
  // A hospital marked published and data_status verified with no coordinate evidence
  const record = {
    id: 'published-hosp-1',
    slug: 'published-hospital',
    name: 'Published Hospital',
    publication_status: 'published',
    data_status: 'verified',
    latitude: 19.0559,
    longitude: 73.0182,
    hospital_evidence: [
      {
        review_status: 'source_matched',
        supported_scope: ['hospital classification', 'locality', 'public phone'],
        data_sources: { name: 'State Gazette 2024', source_type: 'government_open_data' },
      },
    ],
  };

  const normalized = normalizeHospital(record);

  // Even though data_status is 'verified' and publication_status is 'published',
  // coordinate trust status MUST be 'unverified' and ineligible for distance ranking!
  assert.equal(normalized.map.status, COORDINATE_TRUST_STATUS.UNVERIFIED);
  assert.equal(normalized.map.trust.isEligibleForDistanceRanking, false);
  assert.equal(isEligibleForDistanceRanking(normalized), false);
});
