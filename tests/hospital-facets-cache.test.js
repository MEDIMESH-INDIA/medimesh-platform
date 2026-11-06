import test from 'node:test';
import assert from 'node:assert/strict';
import { supabase } from '../src/lib/supabase/client.js';
import {
  getHospitalFacets,
  invalidateHospitalFacetsCache,
} from '../src/lib/data/hospitalRepository.js';

const sampleRecords = [
  {
    city: 'Mumbai',
    locality: 'Andheri West',
    hospital_type: 'Multispeciality Hospital',
    hospital_specialties: [{ specialties: { name: 'Cardiology' } }, { specialties: { name: 'Oncology' } }],
    hospital_facilities: [{ facilities: { name: 'ICU' } }, { facilities: { name: '24/7 Pharmacy' } }],
  },
  {
    city: 'Pune',
    locality: 'Shivaji Nagar',
    hospital_type: 'Super Speciality Hospital',
    hospital_specialties: [{ specialties: { name: 'Neurology' } }],
    hospital_facilities: [{ facilities: { name: 'Ambulance' } }],
  },
];

function createMockSupabase(handler) {
  return () => ({
    select: () => ({
      eq: async (col, val) => handler(col, val),
    }),
  });
}

test('1. Basic cache hit: Two sequential identical calls within 60s produce 1 underlying request', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;
  try {
    invalidateHospitalFacetsCache();
    supabase.from = createMockSupabase(async () => {
      queryCount++;
      return { data: sampleRecords, error: null };
    });

    const facets1 = await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1, 'First call should query Supabase');
    assert.ok(facets1.cities.includes('Mumbai'));

    const facets2 = await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1, 'Second call within 60s must return cached data without querying Supabase');
    assert.deepEqual(facets2, facets1);
  } finally {
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});

test('2. Concurrent deduplication: Multiple simultaneous calls produce 1 underlying request', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;
  let resolveQuery;
  const holdPromise = new Promise(resolve => { resolveQuery = resolve; });

  try {
    invalidateHospitalFacetsCache();
    supabase.from = createMockSupabase(async () => {
      queryCount++;
      await holdPromise;
      return { data: sampleRecords, error: null };
    });

    const call1 = getHospitalFacets({ mode: 'canonical' });
    const call2 = getHospitalFacets({ mode: 'canonical' });
    const call3 = getHospitalFacets({ mode: 'canonical' });

    assert.equal(queryCount, 1, 'Only 1 query should be dispatched for concurrent callers');

    resolveQuery();
    const [res1, res2, res3] = await Promise.all([call1, call2, call3]);

    assert.equal(queryCount, 1, 'Query count remains 1 after resolution');
    assert.deepEqual(res1, res2);
    assert.deepEqual(res2, res3);
    assert.ok(res1.cities.includes('Pune'));
  } finally {
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});

test('3. TTL expiry: After 60 seconds, a fresh request occurs', async () => {
  const origFrom = supabase.from;
  const origDateNow = Date.now;
  let fakeNow = 1_000_000;
  let queryCount = 0;

  try {
    Date.now = () => fakeNow;
    invalidateHospitalFacetsCache();

    supabase.from = createMockSupabase(async () => {
      queryCount++;
      return { data: sampleRecords, error: null };
    });

    // Initial fetch at t = 1,000,000
    await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1);

    // Call at t = 1,000,000 + 45s (within 60s TTL)
    fakeNow += 45_000;
    await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1, 'Within 60s TTL must hit cache');

    // Call at t = 1,000,000 + 61s (expired TTL)
    fakeNow += 16_000; // now +61s from start
    await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 2, 'After 60s TTL expires, fresh request must be dispatched');
  } finally {
    Date.now = origDateNow;
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});

test('4. Canonical/demo separation: Results from one mode are never returned for the other', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;

  try {
    invalidateHospitalFacetsCache();
    supabase.from = createMockSupabase(async () => {
      queryCount++;
      return { data: sampleRecords, error: null };
    });

    // Demo mode does not query Supabase and has demo data
    const demoFacets = await getHospitalFacets({ mode: 'demo' });
    assert.equal(queryCount, 0, 'Demo mode should not query Supabase');
    assert.ok(Array.isArray(demoFacets.cities));

    // Canonical mode queries Supabase
    const canonicalFacets = await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1, 'Canonical mode queries Supabase');
    assert.ok(canonicalFacets.cities.includes('Mumbai'));

    // Re-query demo mode: should still return demo facets, not canonical
    const demoFacets2 = await getHospitalFacets({ mode: 'demo' });
    assert.equal(queryCount, 1, 'Demo mode re-query does not hit Supabase');
    assert.deepEqual(demoFacets2, demoFacets);

    // Re-query canonical mode: should return cached canonical facets
    const canonicalFacets2 = await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1, 'Canonical mode re-query uses canonical cache');
    assert.deepEqual(canonicalFacets2, canonicalFacets);
  } finally {
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});

test('5. Explicit invalidation: Invalidation forces the next call to fetch fresh data', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;

  try {
    invalidateHospitalFacetsCache();
    supabase.from = createMockSupabase(async () => {
      queryCount++;
      return { data: sampleRecords, error: null };
    });

    await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1);

    await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1, 'Cached call');

    // Invalidate globally
    invalidateHospitalFacetsCache();

    await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 2, 'Call after global invalidation fetches fresh data');

    // Invalidate with mode option
    invalidateHospitalFacetsCache({ mode: 'canonical' });

    await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 3, 'Call after mode invalidation fetches fresh data');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});

test('6. In-flight invalidation: Older pending request cannot repopulate the cache after invalidation', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;
  let resolveSlowQuery;
  const slowHoldPromise = new Promise(resolve => { resolveSlowQuery = resolve; });

  try {
    invalidateHospitalFacetsCache();
    supabase.from = createMockSupabase(async () => {
      queryCount++;
      if (queryCount === 1) {
        await slowHoldPromise;
        return {
          data: [{ city: 'OldCity', locality: 'OldLoc', hospital_type: 'OldType' }],
          error: null,
        };
      }
      return {
        data: [{ city: 'FreshCity', locality: 'FreshLoc', hospital_type: 'FreshType' }],
        error: null,
      };
    });

    // Start slow pending request (Gen 0)
    const slowCallPromise = getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 1);

    // Invalidate while request 1 is still in flight
    invalidateHospitalFacetsCache();

    // Start fresh request after invalidation (Gen 1)
    const freshCall = await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 2, 'Fresh query dispatched after invalidation');
    assert.ok(freshCall.cities.includes('FreshCity'));

    // Now let the older slow query complete
    resolveSlowQuery();
    const slowResult = await slowCallPromise;
    assert.ok(slowResult.cities.includes('OldCity'));

    // Verify cache has NOT been overwritten by the older slow request
    const cachedFacets = await getHospitalFacets({ mode: 'canonical' });
    assert.equal(queryCount, 2, 'Should hit cache without dispatching 3rd query');
    assert.ok(
      cachedFacets.cities.includes('FreshCity'),
      'Cache must retain fresh data and not be repopulated with older stale result'
    );
    assert.ok(!cachedFacets.cities.includes('OldCity'), 'Stale old city must not be in cache');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});

test('7. Failure recovery: A rejected request is not cached; subsequent call can succeed', async () => {
  const origFrom = supabase.from;
  let attempt = 0;

  try {
    invalidateHospitalFacetsCache();
    supabase.from = createMockSupabase(async () => {
      attempt++;
      if (attempt === 1) {
        return { data: null, error: new Error('Network timeout') };
      }
      return { data: sampleRecords, error: null };
    });

    // First attempt fails
    await assert.rejects(
      getHospitalFacets({ mode: 'canonical' }),
      /Network timeout/,
      'First attempt should reject'
    );

    // Second attempt should not return a cached error or hang; it should retry and succeed
    const facets = await getHospitalFacets({ mode: 'canonical' });
    assert.equal(attempt, 2, 'Second attempt must query Supabase anew');
    assert.ok(facets.cities.includes('Mumbai'), 'Second attempt returns valid data');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});

test('8. Existing behaviour: Returned facet structure and values remain unchanged', async () => {
  const origFrom = supabase.from;

  try {
    invalidateHospitalFacetsCache();
    supabase.from = createMockSupabase(async () => ({
      data: sampleRecords,
      error: null,
    }));

    const facets = await getHospitalFacets({ mode: 'canonical' });

    // Verify required contract keys
    assert.ok('cities' in facets);
    assert.ok('localities' in facets);
    assert.ok('cityToLocalities' in facets);
    assert.ok('types' in facets);
    assert.ok('specialties' in facets);
    assert.ok('facilities' in facets);

    // Verify values derived from sample records
    assert.deepEqual(facets.cities.sort(), ['Mumbai', 'Pune'].sort());
    assert.deepEqual(facets.localities.sort(), ['Andheri West', 'Shivaji Nagar'].sort());
    assert.deepEqual(facets.cityToLocalities['Mumbai'], ['Andheri West']);
    assert.deepEqual(facets.cityToLocalities['Pune'], ['Shivaji Nagar']);
    assert.ok(facets.specialties.includes('Cardiology'));
    assert.ok(facets.specialties.includes('Oncology'));
    assert.ok(facets.specialties.includes('Neurology'));
    assert.ok(facets.facilities.includes('ICU'));
    assert.ok(facets.facilities.includes('24/7 Pharmacy'));
    assert.ok(facets.facilities.includes('Ambulance'));
    assert.ok(facets.types.includes('Multispeciality Hospital'));
    assert.ok(facets.types.includes('Super Speciality Hospital'));
  } finally {
    supabase.from = origFrom;
    invalidateHospitalFacetsCache();
  }
});
