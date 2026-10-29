import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  evaluateHospitalParamRank,
  COMPARISON_RANKS,
  RANK_THEMES,
  isMissingValue,
} from '../src/lib/compare/comparisonRanking.js';

const projectRoot = process.cwd();

test('1. Capacity metrics: Highest is best, middle is orange, lowest is red', () => {
  const row = { label: 'Total beds', get: (h) => h.beds };
  const hospitals = [
    { id: '1', beds: 200 },
    { id: '2', beds: 150 },
    { id: '3', beds: 80 },
  ];

  const rank1 = evaluateHospitalParamRank(row, hospitals, 0);
  const rank2 = evaluateHospitalParamRank(row, hospitals, 1);
  const rank3 = evaluateHospitalParamRank(row, hospitals, 2);

  assert.equal(rank1.rank, COMPARISON_RANKS.BEST, '200 beds should be best (light green)');
  assert.equal(rank1.indicator, 'Highest capacity');
  assert.equal(rank2.rank, COMPARISON_RANKS.MIDDLE, '150 beds should be middle (light orange)');
  assert.equal(rank2.indicator, 'Intermediate');
  assert.equal(rank3.rank, COMPARISON_RANKS.WORST, '80 beds should be worst (light red)');
  assert.equal(rank3.indicator, 'Lowest capacity');
});

test('2. Capacity metrics: Equal values receive equal ranking colors', () => {
  const row = { label: 'Total beds', get: (h) => h.beds };
  const hospitals = [
    { id: '1', beds: 150 },
    { id: '2', beds: 150 },
    { id: '3', beds: 80 },
  ];

  const rank1 = evaluateHospitalParamRank(row, hospitals, 0);
  const rank2 = evaluateHospitalParamRank(row, hospitals, 1);
  const rank3 = evaluateHospitalParamRank(row, hospitals, 2);

  assert.equal(rank1.rank, COMPARISON_RANKS.BEST, 'Equal top beds should both receive best');
  assert.equal(rank2.rank, COMPARISON_RANKS.BEST, 'Equal top beds should both receive best');
  assert.equal(rank3.rank, COMPARISON_RANKS.WORST, 'Lower bed count receives worst');
});

test('3. Missing data is NEVER treated as worst possible value (stays neutral)', () => {
  const row = { label: 'ICU beds', get: (h) => h.icuBeds };
  const hospitals = [
    { id: '1', icuBeds: 20 },
    { id: '2', icuBeds: 'Unknown' },
    { id: '3', icuBeds: 10 },
  ];

  const rank1 = evaluateHospitalParamRank(row, hospitals, 0);
  const rank2 = evaluateHospitalParamRank(row, hospitals, 1);
  const rank3 = evaluateHospitalParamRank(row, hospitals, 2);

  assert.equal(rank1.rank, COMPARISON_RANKS.BEST, '20 is highest ICU beds');
  assert.equal(rank2.rank, COMPARISON_RANKS.NEUTRAL, 'Missing data is neutral, not worst');
  assert.equal(rank2.indicator, null);
  assert.equal(rank3.rank, COMPARISON_RANKS.WORST, '10 is lowest known ICU beds');
});

test('4. Availability metrics: Available is best, Unavailable is worst, Unknown is neutral', () => {
  const row = { label: 'Emergency department', get: (h) => h.emergency };
  const hospitals = [
    { id: '1', emergency: 'Available' },
    { id: '2', emergency: 'Unavailable' },
    { id: '3', emergency: 'Unknown' },
  ];

  const rank1 = evaluateHospitalParamRank(row, hospitals, 0);
  const rank2 = evaluateHospitalParamRank(row, hospitals, 1);
  const rank3 = evaluateHospitalParamRank(row, hospitals, 2);

  assert.equal(rank1.rank, COMPARISON_RANKS.BEST);
  assert.equal(rank2.rank, COMPARISON_RANKS.WORST);
  assert.equal(rank3.rank, COMPARISON_RANKS.NEUTRAL);
});

test('5. Distance ranking: Lower distance is more favorable (nearest = best)', () => {
  const row = { label: 'Distance from user', get: (h) => h.distance };
  const hospitals = [
    { id: '1', distance: '2.4 km' },
    { id: '2', distance: '5.1 km' },
    { id: '3', distance: '12.8 km' },
  ];

  const rank1 = evaluateHospitalParamRank(row, hospitals, 0);
  const rank2 = evaluateHospitalParamRank(row, hospitals, 1);
  const rank3 = evaluateHospitalParamRank(row, hospitals, 2);

  assert.equal(rank1.rank, COMPARISON_RANKS.BEST, 'Nearest hospital should be best (light green)');
  assert.equal(rank1.indicator, 'Nearest');
  assert.equal(rank2.rank, COMPARISON_RANKS.MIDDLE, 'Intermediate distance should be middle (light orange)');
  assert.equal(rank2.indicator, 'Intermediate');
  assert.equal(rank3.rank, COMPARISON_RANKS.WORST, 'Farthest hospital should be worst (light red)');
  assert.equal(rank3.indicator, 'Farthest');
});

test('6. Qualitative parameters without objective order are displayed neutrally', () => {
  const row = { label: 'Specialties', get: (h) => h.specialties };
  const hospitals = [
    { id: '1', specialties: 'Cardiology, Neurology' },
    { id: '2', specialties: 'Pediatrics' },
    { id: '3', specialties: 'Not listed' },
  ];

  const rank1 = evaluateHospitalParamRank(row, hospitals, 0);
  const rank2 = evaluateHospitalParamRank(row, hospitals, 1);
  const rank3 = evaluateHospitalParamRank(row, hospitals, 2);

  assert.equal(rank1.rank, COMPARISON_RANKS.NEUTRAL);
  assert.equal(rank2.rank, COMPARISON_RANKS.NEUTRAL);
  assert.equal(rank3.rank, COMPARISON_RANKS.NEUTRAL);
});

test('7. Two-hospital comparison works properly', () => {
  const row = { label: 'Total beds', get: (h) => h.beds };
  const hospitals = [
    { id: '1', beds: 300 },
    { id: '2', beds: 100 },
  ];

  const rank1 = evaluateHospitalParamRank(row, hospitals, 0);
  const rank2 = evaluateHospitalParamRank(row, hospitals, 1);

  assert.equal(rank1.rank, COMPARISON_RANKS.BEST);
  assert.equal(rank2.rank, COMPARISON_RANKS.WORST);
});

test('8. isMissingValue correctly identifies unconfirmed and empty states', () => {
  assert.equal(isMissingValue(null), true);
  assert.equal(isMissingValue(undefined), true);
  assert.equal(isMissingValue(''), true);
  assert.equal(isMissingValue('Unknown'), true);
  assert.equal(isMissingValue('Not provided'), true);
  assert.equal(isMissingValue('Not listed'), true);
  assert.equal(isMissingValue('Not confirmed'), true);
  assert.equal(isMissingValue(0), false);
  assert.equal(isMissingValue('Available'), false);
});

test('9. Color system adheres to restrained light-tinted specification', () => {
  assert.match(RANK_THEMES.best.bg, /DDF3E4/);
  assert.match(RANK_THEMES.best.border, /A7DDB8/);
  assert.match(RANK_THEMES.best.text, /134E4A/);

  assert.match(RANK_THEMES.middle.bg, /FFF0D6/);
  assert.match(RANK_THEMES.middle.border, /F0D29B/);
  assert.match(RANK_THEMES.middle.text, /78350F/);

  assert.match(RANK_THEMES.worst.bg, /FBE3E1/);
  assert.match(RANK_THEMES.worst.border, /E9B5B1/);
  assert.match(RANK_THEMES.worst.text, /991B1B/);

  assert.match(RANK_THEMES.neutral.bg, /FAF9F5/);
});

test('10. Static Verification: Compare.jsx scopes mobile and protects desktop', () => {
  const comparePath = path.join(projectRoot, 'src/pages/App/Compare.jsx');
  const code = fs.readFileSync(comparePath, 'utf8');

  // Mobile container must be scoped with block md:hidden
  assert.match(code, /className=["'][^"']*block md:hidden/);

  // Desktop container must be scoped with hidden md:block
  assert.match(code, /className=["'][^"']*hidden md:block/);

  // Mobile layout contains sketch-specified heading, clear beneath control, and selected hospitals
  assert.match(code, /<h1[^>]*>[\s\n]*Comparison[\s\n]*<\/h1>/);
  assert.match(code, /Selected Hospitals/);
  assert.match(code, /isSelectedCollapsed/);

  // Mobile matrix implements vertical scroll with sticky headers and parameter-first rows
  assert.match(code, /evaluateHospitalParamRank/);
  assert.match(code, /sticky top-16/);

  // Desktop table is preserved in full
  assert.match(code, /<table/);
  assert.match(code, /<thead/);
  assert.match(code, /<tbody/);
  assert.match(code, /<Group/);
});

test('11. Static Verification: AppShell header provides clean bottom border divider on mobile', () => {
  const appShellPath = path.join(projectRoot, 'src/components/layout/AppShell.jsx');
  const code = fs.readFileSync(appShellPath, 'utf8');

  assert.match(code, /<header[^>]*border-b border-border\/70[^>]*md:hidden/);
  assert.match(code, /<MedimeshLogo/);
  assert.match(code, /mobileMenuOpen/);
});

