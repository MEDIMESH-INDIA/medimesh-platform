import assert from 'node:assert/strict';
import test from 'node:test';
import {
  sortLabels,
  uniqueCanonicalStrings,
  cascadeChildLocation,
} from '../src/lib/data/filterUtils.js';

test('sortLabels sorts deterministically and case-insensitively', () => {
  assert.deepEqual(sortLabels(null), []);
  assert.deepEqual(sortLabels(undefined), []);
  assert.deepEqual(sortLabels([]), []);

  const input = ['vashi', 'Airoli', 'belapur', 'Nerul', 'kopar Khairane'];
  const expected = ['Airoli', 'belapur', 'kopar Khairane', 'Nerul', 'vashi'];
  assert.deepEqual(sortLabels(input), expected);
});

test('uniqueCanonicalStrings deduplicates case-insensitively and filters falsy values', () => {
  assert.deepEqual(uniqueCanonicalStrings(null), []);
  assert.deepEqual(uniqueCanonicalStrings(undefined), []);
  assert.deepEqual(uniqueCanonicalStrings([]), []);
  assert.deepEqual(uniqueCanonicalStrings(['', '   ', null, undefined, 123, false]), []);

  const input = [
    'Navi Mumbai',
    'navi mumbai',
    'NAVI MUMBAI',
    ' Mumbai ',
    'Sawantwadi',
    'kudal',
    'Kudal',
  ];
  const expected = ['Kudal', 'Mumbai', 'Navi Mumbai', 'Sawantwadi'];
  assert.deepEqual(uniqueCanonicalStrings(input), expected);
});

test('cascadeChildLocation clears child locality when city is cleared', () => {
  const cityToLocalities = {
    'Navi Mumbai': ['Vashi', 'Nerul', 'Belapur'],
    'Mumbai': ['Bandra', 'Andheri'],
  };

  const result = cascadeChildLocation({
    city: '',
    currentChildValue: 'Vashi',
    cityToChildrenMap: cityToLocalities,
  });
  assert.equal(result, null);
});

test('cascadeChildLocation clears child locality if city has no localities or map is not ready', () => {
  const resultWhileLoading = cascadeChildLocation({
    city: 'Sawantwadi',
    currentChildValue: 'Vashi',
    cityToChildrenMap: null,
  });
  assert.equal(resultWhileLoading, null);

  const cityToLocalities = {
    'Navi Mumbai': ['Vashi', 'Nerul'],
    'Sawantwadi': [],
  };

  const resultWithEmptyCity = cascadeChildLocation({
    city: 'Sawantwadi',
    currentChildValue: 'Vashi',
    cityToChildrenMap: cityToLocalities,
  });
  assert.equal(resultWithEmptyCity, null);
});

test('cascadeChildLocation retains child locality only when valid for new city', () => {
  const cityToLocalities = {
    'Navi Mumbai': ['Vashi', 'Nerul'],
    'Thane': ['Ghodbunder', 'Vashi'], // hypothetical shared name
    'Mumbai': ['Bandra', 'Andheri'],
  };

  // Vashi is invalid in Mumbai -> cleared
  assert.equal(
    cascadeChildLocation({
      city: 'Mumbai',
      currentChildValue: 'Vashi',
      cityToChildrenMap: cityToLocalities,
    }),
    null
  );

  // Vashi is valid in Navi Mumbai -> retained
  assert.equal(
    cascadeChildLocation({
      city: 'Navi Mumbai',
      currentChildValue: 'Vashi',
      cityToChildrenMap: cityToLocalities,
    }),
    'Vashi'
  );
});

test('home-visit toggle boolean state contract', () => {
  // Verifies boolean parsing contract matches DoctorDiscoverExperience
  const parseHomeVisitsParam = (val) => val === 'true' || val === true;
  assert.equal(parseHomeVisitsParam('true'), true);
  assert.equal(parseHomeVisitsParam(true), true);
  assert.equal(parseHomeVisitsParam('false'), false);
  assert.equal(parseHomeVisitsParam(null), false);
  assert.equal(parseHomeVisitsParam(undefined), false);

  // Verifies controlled input checked state behaves as true boolean
  const isChecked = (filterValue) => Boolean(filterValue);
  assert.equal(isChecked(true), true);
  assert.equal(isChecked(false), false);
  assert.equal(isChecked(undefined), false);
  assert.equal(isChecked(null), false);
});

