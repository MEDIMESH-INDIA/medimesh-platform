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
  assert.equal(normalizeText('MGM Hospital'), 'mgm hospital');
  assert.equal(normalizeText('D.Y. Patil'), 'd.y. patil');
  assert.equal(compactText('D.Y. Patil Hospital'), 'dypatilhospital');
  assert.equal(compactText('Dr. Mahajan\'s Hospital & Trauma Care'), 'drmahajanshospitaltraumacare');
  assert.equal(stripPunctuation('D.Y. Patil'), 'd y patil');

  const dyTokens = extractTokens('D.Y. Patil Hospital');
  assert.ok(dyTokens.includes('dy'), 'Includes collapsed abbreviation dy');
  assert.ok(dyTokens.includes('patil'), 'Includes patil');
  assert.ok(dyTokens.includes('d'), 'Includes d');
  assert.ok(dyTokens.includes('y'), 'Includes y');
});

test('2. MGM, mgm, and Mgm: return identical matches without false-matching location tokens', () => {
  const mgmBelapur = {
    id: 'mgm-1',
    name: 'MGM Hospital Belapur',
    locality: 'CBD Belapur',
    city: 'Navi Mumbai',
    district: 'Thane',
  };
  const mgmVashi = {
    id: 'mgm-2',
    name: 'MGM Hospital Vashi',
    locality: 'Vashi',
    city: 'Navi Mumbai',
    district: 'Thane',
  };
  const dyPatil = {
    id: 'dy-1',
    name: 'D.Y. Patil Hospital',
    locality: 'Nerul',
    city: 'Navi Mumbai',
    district: 'Thane',
  };
  const fortis = {
    id: 'fortis-1',
    name: 'Fortis Hiranandani Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
    district: 'Thane',
  };

  const queries = ['MGM', 'mgm', 'Mgm'];
  for (const q of queries) {
    const resBelapur = scoreHospitalMatch(mgmBelapur, q);
    const resVashi = scoreHospitalMatch(mgmVashi, q);
    const resDy = scoreHospitalMatch(dyPatil, q);
    const resFortis = scoreHospitalMatch(fortis, q);

    assert.equal(resBelapur.matches, true, `"${q}" must match MGM Belapur`);
    assert.equal(resVashi.matches, true, `"${q}" must match MGM Vashi`);
    assert.equal(resBelapur.score, resVashi.score, 'MGM variations should have consistent scoring');
    assert.equal(resBelapur.matchReason, 'Hospital name match');

    // Crucial: Must NEVER match unrelated hospitals just because they are in "Navi Mumbai"
    assert.equal(resDy.matches, false, `"${q}" must NOT match D.Y. Patil Hospital`);
    assert.equal(resFortis.matches, false, `"${q}" must NOT match Fortis Hospital`);
  }
});

test('3. Partial input such as MG: matches MGM hospitals and not unrelated hospitals', () => {
  const mgmHospital = {
    name: 'MGM Hospital Belapur',
    locality: 'CBD Belapur',
    city: 'Navi Mumbai',
  };
  const dyHospital = {
    name: 'D.Y. Patil Hospital',
    locality: 'Nerul',
    city: 'Navi Mumbai',
  };
  const sterling = {
    name: 'Sterling Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };

  const resMgm = scoreHospitalMatch(mgmHospital, 'MG');
  assert.equal(resMgm.matches, true, '"MG" should match MGM Hospital');
  assert.ok(resMgm.score >= 120, 'Partial prefix match on name should have high confidence');

  const resDy = scoreHospitalMatch(dyHospital, 'MG');
  assert.equal(resDy.matches, false, '"MG" should NOT match D.Y. Patil Hospital');

  const resSterling = scoreHospitalMatch(sterling, 'MG');
  assert.equal(resSterling.matches, false, '"MG" should NOT match Sterling Hospital');
});

test('4. Abbreviations and punctuation in hospital names', () => {
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

  const mahajan = {
    name: 'Dr. Mahajan\'s Hospital & Industrial Trauma Care',
    locality: 'Rabale',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(mahajan, 'dr mahajan').matches, true);
  assert.equal(scoreHospitalMatch(mahajan, 'mahajan').matches, true);
  assert.equal(scoreHospitalMatch(mahajan, 'dr.').matches, true);

  const rnPatil = {
    name: 'Dr. R.N. Patil\'s Suraj Hospital',
    locality: 'Sanpada',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(rnPatil, 'rn').matches, true);
  assert.equal(scoreHospitalMatch(rnPatil, 'r.n.').matches, true);
  assert.equal(scoreHospitalMatch(rnPatil, 'suraj').matches, true);
});

test('5. Reasonable typos and halfway typing tolerance', () => {
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

  const asht = {
    name: 'Ashtvinayak Hospitals Private Limited',
    locality: 'New Panvel',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(asht, 'ashtavinayak').matches, true);
  assert.equal(scoreHospitalMatch(asht, 'ashtt').matches, true);
  assert.equal(scoreHospitalMatch(asht, 'ashtvi').matches, true);

  const mahajan = {
    name: 'Dr. Mahajan\'s Hospital & Industrial Trauma Care',
    locality: 'Rabale',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(mahajan, 'mahaj').matches, true);
  assert.equal(scoreHospitalMatch(mahajan, 'mahjn').matches, true);

  const sterling = {
    name: 'Sterling Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(sterling, 'sterl').matches, true);
  assert.equal(scoreHospitalMatch(sterling, 'strlin').matches, true);
  assert.equal(scoreHospitalMatch(sterling, 'sterlin').matches, true);
});

test('6. Empty, whitespace-only, and punctuation-only query handling', async () => {
  const hospital = {
    name: 'Sterling Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };

  const invalidQueries = ['', '   ', '   \t  \n ', '%%%', '???', '---', '!@#$%^&*()'];
  for (const q of invalidQueries) {
    const res = scoreHospitalMatch(hospital, q);
    assert.equal(res.matches, false, `Query "${q}" must return matches: false`);
    assert.equal(res.score, 0, `Query "${q}" must return score: 0`);
  }

  // searchHospitals with punctuation-only query must NEVER match every hospital
  const punctResult = await searchHospitals({
    mode: 'demo',
    filters: { q: '%%%' },
  });
  assert.equal(punctResult.hospitals.length, 0, 'Punctuation-only query must return 0 results');
  assert.equal(punctResult.totalCount, 0);

  // searchHospitals with whitespace-only or empty query safely returns default catalog
  const emptyResult = await searchHospitals({
    mode: 'demo',
    filters: { q: '   ' },
  });
  assert.ok(emptyResult.hospitals.length > 0, 'Empty/whitespace search should return baseline list');
  assert.equal(emptyResult.totalCount, 12);

  // getHospitalSuggestions with %%% returns empty array
  const punctSuggestions = await getHospitalSuggestions({
    query: '%%%',
    mode: 'demo',
  });
  assert.equal(punctSuggestions.length, 0, 'Autocomplete with %%% should return 0 suggestions');
});

test('7. Exact matches rank above fuzzy and partial matches', () => {
  const exact = {
    name: 'Fortis Hiranandani Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };
  const partial = {
    name: 'Fortis Clinic',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };

  const resExact = scoreHospitalMatch(exact, 'Fortis Hiranandani Hospital');
  const resPrefix = scoreHospitalMatch(exact, 'Fortis');
  const resFuzzy = scoreHospitalMatch(exact, 'Forts'); // 1-letter typo

  assert.ok(resExact.score > resPrefix.score, 'Exact full name match must score higher than prefix match');
  assert.ok(resPrefix.score > resFuzzy.score, 'Exact prefix match must score higher than fuzzy typo match');
  assert.ok(resFuzzy.score >= 60, 'Fuzzy typo should still match with moderate confidence');

  const resPartial = scoreHospitalMatch(partial, 'Fortis Hiranandani Hospital');
  assert.ok(resExact.score > resPartial.score, 'Full exact match must rank above partial token overlap');
});

test('8. Unrelated hospitals are NOT returned for hospital-name typos', () => {
  const sindhudurg = {
    name: 'District Civil Hospital Sindhudurg',
    locality: 'Oras',
    city: 'Sindhudurg',
  };
  const fortis = {
    name: 'Fortis Hiranandani Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };

  // Typo "Forts" (for Fortis) must match Fortis, but must NOT match Sindhudurg (whose locality Oras previously collided)
  const resFortis = scoreHospitalMatch(fortis, 'Forts');
  const resSindhudurg = scoreHospitalMatch(sindhudurg, 'Forts');
  assert.equal(resFortis.matches, true, '"Forts" should match Fortis Hospital');
  assert.equal(resSindhudurg.matches, false, '"Forts" must NOT match District Civil Hospital Sindhudurg');

  // Typo "sterlin" (for Sterling) must match Sterling, not Ashtvinayak or D.Y. Patil
  const sterling = {
    name: 'Sterling Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
  };
  const asht = {
    name: 'Ashtvinayak Hospitals Private Limited',
    locality: 'New Panvel',
    city: 'Navi Mumbai',
  };
  assert.equal(scoreHospitalMatch(sterling, 'sterlin').matches, true);
  assert.equal(scoreHospitalMatch(asht, 'sterlin').matches, false);
});

test('9. Existing location and specialty searches continue to work accurately', () => {
  const vashiHospital = {
    name: 'Sterling Hospital',
    locality: 'Vashi',
    city: 'Navi Mumbai',
    specialties: ['Cardiology', 'Orthopedics'],
  };
  const panvelHospital = {
    name: 'Ashtvinayak Hospitals Private Limited',
    locality: 'New Panvel',
    city: 'Navi Mumbai',
    specialties: ['General Medicine'],
  };

  // Location search: Vashi
  const resVashi1 = scoreHospitalMatch(vashiHospital, 'Vashi');
  const resVashi2 = scoreHospitalMatch(panvelHospital, 'Vashi');
  assert.equal(resVashi1.matches, true, 'Sterling Hospital should match Vashi');
  assert.equal(resVashi1.matchedField, 'location');
  assert.equal(resVashi2.matches, false, 'Panvel Hospital must NOT match Vashi');

  // Specialty search: Cardiology
  const resCardio1 = scoreHospitalMatch(vashiHospital, 'Cardiology');
  const resCardio2 = scoreHospitalMatch(panvelHospital, 'Cardiology');
  assert.equal(resCardio1.matches, true, 'Hospital with Cardiology should match');
  assert.equal(resCardio1.matchedField, 'specialty');
  assert.equal(resCardio2.matches, false, 'Hospital without Cardiology must not match');

  // Short specialty prefix: Cardio
  const resCardioPrefix = scoreHospitalMatch(vashiHospital, 'Cardio');
  assert.equal(resCardioPrefix.matches, true, '"Cardio" should match Cardiology specialty');

  // Cross-field multi-token: "vashi cardiology"
  const resCross = scoreHospitalMatch(vashiHospital, 'vashi cardiology');
  assert.equal(resCross.matches, true);
  assert.ok(resCross.score >= 80);
});

test('10. Demo mode repository search & autocomplete integration', async () => {
  const suggestions = await getHospitalSuggestions({
    query: 'navicare',
    mode: 'demo',
  });
  assert.ok(Array.isArray(suggestions));
  assert.ok(suggestions.length > 0, 'Should return at least one suggestion');
  assert.equal(suggestions[0].name, 'NaviCare Multispeciality Hospital');
  assert.equal(suggestions[0].matchReason, 'Hospital name match');

  const multiWordResult = await searchHospitals({
    mode: 'demo',
    filters: { q: 'seabreeze children' },
  });
  assert.ok(multiWordResult.hospitals.length > 0);
  assert.equal(multiWordResult.hospitals[0].name, 'Seabreeze Children\'s Hospital');
  assert.equal(multiWordResult.totalCount, 1);
});
