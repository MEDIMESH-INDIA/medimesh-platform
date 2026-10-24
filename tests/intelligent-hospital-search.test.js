import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeText,
  stripPunctuation,
  compactText,
  extractTokens,
  scoreHospitalMatch,
} from '../src/lib/data/searchMatcher.js';
import { getHospitalSuggestions, searchHospitals } from '../src/lib/data/hospitalRepository.js';

test('1. Normalization & Tokenization handles punctuation and abbreviations', () => {
  assert.equal(compactText('D.Y. Patil Hospital'), 'dypatilhospital');
  assert.equal(compactText('Dr. Mahajan\'s Hospital & Trauma Care'), 'drmahajanshospitaltraumacare');
  assert.equal(stripPunctuation('D.Y. Patil'), 'd y patil');

  const dyTokens = extractTokens('D.Y. Patil Hospital');
  assert.ok(dyTokens.includes('dy'), 'Includes collapsed abbreviation dy');
  assert.ok(dyTokens.includes('patil'), 'Includes patil');
  assert.ok(dyTokens.includes('d'), 'Includes d');
  assert.ok(dyTokens.includes('y'), 'Includes y');
});

test('2. scoreHospitalMatch matches D.Y. Patil for "dy", "dy patil", "d.y.", "patil dy"', () => {
  const dyHospital = {
    id: '6eb3c35b-2052-471a-9045-d5d98ee6131e',
    name: 'D.Y. Patil Hospital',
    locality: 'Nerul',
    city: 'Navi Mumbai',
    district: 'Thane',
    specialties: ['General Medicine', 'Cardiology'],
  };

  const queries = ['dy', 'dy patil', 'd.y.', 'd y patil', 'patil dy', 'D. Y. Patil', 'nerul dy patil'];
  for (const q of queries) {
    const res = scoreHospitalMatch(dyHospital, q);
    assert.equal(res.matches, true, `Query "${q}" should match D.Y. Patil Hospital`);
    assert.ok(res.score >= 70, `Query "${q}" score should be >= 70, got ${res.score}`);
    assert.ok(res.matchReason, `Query "${q}" should produce a matchReason`);
  }
});

test('3. scoreHospitalMatch matches typos, spelling variations, and doctors', () => {
  const ashtvinayak = {
    name: 'Ashtvinayak Hospitals Private Limited',
    locality: 'New Panvel',
    city: 'Navi Mumbai',
  };
  // Spelling variation "ashtavinayak" with an extra 'a'
  const resAsht = scoreHospitalMatch(ashtvinayak, 'ashtavinayak');
  assert.equal(resAsht.matches, true, 'ashtavinayak variation should match Ashtvinayak');

  const mahajan = {
    name: 'Dr. Mahajan\'s Hospital & Industrial Trauma Care',
    locality: 'Rabale',
    city: 'Navi Mumbai',
  };
  const resDr = scoreHospitalMatch(mahajan, 'dr mahajan');
  assert.equal(resDr.matches, true);
  const resMahajanOnly = scoreHospitalMatch(mahajan, 'mahajan');
  assert.equal(resMahajanOnly.matches, true);
});

test('4. getHospitalSuggestions in demo mode matches by keyword and location', async () => {
  const suggestions = await getHospitalSuggestions({
    query: 'navicare',
    mode: 'demo',
  });
  assert.ok(Array.isArray(suggestions));
  assert.ok(suggestions.length > 0, 'Should return at least one suggestion');
  assert.equal(suggestions[0].name, 'NaviCare Multispeciality Hospital');
  assert.equal(suggestions[0].matchReason, 'Hospital name match');
});

test('5. searchHospitals in demo mode returns matching hospitals for multi-word search', async () => {
  const result = await searchHospitals({
    mode: 'demo',
    filters: { q: 'seabreeze children' },
  });
  assert.ok(result.hospitals.length > 0);
  assert.equal(result.hospitals[0].name, 'Seabreeze Children\'s Hospital');
  assert.equal(result.totalCount, 1);
});

test('6. scoreHospitalMatch matches halfway typing with accidental spelling mistakes', () => {
  const dyHospital = {
    name: 'D.Y. Patil Hospital',
    locality: 'Nerul',
    city: 'Navi Mumbai',
  };

  const halfwayDyVariants = ['dy pate', 'dy pait', 'dy patl', 'dy ptil', 'dypate', 'pate dy'];
  for (const q of halfwayDyVariants) {
    const res = scoreHospitalMatch(dyHospital, q);
    assert.equal(res.matches, true, `Halfway typo query "${q}" should match D.Y. Patil Hospital`);
    assert.ok(res.score >= 70, `Score for "${q}" should be >= 70, got ${res.score}`);
  }

  const mahajan = {
    name: 'Dr. Mahajan\'s Hospital & Industrial Trauma Care',
    locality: 'Rabale',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(mahajan, 'mahaj').matches, true);
  assert.equal(scoreHospitalMatch(mahajan, 'mahjn').matches, true);

  const asht = {
    name: 'Ashtvinayak Hospitals Private Limited',
    locality: 'New Panvel',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(asht, 'ashtt').matches, true);
  assert.equal(scoreHospitalMatch(asht, 'ashtvi').matches, true);

  const sterling = {
    name: 'Sterling Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(sterling, 'sterl').matches, true);
  assert.equal(scoreHospitalMatch(sterling, 'strlin').matches, true);
});

