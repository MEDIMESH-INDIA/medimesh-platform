import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  EVALUATION_STATUS,
  MATCH_DISPOSITION,
  CRITERION_MODE,
  evaluateCriterion,
  evaluateHospitalMatch,
  matchHospitals,
} from '../src/lib/careFinder/careFinderMatching.js';
import { normalizeHospital } from '../src/lib/data/hospitalRepository.js';

// Baseline fully specified hospital fixture
const BASELINE_HOSPITAL = {
  id: 'hosp-001',
  slug: 'apollo-hospital-navi-mumbai',
  name: 'Apollo Hospital Navi Mumbai',
  location: {
    addressLine1: 'Plot 13, Off Uran Road',
    locality: 'CBD Belapur',
    city: 'Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '400614',
  },
  type: 'multispeciality',
  specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Oncology'],
  facilities: ['Emergency Department', 'Intensive Care Unit', 'Blood Bank', 'Operation Theatre', 'Pharmacy'],
  services: ['Ambulance Services', 'Emergency Care', 'Inpatient Care', 'Diagnostic Services'],
  metrics: {
    emergency: true,
    ambulance: true,
    totalBeds: 500,
    icuBeds: 80,
  },
  provenance: {
    sourceType: 'government_open_data',
    sourceName: 'NMMC Hospital Registry',
    reviewStatus: 'manually_reviewed',
    checkedAt: '2026-09-01T00:00:00Z',
  },
  contact: {
    phone: '022-33044000',
    email: 'info@apollo.example',
    website: 'https://apollo.example',
  },
  map: {
    latitude: 19.0182,
    longitude: 73.0412,
    status: 'unverified',
    origin: 'database',
  },
  recordType: 'canonical',
};

// Fixture with sparse/missing data
const SPARSE_HOSPITAL = {
  id: 'hosp-002',
  slug: 'rural-community-clinic',
  name: 'Community Care Clinic',
  location: {
    locality: 'Vashi',
    city: 'Navi Mumbai',
  },
  type: null,
  specialties: [],
  facilities: [],
  services: [],
  metrics: {
    emergency: null,
    ambulance: null,
    totalBeds: null,
    icuBeds: null,
  },
  provenance: null,
  map: {
    latitude: null,
    longitude: null,
    status: 'missing',
    origin: 'none',
  },
  recordType: 'canonical',
};

test('1. evaluateCriterion: Validates individual criteria evaluation states', () => {
  // Specialty match
  const cardMatch = evaluateCriterion(BASELINE_HOSPITAL, {
    type: 'specialty',
    value: 'Cardiology',
    mode: CRITERION_MODE.MANDATORY,
  });
  assert.equal(cardMatch.status, EVALUATION_STATUS.MATCH);

  // Specialty does not match
  const dermMatch = evaluateCriterion(BASELINE_HOSPITAL, {
    type: 'specialty',
    value: 'Dermatology',
    mode: CRITERION_MODE.MANDATORY,
  });
  assert.equal(dermMatch.status, EVALUATION_STATUS.DOES_NOT_MATCH);

  // Specialty unknown when hospital specialties array is empty
  const sparseSpecialty = evaluateCriterion(SPARSE_HOSPITAL, {
    type: 'specialty',
    value: 'Cardiology',
    mode: CRITERION_MODE.MANDATORY,
  });
  assert.equal(sparseSpecialty.status, EVALUATION_STATUS.UNKNOWN);

  // City match
  const cityMatch = evaluateCriterion(BASELINE_HOSPITAL, {
    type: 'city',
    value: 'Navi Mumbai',
  });
  assert.equal(cityMatch.status, EVALUATION_STATUS.MATCH);

  // City does not match
  const cityMismatch = evaluateCriterion(BASELINE_HOSPITAL, {
    type: 'city',
    value: 'Pune',
  });
  assert.equal(cityMismatch.status, EVALUATION_STATUS.DOES_NOT_MATCH);

  // Emergency department match
  const emergMatch = evaluateCriterion(BASELINE_HOSPITAL, {
    type: 'emergency',
    value: true,
  });
  assert.equal(emergMatch.status, EVALUATION_STATUS.MATCH);

  // Emergency department unknown when sparse/null
  const emergUnknown = evaluateCriterion(SPARSE_HOSPITAL, {
    type: 'emergency',
    value: true,
  });
  assert.equal(emergUnknown.status, EVALUATION_STATUS.UNKNOWN);

  // Emergency department does not match when explicitly false
  const noEmergHospital = {
    ...BASELINE_HOSPITAL,
    facilities: [],
    services: [],
    metrics: { ...BASELINE_HOSPITAL.metrics, emergency: false },
  };
  const emergFalse = evaluateCriterion(noEmergHospital, {
    type: 'emergency',
    value: true,
  });
  assert.equal(emergFalse.status, EVALUATION_STATUS.DOES_NOT_MATCH);
});

test('2. Hospital satisfying every selected mandatory criterion is CONFIRMED', () => {
  const criteria = [
    { type: 'specialty', value: 'Cardiology', mode: CRITERION_MODE.MANDATORY },
    { type: 'city', value: 'Navi Mumbai', mode: CRITERION_MODE.MANDATORY },
    { type: 'emergency', value: true, mode: CRITERION_MODE.MANDATORY },
  ];

  const result = evaluateHospitalMatch(BASELINE_HOSPITAL, criteria);
  assert.equal(result.disposition, MATCH_DISPOSITION.CONFIRMED);
  assert.equal(result.matchedCriteriaCount, 3);
  assert.equal(result.unknownExplanations.length, 0);
  assert.equal(result.excludedExplanations.length, 0);
});

test('3. Hospital explicitly failing a mandatory criterion is EXCLUDED', () => {
  const criteria = [
    { type: 'specialty', value: 'Cardiology', mode: CRITERION_MODE.MANDATORY },
    { type: 'city', value: 'Mumbai Suburban', mode: CRITERION_MODE.MANDATORY }, // Mismatch
  ];

  const result = evaluateHospitalMatch(BASELINE_HOSPITAL, criteria);
  assert.equal(result.disposition, MATCH_DISPOSITION.EXCLUDED);
  assert.ok(result.excludedExplanations.some(e => e.includes('outside requested city')));
});

test('4. Hospital with unknown value for a mandatory criterion is UNCONFIRMED (not confirmed, not excluded)', () => {
  const criteria = [
    { type: 'city', value: 'Navi Mumbai', mode: CRITERION_MODE.MANDATORY },
    { type: 'emergency', value: true, mode: CRITERION_MODE.MANDATORY }, // Unknown in SPARSE_HOSPITAL
  ];

  const result = evaluateHospitalMatch(SPARSE_HOSPITAL, criteria);
  assert.equal(result.disposition, MATCH_DISPOSITION.UNCONFIRMED);
  assert.ok(result.unknownExplanations.some(e => e.includes('Emergency department availability has not been reported')));
});

test('5. Missing data is NEVER treated as a match', () => {
  const criteria = [
    { type: 'specialty', value: 'Cardiology', mode: CRITERION_MODE.PREFERENCE },
    { type: 'emergency', value: true, mode: CRITERION_MODE.PREFERENCE },
    { type: 'icu', value: true, mode: CRITERION_MODE.PREFERENCE },
  ];

  const result = evaluateHospitalMatch(SPARSE_HOSPITAL, criteria);
  // None of the sparse fields should match
  assert.equal(result.matchedPreferencesCount, 0);
  assert.equal(result.preferenceScore, 0);
  assert.equal(result.confirmedExplanations.length, 0);
  assert.equal(result.unknownExplanations.length, 3);
});

test('6. Missing data is NEVER silently interpreted as an explicit negative', () => {
  // If emergency is unknown, it should NOT produce a DOES_NOT_MATCH evaluation
  const evaluation = evaluateCriterion(SPARSE_HOSPITAL, {
    type: 'emergency',
    value: true,
    mode: CRITERION_MODE.MANDATORY,
  });

  assert.equal(evaluation.status, EVALUATION_STATUS.UNKNOWN);
  assert.notEqual(evaluation.status, EVALUATION_STATUS.DOES_NOT_MATCH);
  assert.ok(!evaluation.explanation.includes('unavailable'));
});

test('7. Empty criteria produces sensible documented baseline', () => {
  const result = evaluateHospitalMatch(BASELINE_HOSPITAL, []);
  assert.equal(result.disposition, MATCH_DISPOSITION.CONFIRMED);
  assert.equal(result.matchedCriteriaCount, 0);
  assert.equal(result.preferenceScore, 0);
});

test('8. Hospital name does not infer clinical specialties', () => {
  // Hospital named "Heart & Vascular Care Center" but with empty specialties list
  const heartNamedHospital = {
    ...SPARSE_HOSPITAL,
    name: 'Navi Mumbai Heart & Vascular Hospital',
    specialties: [],
  };

  const result = evaluateCriterion(heartNamedHospital, {
    type: 'specialty',
    value: 'Cardiology',
    mode: CRITERION_MODE.MANDATORY,
  });

  assert.equal(result.status, EVALUATION_STATUS.UNKNOWN);
  assert.notEqual(result.status, EVALUATION_STATUS.MATCH);
});

test('9. matchHospitals: Partitions and orders results deterministically', () => {
  const hospA = {
    ...BASELINE_HOSPITAL,
    id: 'hosp-a',
    name: 'Alpha Hospital',
    metrics: { emergency: true, ambulance: true, totalBeds: 200, icuBeds: 20 },
  };
  const hospB = {
    ...BASELINE_HOSPITAL,
    id: 'hosp-b',
    name: 'Beta Hospital',
    services: ['Emergency Care'],
    metrics: { emergency: true, ambulance: false, totalBeds: 100, icuBeds: 10 },
  };

  const criteria = [
    { type: 'specialty', value: 'Cardiology', mode: CRITERION_MODE.MANDATORY },
    { type: 'emergency', value: true, mode: CRITERION_MODE.PREFERENCE },
    { type: 'ambulance', value: true, mode: CRITERION_MODE.PREFERENCE },
  ];

  const { confirmedMatches, unconfirmedMatches, excludedCount } = matchHospitals([hospB, hospA], criteria);

  assert.equal(confirmedMatches.length, 2);
  assert.equal(unconfirmedMatches.length, 0);
  assert.equal(excludedCount, 0);

  // hospA matches 2 preferences (emergency + ambulance), hospB matches 1 (emergency)
  // hospA must be ordered first
  assert.equal(confirmedMatches[0].hospital.name, 'Alpha Hospital');
  assert.equal(confirmedMatches[0].matchedPreferencesCount, 2);
  assert.equal(confirmedMatches[1].hospital.name, 'Beta Hospital');
  assert.equal(confirmedMatches[1].matchedPreferencesCount, 1);
});

test('10. Unverified coordinates cannot produce distance ranking in Care Finder', () => {
  // Both hospitals have unverified coordinates in database
  const hospFar = {
    ...BASELINE_HOSPITAL,
    id: 'hosp-far',
    name: 'Far Hospital',
    map: { latitude: 19.5, longitude: 73.5, status: 'unverified' },
  };
  const hospNear = {
    ...BASELINE_HOSPITAL,
    id: 'hosp-near',
    name: 'Near Hospital',
    map: { latitude: 19.01, longitude: 73.04, status: 'unverified' },
  };

  const { confirmedMatches } = matchHospitals([hospFar, hospNear], []);

  // Ordering is strictly alphabetical by name (Far before Near), NOT distance-ranked
  assert.equal(confirmedMatches[0].hospital.name, 'Far Hospital');
  assert.equal(confirmedMatches[1].hospital.name, 'Near Hospital');
});

test('11. Canonical hospital normalizer compatibility', () => {
  const rawDbRecord = {
    id: 'raw-123',
    slug: 'nmmc-general-hospital-vashi',
    name: 'NMMC General Hospital Vashi',
    hospital_type: 'general_hospital',
    locality: 'Sector 10A, Vashi',
    city: 'Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    emergency_department: true,
    ambulance_available: true,
    total_beds: 300,
    icu_beds: 35,
    hospital_specialties: [
      { specialties: { name: 'General Medicine' } },
      { specialties: { name: 'Pediatrics' } },
    ],
    hospital_facilities: [
      { facilities: { name: 'Emergency Department' } },
      { facilities: { name: 'Intensive Care Unit' } },
    ],
    hospital_services_catalog: [],
    hospital_evidence: [
      {
        review_status: 'manually_reviewed',
        checked_at: '2026-09-01T00:00:00Z',
        data_sources: { name: 'NMMC Portal', source_type: 'government_open_data' },
      },
    ],
  };

  const normalized = normalizeHospital(rawDbRecord, 'canonical');
  assert.equal(normalized.name, 'NMMC General Hospital Vashi');
  assert.deepEqual(normalized.specialties, ['General Medicine', 'Pediatrics']);
  assert.deepEqual(normalized.facilities, ['Emergency Department', 'Intensive Care Unit']);
  assert.equal(normalized.metrics.emergency, true);
  assert.equal(normalized.provenance.reviewStatus, 'manually_reviewed');

  // Evaluate normalized hospital through Care Finder matching
  const match = evaluateHospitalMatch(normalized, [
    { type: 'specialty', value: 'Pediatrics', mode: CRITERION_MODE.MANDATORY },
    { type: 'emergency', value: true, mode: CRITERION_MODE.MANDATORY },
  ]);
  assert.equal(match.disposition, MATCH_DISPOSITION.CONFIRMED);
});

test('12. Privacy check: Care Finder does not access or expose booking/patient fields', () => {
  const matchResult = evaluateHospitalMatch(BASELINE_HOSPITAL, [
    { type: 'city', value: 'Navi Mumbai', mode: CRITERION_MODE.MANDATORY },
  ]);

  // Ensure no patient notes, booking references, or home visit booking IDs exist
  const resultJson = JSON.stringify(matchResult);
  assert.ok(!resultJson.includes('patient_note'));
  assert.ok(!resultJson.includes('booking_reference'));
  assert.ok(!resultJson.includes('patient_id'));
});

test('13. UI integration: Care Finder route and navbar links exist in codebase', () => {
  const appPath = path.resolve(process.cwd(), 'src/App.jsx');
  const navPath = path.resolve(process.cwd(), 'src/components/layout/Navbar.jsx');
  const shellPath = path.resolve(process.cwd(), 'src/components/layout/AppShell.jsx');

  const appCode = fs.readFileSync(appPath, 'utf8');
  assert.ok(appCode.includes('path="/care-finder"'), 'App.jsx must declare public /care-finder route');
  assert.ok(appCode.includes('path="/app/care-finder"'), 'App.jsx must declare authenticated /app/care-finder route');

  const navCode = fs.readFileSync(navPath, 'utf8');
  assert.ok(navCode.includes('/care-finder'), 'Navbar must link to /care-finder');

  const shellCode = fs.readFileSync(shellPath, 'utf8');
  assert.ok(shellCode.includes('/app/care-finder'), 'AppShell must link to /app/care-finder');
});

test('14. Phase E.1 Comparison integration: Shareable comparison links remain functional and max 3 limit is enforced', async () => {
  const { parseComparisonSlugs, serializeComparisonSlugs, buildShareableComparisonUrl } = await import('../src/lib/compare/shareableComparison.js');

  const slugs = ['apollo-hospital-navi-mumbai', 'nmmc-general-hospital-vashi'];
  const serialized = serializeComparisonSlugs(slugs);
  assert.equal(serialized, 'apollo-hospital-navi-mumbai,nmmc-general-hospital-vashi');

  const parsed = parseComparisonSlugs(serialized);
  assert.deepEqual(parsed, slugs);

  // Exceeding 3 items is clamped to 3
  const fourSlugs = ['hosp-1', 'hosp-2', 'hosp-3', 'hosp-4'];
  const clamped = parseComparisonSlugs(fourSlugs);
  assert.equal(clamped.length, 3);
  assert.deepEqual(clamped, ['hosp-1', 'hosp-2', 'hosp-3']);

  // URL builder preserves existing query params while setting compare
  const currentUrl = new URL('https://medimesh.in/compare?q=cardiology&city=Navi+Mumbai');
  const shareable = buildShareableComparisonUrl(currentUrl, slugs);
  assert.ok(shareable.includes('compare=apollo-hospital-navi-mumbai%2Cnmmc-general-hospital-vashi'));
  assert.ok(shareable.includes('city=Navi+Mumbai'));
});
