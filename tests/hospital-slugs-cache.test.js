import test from 'node:test';
import assert from 'node:assert/strict';
import { supabase } from '../src/lib/supabase/client.js';
import {
  getHospitalsBySlugs,
  invalidateHospitalSlugsCache,
  MAX_SLUGS_CACHE_SIZE,
  _getHospitalSlugsCacheStateForTesting,
} from '../src/lib/data/hospitalRepository.js';

function createMockSupabase(queryHandler) {
  return () => ({
    select: () => ({
      in: (_col, slugs) => ({
        eq: async () => queryHandler(slugs),
      }),
    }),
  });
}

function makeHospitalRecord(slug, extra = {}) {
  return {
    id: `id-${slug}`,
    slug,
    name: `Hospital ${slug}`,
    publication_status: 'published',
    ...extra,
  };
}

test('1. Basic cache hit: Two sequential identical calls within 5s produce 1 Supabase query', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;
  try {
    invalidateHospitalSlugsCache();
    supabase.from = createMockSupabase(async (slugs) => {
      queryCount++;
      return { data: slugs.map((s) => makeHospitalRecord(s)), error: null };
    });

    const res1 = await getHospitalsBySlugs(['apollo-mumbai', 'fortis-vashi'], { mode: 'canonical' });
    assert.equal(queryCount, 1, 'First call should query Supabase');
    assert.equal(res1.length, 2);

    const res2 = await getHospitalsBySlugs(['apollo-mumbai', 'fortis-vashi'], { mode: 'canonical' });
    assert.equal(queryCount, 1, 'Second call within 5s TTL should be served from cache');
    assert.deepEqual(res1.map((h) => h.slug), res2.map((h) => h.slug));
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('2. Cache expiration: Entries older than 5000ms expire and trigger a fresh query', async () => {
  const origFrom = supabase.from;
  const origDateNow = Date.now;
  let fakeNow = 1_000_000;
  let queryCount = 0;

  try {
    Date.now = () => fakeNow;
    invalidateHospitalSlugsCache();

    supabase.from = createMockSupabase(async (slugs) => {
      queryCount++;
      return { data: slugs.map((s) => makeHospitalRecord(s, { version: queryCount })), error: null };
    });

    const res1 = await getHospitalsBySlugs(['hospital-alpha'], { mode: 'canonical' });
    assert.equal(queryCount, 1);
    assert.equal(res1[0].slug, 'hospital-alpha');

    // Advance clock by 4000ms (within TTL)
    fakeNow += 4000;
    const res2 = await getHospitalsBySlugs(['hospital-alpha'], { mode: 'canonical' });
    assert.equal(queryCount, 1, '4 seconds in should still hit cache');
    assert.equal(res2[0].slug, 'hospital-alpha');

    // Advance clock past 5000ms
    fakeNow += 1500; // total 5500ms
    const res3 = await getHospitalsBySlugs(['hospital-alpha'], { mode: 'canonical' });
    assert.equal(queryCount, 2, 'After 5500ms, entry should expire and trigger fresh query');
    assert.equal(res3[0].slug, 'hospital-alpha');
  } finally {
    Date.now = origDateNow;
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('3. Bounded cache size and oldest eviction: Cache never exceeds MAX_SLUGS_CACHE_SIZE (50)', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;

  try {
    invalidateHospitalSlugsCache();
    assert.equal(MAX_SLUGS_CACHE_SIZE, 50, 'Max cache size should be 50');

    supabase.from = createMockSupabase(async (slugs) => {
      queryCount++;
      return { data: slugs.map((s) => makeHospitalRecord(s)), error: null };
    });

    // Populate 55 different slug entries sequentially
    for (let i = 1; i <= 55; i++) {
      await getHospitalsBySlugs([`slug-${i}`], { mode: 'canonical' });
    }

    const state = _getHospitalSlugsCacheStateForTesting();
    assert.ok(state.cacheSize <= MAX_SLUGS_CACHE_SIZE, `Cache size ${state.cacheSize} should not exceed ${MAX_SLUGS_CACHE_SIZE}`);
    assert.equal(state.cacheSize, 50, 'Cache should hold exactly 50 entries after adding 55');

    // The first 5 entries (slug-1 to slug-5) should have been evicted as oldest
    const queryCountBefore = queryCount;
    await getHospitalsBySlugs(['slug-1'], { mode: 'canonical' });
    assert.equal(queryCount, queryCountBefore + 1, 'slug-1 should have been evicted and require fresh query');

    // slug-55 should still be in cache
    const queryCountAfter55 = queryCount;
    await getHospitalsBySlugs(['slug-55'], { mode: 'canonical' });
    assert.equal(queryCount, queryCountAfter55, 'slug-55 should still be in cache');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('4. Concurrent deduplication: Multiple simultaneous calls for identical slugs share 1 query', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;
  let finishQuery;
  const holdPromise = new Promise((resolve) => {
    finishQuery = resolve;
  });

  try {
    invalidateHospitalSlugsCache();
    supabase.from = createMockSupabase(async (slugs) => {
      queryCount++;
      await holdPromise;
      return { data: slugs.map((s) => makeHospitalRecord(s)), error: null };
    });

    const call1 = getHospitalsBySlugs(['shared-slug-a', 'shared-slug-b'], { mode: 'canonical' });
    const call2 = getHospitalsBySlugs(['shared-slug-a', 'shared-slug-b'], { mode: 'canonical' });
    const call3 = getHospitalsBySlugs(['shared-slug-a', 'shared-slug-b'], { mode: 'canonical' });

    assert.equal(queryCount, 1, 'Only 1 query should be dispatched for 3 concurrent callers');

    finishQuery();
    const [res1, res2, res3] = await Promise.all([call1, call2, call3]);

    assert.equal(queryCount, 1, 'Query count should remain 1 after resolution');
    assert.equal(res1.length, 2);
    assert.deepEqual(res1.map((h) => h.slug), res2.map((h) => h.slug));
    assert.deepEqual(res2.map((h) => h.slug), res3.map((h) => h.slug));

    // In-flight map should be cleaned up
    const state = _getHospitalSlugsCacheStateForTesting();
    assert.equal(state.inFlightSize, 0, 'In-flight map should be empty after resolution');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('5. In-flight invalidation prevents older pending response from populating cache', async () => {
  const origFrom = supabase.from;
  let slowQueryResolve;
  const slowHold = new Promise((resolve) => {
    slowQueryResolve = resolve;
  });

  try {
    invalidateHospitalSlugsCache();

    let queryIteration = 0;
    supabase.from = createMockSupabase(async (slugs) => {
      queryIteration++;
      if (queryIteration === 1) {
        // First query is slow and holds
        await slowHold;
        return { data: slugs.map((s) => makeHospitalRecord(s, { name: 'Old Stale Data' })), error: null };
      }
      return { data: slugs.map((s) => makeHospitalRecord(s, { name: 'Fresh Data' })), error: null };
    });

    // 1. Start slow request
    const slowCall = getHospitalsBySlugs(['race-hospital'], { mode: 'canonical' });

    // 2. While slow request is in flight, invalidate cache
    invalidateHospitalSlugsCache(['race-hospital'], { mode: 'canonical' });

    // 3. Complete the slow request
    slowQueryResolve();
    await slowCall;

    // 4. Next call should NOT get the stale data from the slow request
    const freshCall = await getHospitalsBySlugs(['race-hospital'], { mode: 'canonical' });
    assert.equal(freshCall[0].name, 'Fresh Data', 'Fresh call must fetch fresh data, not stale invalidated data');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('6. Overlapping requests with bypassCache: true forces fresh query and updates cache safely', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;

  try {
    invalidateHospitalSlugsCache();
    supabase.from = createMockSupabase(async (slugs) => {
      queryCount++;
      return { data: slugs.map((s) => makeHospitalRecord(s, { name: `Version ${queryCount}` })), error: null };
    });

    // 1. Initial cached request
    const v1 = await getHospitalsBySlugs(['bypass-slug'], { mode: 'canonical' });
    assert.equal(queryCount, 1);
    assert.equal(v1[0].name, 'Version 1');

    // 2. Normal call returns cached
    const v1Cached = await getHospitalsBySlugs(['bypass-slug'], { mode: 'canonical' });
    assert.equal(queryCount, 1);
    assert.equal(v1Cached[0].name, 'Version 1');

    // 3. bypassCache: true forces new query
    const v2 = await getHospitalsBySlugs(['bypass-slug'], { mode: 'canonical', bypassCache: true });
    assert.equal(queryCount, 2);
    assert.equal(v2[0].name, 'Version 2');

    // 4. Subsequent normal call uses newly updated cache (Version 2)
    const v2Cached = await getHospitalsBySlugs(['bypass-slug'], { mode: 'canonical' });
    assert.equal(queryCount, 2);
    assert.equal(v2Cached[0].name, 'Version 2');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('7. Caller-specific ordering is strictly preserved across single, multiple, and cached calls', async () => {
  const origFrom = supabase.from;

  try {
    invalidateHospitalSlugsCache();
    supabase.from = createMockSupabase(async () => {
      // Return records intentionally in random / reverse order
      return {
        data: [
          makeHospitalRecord('zebra-hospital'),
          makeHospitalRecord('beta-hospital'),
          makeHospitalRecord('alpha-hospital'),
        ],
        error: null,
      };
    });

    // Caller 1 requests: alpha, zebra, beta
    const res1 = await getHospitalsBySlugs(['alpha-hospital', 'zebra-hospital', 'beta-hospital'], { mode: 'canonical' });
    assert.deepEqual(res1.map((h) => h.slug), ['alpha-hospital', 'zebra-hospital', 'beta-hospital']);

    // Caller 2 requests same hospitals in reverse order: beta, zebra, alpha (from cache)
    const res2 = await getHospitalsBySlugs(['beta-hospital', 'zebra-hospital', 'alpha-hospital'], { mode: 'canonical' });
    assert.deepEqual(res2.map((h) => h.slug), ['beta-hospital', 'zebra-hospital', 'alpha-hospital']);
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('8. Error cleanup: If query rejects, in-flight map is purged so subsequent calls do not hang', async () => {
  const origFrom = supabase.from;
  let attempts = 0;

  try {
    invalidateHospitalSlugsCache();
    supabase.from = createMockSupabase(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('Supabase network error');
      }
      return { data: [makeHospitalRecord('error-slug')], error: null };
    });

    // First call rejects
    await assert.rejects(
      () => getHospitalsBySlugs(['error-slug'], { mode: 'canonical' }),
      /Supabase network error/
    );

    // In-flight map must be empty
    const state = _getHospitalSlugsCacheStateForTesting();
    assert.equal(state.inFlightSize, 0, 'In-flight map must be cleaned up after error');

    // Second call should retry cleanly and succeed
    const retryRes = await getHospitalsBySlugs(['error-slug'], { mode: 'canonical' });
    assert.equal(retryRes[0].slug, 'error-slug');
    assert.equal(attempts, 2);
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});

test('9. Compound slug invalidation: Invalidating single slug purges combinations containing it', async () => {
  const origFrom = supabase.from;
  let queryCount = 0;

  try {
    invalidateHospitalSlugsCache();
    supabase.from = createMockSupabase(async (slugs) => {
      queryCount++;
      return { data: slugs.map((s) => makeHospitalRecord(s)), error: null };
    });

    // Cache a compound combination: ['hosp-a', 'hosp-b']
    await getHospitalsBySlugs(['hosp-a', 'hosp-b'], { mode: 'canonical' });
    assert.equal(queryCount, 1);

    // Invalidate just hosp-a
    invalidateHospitalSlugsCache(['hosp-a'], { mode: 'canonical' });

    // Requesting the compound pair again should trigger a fresh query
    await getHospitalsBySlugs(['hosp-a', 'hosp-b'], { mode: 'canonical' });
    assert.equal(queryCount, 2, 'Compound cache entry containing hosp-a must be purged');
  } finally {
    supabase.from = origFrom;
    invalidateHospitalSlugsCache();
  }
});
