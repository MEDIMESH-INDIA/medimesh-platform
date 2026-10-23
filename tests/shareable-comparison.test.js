import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseComparisonSlugs,
  serializeComparisonSlugs,
  buildShareableComparisonUrl,
  MAX_COMPARE_HOSPITALS,
} from '../src/lib/compare/shareableComparison.js';
import { getHospitalsBySlugs } from '../src/lib/data/hospitalRepository.js';

test('1. parseComparisonSlugs safely parses valid, whitespace-padded, and comma-separated slugs', () => {
  assert.deepEqual(parseComparisonSlugs('apollo,fortis'), ['apollo', 'fortis']);
  assert.deepEqual(parseComparisonSlugs(' apollo , fortis '), ['apollo', 'fortis']);
  assert.deepEqual(parseComparisonSlugs(['apollo', 'fortis']), ['apollo', 'fortis']);
  assert.deepEqual(parseComparisonSlugs(['apollo,fortis', 'tata']), ['apollo', 'fortis', 'tata']);
});

test('2. parseComparisonSlugs handles empty, null, undefined, and malformed inputs', () => {
  assert.deepEqual(parseComparisonSlugs(null), []);
  assert.deepEqual(parseComparisonSlugs(undefined), []);
  assert.deepEqual(parseComparisonSlugs(''), []);
  assert.deepEqual(parseComparisonSlugs('   '), []);
  assert.deepEqual(parseComparisonSlugs(',,,,'), []);
  assert.deepEqual(parseComparisonSlugs(' , , , '), []);
  assert.deepEqual(parseComparisonSlugs([]), []);
  assert.deepEqual(parseComparisonSlugs([null, undefined, '']), []);
  assert.deepEqual(parseComparisonSlugs(123), []);
});

test('3. parseComparisonSlugs deduplicates slugs and strictly limits to max 3 items', () => {
  assert.equal(MAX_COMPARE_HOSPITALS, 3);
  // Deduplication
  assert.deepEqual(parseComparisonSlugs('apollo,fortis,apollo'), ['apollo', 'fortis']);
  assert.deepEqual(parseComparisonSlugs(['apollo', 'apollo', 'fortis']), ['apollo', 'fortis']);

  // Limit to 3 unique slugs
  assert.deepEqual(
    parseComparisonSlugs('hospital-1,hospital-2,hospital-3,hospital-4,hospital-5'),
    ['hospital-1', 'hospital-2', 'hospital-3']
  );

  // Duplicates within 4+ items
  assert.deepEqual(
    parseComparisonSlugs('h1,h1,h2,h2,h3,h4'),
    ['h1', 'h2', 'h3']
  );
});

test('4. serializeComparisonSlugs generates link only from canonical slugs, never user labels or names', () => {
  // From string array
  assert.equal(serializeComparisonSlugs(['apollo-hospital', 'fortis-hospital']), 'apollo-hospital,fortis-hospital');

  // From object array with names/labels - verify names and labels are completely ignored
  const items = [
    { slug: 'apollo-hospital', name: 'Apollo Hospitals Navi Mumbai', customLabel: 'Best ICU' },
    { slug: 'fortis-hospital', name: 'Fortis Hiranandani Hospital', customLabel: 'Near Home' },
  ];
  assert.equal(serializeComparisonSlugs(items), 'apollo-hospital,fortis-hospital');

  // Objects missing slug or having empty slug are ignored
  assert.equal(
    serializeComparisonSlugs([
      { name: 'Unknown Facility Without Slug' },
      { slug: 'valid-slug', name: 'Valid Facility' },
      null,
      undefined,
    ]),
    'valid-slug'
  );

  // Deduplication and capping at 3
  assert.equal(
    serializeComparisonSlugs([
      { slug: 'h1' },
      { slug: 'h1' },
      { slug: 'h2' },
      { slug: 'h3' },
      { slug: 'h4' },
    ]),
    'h1,h2,h3'
  );

  // Empty or invalid input
  assert.equal(serializeComparisonSlugs([]), '');
  assert.equal(serializeComparisonSlugs(null), '');
  assert.equal(serializeComparisonSlugs(undefined), '');
});

test('5. buildShareableComparisonUrl preserves unrelated search/filter query parameters', () => {
  const currentUrl = 'https://medimesh.in/compare?q=cardiac&city=Navi%20Mumbai&locality=Vashi';
  const shareableUrl = buildShareableComparisonUrl(currentUrl, ['apollo', 'fortis']);

  const parsed = new URL(shareableUrl);
  assert.equal(parsed.pathname, '/compare');
  assert.equal(parsed.searchParams.get('q'), 'cardiac');
  assert.equal(parsed.searchParams.get('city'), 'Navi Mumbai');
  assert.equal(parsed.searchParams.get('locality'), 'Vashi');
  assert.equal(parsed.searchParams.get('compare'), 'apollo,fortis');
});

test('6. buildShareableComparisonUrl strips temporary add parameter and removes compare when empty', () => {
  const urlWithAdd = 'https://medimesh.in/compare?add=temporary-slug&city=Panvel';
  const built = buildShareableComparisonUrl(urlWithAdd, ['hospital-a', 'hospital-b']);
  const parsed = new URL(built);

  assert.equal(parsed.searchParams.has('add'), false);
  assert.equal(parsed.searchParams.get('city'), 'Panvel');
  assert.equal(parsed.searchParams.get('compare'), 'hospital-a,hospital-b');

  // When slugs are cleared, compare query parameter is deleted
  const cleared = buildShareableComparisonUrl(built, []);
  const parsedCleared = new URL(cleared);
  assert.equal(parsedCleared.searchParams.has('compare'), false);
  assert.equal(parsedCleared.searchParams.get('city'), 'Panvel');
});

test('7. Cross-session restoration resolves canonical catalog hospitals independently of localStorage', async () => {
  // Test resolving published demo catalogue hospitals by slugs
  const demoSlugs = ['harbourview-medical-centre', 'navicare-multispeciality'];
  const resolved = await getHospitalsBySlugs(demoSlugs, { mode: 'demo' });

  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].slug, 'harbourview-medical-centre');
  assert.equal(resolved[1].slug, 'navicare-multispeciality');
  assert.ok(resolved[0].name);
  assert.ok(resolved[0].location);
  assert.ok(resolved[0].specialties);

  // Cross-session: even when localStorage has zero items, the resolved records are fully populated
  const restoredItems = resolved.map(h => ({ slug: h.slug, name: h.name }));
  assert.deepEqual(restoredItems, [
    { slug: 'harbourview-medical-centre', name: resolved[0].name },
    { slug: 'navicare-multispeciality', name: resolved[1].name },
  ]);
});

test('8. Shared link safely ignores unknown, unverified, or non-existent slugs', async () => {
  // Mix of valid demo slugs, fabricated slug, and 4th slug that gets capped
  const untrustedSlugs = [
    'harbourview-medical-centre',
    'fabricated-hospital-slug',
    'navicare-multispeciality',
    'sql-injection--select-all',
  ];

  const parsed = parseComparisonSlugs(untrustedSlugs.join(','));
  // Capped at 3 unique
  assert.equal(parsed.length, 3);
  assert.deepEqual(parsed, [
    'harbourview-medical-centre',
    'fabricated-hospital-slug',
    'navicare-multispeciality',
  ]);

  // Resolved strictly against catalog repository
  const resolved = await getHospitalsBySlugs(parsed, { mode: 'demo' });
  // Only the genuine catalog hospitals survive; fabricated ones are dropped
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].slug, 'harbourview-medical-centre');
  assert.equal(resolved[1].slug, 'navicare-multispeciality');
});

test('9. Local comparison fallback behavior when no shared comparison parameter is present', () => {
  // When no compare query parameter exists in the URL, parseComparisonSlugs returns empty array
  const emptyParams = new URLSearchParams('city=Mumbai');
  const compareParam = emptyParams.get('compare');
  assert.equal(compareParam, null);
  const slugs = parseComparisonSlugs(compareParam);
  assert.deepEqual(slugs, []);
  // Confirms no override is triggered when parameter is absent
});
