import assert from 'node:assert/strict';
import process from 'node:process';
import test from 'node:test';
import {
  parseComparisonSlugs,
  serializeComparisonSlugs,
  buildShareableComparisonUrl,
  MAX_COMPARE_HOSPITALS,
} from '../src/lib/compare/shareableComparison.js';
import { getHospitalsBySlugs, invalidateHospitalSlugsCache } from '../src/lib/data/hospitalRepository.js';
import { supabase } from '../src/lib/supabase/client.js';

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

test('10. evaluateHospitalParamRank safely handles malformed hospital records without throwing', async () => {
  const { evaluateHospitalParamRank, COMPARISON_RANKS } = await import('../src/lib/compare/comparisonRanking.js');

  const row = {
    label: 'Location',
    get: (h) => [h?.location?.locality, h?.location?.city].filter(Boolean).join(', ') || 'Unknown',
  };

  const malformedHospitals = [
    { id: 'h1', name: 'Incomplete Hospital 1', location: null },
    { id: 'h2', name: 'Incomplete Hospital 2', location: undefined },
    { id: 'h3', name: 'Throwing Hospital', location: { get locality() { throw new Error('getter error'); } } },
  ];

  // Must not throw even if getters access missing properties or throw internally
  assert.doesNotThrow(() => {
    const res1 = evaluateHospitalParamRank(row, malformedHospitals, 0);
    assert.equal(res1.rank, COMPARISON_RANKS.NEUTRAL);
    const res2 = evaluateHospitalParamRank(row, malformedHospitals, 1);
    assert.equal(res2.rank, COMPARISON_RANKS.NEUTRAL);
    const res3 = evaluateHospitalParamRank(row, malformedHospitals, 2);
    assert.equal(res3.rank, COMPARISON_RANKS.NEUTRAL);
  });
});

test('11. getHospitalsBySlugs deduplicates concurrent identical queries', async () => {
  const slugs = ['harbourview-medical-centre', 'navicare-multispeciality'];
  const [resA, resB] = await Promise.all([
    getHospitalsBySlugs(slugs, { mode: 'demo' }),
    getHospitalsBySlugs(slugs, { mode: 'demo' }),
  ]);

  assert.equal(resA.length, 2);
  assert.equal(resB.length, 2);
  assert.deepEqual(resA.map(h => h.slug), resB.map(h => h.slug));
});

test('12. getHospitalsBySlugs preserves caller-specific ordering during concurrent in-flight requests', async () => {
  const origFrom = supabase.from;
  try {
    invalidateHospitalSlugsCache();
    let resolveQuery;
    const queryHoldPromise = new Promise(resolve => { resolveQuery = resolve; });

    supabase.from = () => ({
      select: () => ({
        in: () => ({
          eq: async () => {
            await queryHoldPromise;
            return {
              data: [
                { id: '1', slug: 'hospital-alpha', name: 'Hospital Alpha', publication_status: 'published' },
                { id: '2', slug: 'hospital-beta', name: 'Hospital Beta', publication_status: 'published' },
              ],
              error: null,
            };
          },
        }),
      }),
    });

    const call1Promise = getHospitalsBySlugs(['hospital-alpha', 'hospital-beta'], { mode: 'canonical' });
    const call2Promise = getHospitalsBySlugs(['hospital-beta', 'hospital-alpha'], { mode: 'canonical' });

    resolveQuery();

    const [res1, res2] = await Promise.all([call1Promise, call2Promise]);

    assert.equal(res1.length, 2);
    assert.equal(res2.length, 2);
    assert.equal(res1[0].slug, 'hospital-alpha');
    assert.equal(res1[1].slug, 'hospital-beta');
    assert.equal(res2[0].slug, 'hospital-beta');
    assert.equal(res2[1].slug, 'hospital-alpha');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('13. getHospitalsBySlugs in-flight deduplication dispatches only 1 database query for identical slug sets', async () => {
  const origFrom = supabase.from;
  try {
    invalidateHospitalSlugsCache();
    let queryDispatchCount = 0;
    let resolveQuery;
    const queryHoldPromise = new Promise(resolve => { resolveQuery = resolve; });

    supabase.from = () => {
      queryDispatchCount++;
      return {
        select: () => ({
          in: () => ({
            eq: async () => {
              await queryHoldPromise;
              return {
                data: [
                  { id: '1', slug: 'hospital-x', name: 'Hospital X', publication_status: 'published' },
                  { id: '2', slug: 'hospital-y', name: 'Hospital Y', publication_status: 'published' },
                ],
                error: null,
              };
            },
          }),
        }),
      };
    };

    const call1 = getHospitalsBySlugs(['hospital-x', 'hospital-y'], { mode: 'canonical' });
    const call2 = getHospitalsBySlugs(['hospital-y', 'hospital-x'], { mode: 'canonical' });

    resolveQuery();
    await Promise.all([call1, call2]);

    assert.equal(queryDispatchCount, 1, 'Concurrent calls with same slug set must dispatch only 1 database query');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('14. getHospitalsBySlugs bypassCache forces fresh request and clears stale cache', async () => {
  const origFrom = supabase.from;
  try {
    invalidateHospitalSlugsCache();
    let queryCount = 0;

    supabase.from = () => {
      queryCount++;
      return {
        select: () => ({
          in: () => ({
            eq: async () => ({
              data: [
                { id: '1', slug: 'hospital-c', name: `Hospital C (v${queryCount})`, publication_status: 'published' },
              ],
              error: null,
            }),
          }),
        }),
      };
    };

    // First call: populates cache
    const initial = await getHospitalsBySlugs(['hospital-c'], { mode: 'canonical' });
    assert.equal(queryCount, 1);
    assert.equal(initial[0].name, 'Hospital C (v1)');

    // Second call without bypassCache: served from cache
    const cached = await getHospitalsBySlugs(['hospital-c'], { mode: 'canonical' });
    assert.equal(queryCount, 1, 'Should use 5-second cache');
    assert.equal(cached[0].name, 'Hospital C (v1)');

    // Third call with bypassCache: true (e.g. user clicks Retry): fetches fresh data
    const fresh = await getHospitalsBySlugs(['hospital-c'], { mode: 'canonical', bypassCache: true });
    assert.equal(queryCount, 2, 'bypassCache: true must trigger fresh query');
    assert.equal(fresh[0].name, 'Hospital C (v2)');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('15. Comparison ranking safely handles non-string locality, city, and numeric primitives', async () => {
  const { evaluateHospitalParamRank, COMPARISON_RANKS } = await import('../src/lib/compare/comparisonRanking.js');

  const localityRow = {
    label: 'Located in Vashi',
    get: (h) => {
      const safeLower = (val) => (typeof val === 'string' && val.trim() ? val.trim().toLowerCase() : null);
      const matchesText = (target, query) => {
        const normTarget = safeLower(target);
        const normQuery = safeLower(query);
        return Boolean(normTarget && normQuery && normTarget === normQuery);
      };
      return matchesText(h?.location?.locality, 'vashi') ? 'Matches area' : 'Outside area';
    },
  };

  const hospitalsWithNonStringLocations = [
    { id: 'h1', name: 'Numeric Locality', location: { locality: 400703, city: 123 } },
    { id: 'h2', name: 'Boolean City', location: { locality: true, city: false } },
    { id: 'h3', name: 'Object Location', location: { locality: {}, city: [] } },
    { id: 'h4', name: 'Valid String', location: { locality: 'Vashi', city: 'Navi Mumbai' } },
  ];

  assert.doesNotThrow(() => {
    const res1 = evaluateHospitalParamRank(localityRow, hospitalsWithNonStringLocations, 0);
    assert.equal(res1.displayValue, 'Outside area');
    assert.equal(res1.rank, COMPARISON_RANKS.WORST);

    const res2 = evaluateHospitalParamRank(localityRow, hospitalsWithNonStringLocations, 1);
    assert.equal(res2.displayValue, 'Outside area');
    assert.equal(res2.rank, COMPARISON_RANKS.WORST);

    const res3 = evaluateHospitalParamRank(localityRow, hospitalsWithNonStringLocations, 2);
    assert.equal(res3.displayValue, 'Outside area');
    assert.equal(res3.rank, COMPARISON_RANKS.WORST);

    const res4 = evaluateHospitalParamRank(localityRow, hospitalsWithNonStringLocations, 3);
    assert.equal(res4.displayValue, 'Matches area');
    assert.equal(res4.rank, COMPARISON_RANKS.BEST);
  });
});

test('16. Static verification: Compare.jsx handles non-strings, error retry, and stale cache indicator', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const compareCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/App/Compare.jsx'), 'utf8');

  assert.ok(compareCode.includes("typeof val === 'string'"), 'Compare.jsx must validate string type in safeLower');
  assert.ok(compareCode.includes('matchesText'), 'Compare.jsx must use matchesText for case-insensitive matching');
  assert.ok(compareCode.includes("typeof hospital.location === 'string'"), 'place() must check string location');
  assert.ok(compareCode.includes("typeof hospital.location === 'object'"), 'place() must check object location');
  assert.ok(compareCode.includes('onClick={handleRetry}'), 'Compare.jsx must wire handleRetry to retry buttons');
  assert.ok(compareCode.includes('Displaying cached selection. The requested comparison could not be updated.'), 'Compare.jsx must show stale data notice on error');
});
