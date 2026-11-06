import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import React from 'react';
import { useHospitalSearch } from '../src/hooks/useHospitalSearch.js';
import { supabase } from '../src/lib/supabase/client.js';

const projectRoot = process.cwd();

/**
 * Minimal React hook harness to execute hooks and effects in Node.js
 */
function createHookHarness(hook) {
  const hooks = [];
  let index = 0;
  const effectsToRun = [];
  const cleanups = [];
  let currentResult = null;
  let lastProps = null;
  let hasStateUpdate = false;

  const dispatcher = {
    useState(initial) {
      const idx = index++;
      if (hooks[idx] === undefined) {
        hooks[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (action) => {
        const nextVal = typeof action === 'function' ? action(hooks[idx]) : action;
        if (!Object.is(hooks[idx], nextVal)) {
          hooks[idx] = nextVal;
          hasStateUpdate = true;
        }
      };
      return [hooks[idx], setState];
    },
    useRef(initial) {
      const idx = index++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { current: initial };
      }
      return hooks[idx];
    },
    useCallback(fn, deps) {
      const idx = index++;
      const prev = hooks[idx];
      if (prev && deps && prev.deps && prev.deps.length === deps.length && deps.every((d, i) => Object.is(d, prev.deps[i]))) {
        return prev.fn;
      }
      hooks[idx] = { fn, deps };
      return fn;
    },
    useEffect(effect, deps) {
      const idx = index++;
      const prev = hooks[idx];
      const hasChanged = !prev || !deps || !prev.deps || prev.deps.length !== deps.length || !deps.every((d, i) => Object.is(d, prev.deps[i]));
      if (hasChanged) {
        effectsToRun.push({ idx, effect });
        hooks[idx] = { effect, deps };
      }
    },
  };

  function render(props = lastProps) {
    lastProps = props;
    index = 0;
    hasStateUpdate = false;
    const prevDispatcher = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = dispatcher;
    try {
      currentResult = hook(props);
    } finally {
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = prevDispatcher;
    }

    while (effectsToRun.length > 0) {
      const { idx, effect } = effectsToRun.shift();
      if (typeof cleanups[idx] === 'function') {
        cleanups[idx]();
      }
      cleanups[idx] = effect();
    }

    if (hasStateUpdate) {
      index = 0;
      hasStateUpdate = false;
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = dispatcher;
      try {
        currentResult = hook(props);
      } finally {
        React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = prevDispatcher;
      }
    }

    return currentResult;
  }

  function unmount() {
    for (const c of cleanups) {
      if (typeof c === 'function') c();
    }
    cleanups.length = 0;
  }

  return { render, unmount, getResult: () => currentResult };
}

test('1. Disabled useHospitalSearch does not initiate any search request or query', () => {
  const origFrom = supabase.from;
  let supabaseCalls = 0;
  supabase.from = () => {
    supabaseCalls++;
    return {
      select: () => ({
        eq: () => ({
          order: () => ({
            range: async () => ({ data: [], count: 0, error: null }),
          }),
        }),
      }),
    };
  };

  try {
    const harness = createHookHarness(useHospitalSearch);
    const result = harness.render({
      mode: 'canonical',
      filters: { q: 'Apollo', city: 'Bengaluru' },
      enabled: false,
    });

    assert.equal(supabaseCalls, 0, 'No Supabase queries must be dispatched when enabled=false');
    assert.equal(result.loading, false, 'Loading should be false immediately');
    harness.unmount();
  } finally {
    supabase.from = origFrom;
  }
});

test('2. Disabled hook exposes empty results array (hospitals: []) and loading: false, error: null', () => {
  const harness = createHookHarness(useHospitalSearch);
  const result = harness.render({
    enabled: false,
    filters: { q: 'Emergency', city: 'Mumbai' },
  });

  assert.deepEqual(result.hospitals, [], 'hospitals array must be empty');
  assert.equal(result.loading, false, 'loading must be false');
  assert.equal(result.error, null, 'error must be null');
  assert.equal(result.hasMore, false, 'hasMore must be false');
  assert.equal(result.totalCount, null, 'totalCount must be null');
  assert.equal(typeof result.loadMore, 'function', 'loadMore must still be a function');

  // Calling loadMore while disabled should not throw or change state
  result.loadMore();
  const nextResult = harness.render({ enabled: false });
  assert.deepEqual(nextResult.hospitals, []);
  assert.equal(nextResult.loading, false);
  harness.unmount();
});

test('3. Enabled hook performs normal search and populates results', async () => {
  const harness = createHookHarness(useHospitalSearch);
  harness.render({
    mode: 'demo',
    filters: { q: 'Harbourview' },
    enabled: true,
  });

  // Wait for the async search in demo mode to complete
  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 25));
    const current = harness.render({
      mode: 'demo',
      filters: { q: 'Harbourview' },
      enabled: true,
    });
    if (!current.loading && current.hospitals.length > 0) break;
  }

  const result = harness.render({
    mode: 'demo',
    filters: { q: 'Harbourview' },
    enabled: true,
  });

  assert.equal(result.loading, false, 'loading must finish');
  assert.equal(result.error, null, 'error must be null');
  assert.ok(Array.isArray(result.hospitals), 'hospitals must be an array');
  assert.ok(result.hospitals.length > 0, 'results must contain matched hospitals');
  assert.equal(result.hospitals[0].name, 'Harbourview Medical Centre');
  assert.ok(typeof result.totalCount === 'number' && result.totalCount > 0, 'totalCount must be populated');
  harness.unmount();
});

test('4. Enabling hook after being disabled triggers expected search', async () => {
  const harness = createHookHarness(useHospitalSearch);

  // 1. Initially disabled
  const initial = harness.render({
    mode: 'demo',
    filters: { q: 'Harbourview' },
    enabled: false,
  });
  assert.equal(initial.loading, false);
  assert.deepEqual(initial.hospitals, []);

  // 2. Enable hook
  harness.render({
    mode: 'demo',
    filters: { q: 'Harbourview' },
    enabled: true,
  });

  // Wait for search to resolve
  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 25));
    const current = harness.render({
      mode: 'demo',
      filters: { q: 'Harbourview' },
      enabled: true,
    });
    if (!current.loading && current.hospitals.length > 0) break;
  }

  const enabledResult = harness.render({
    mode: 'demo',
    filters: { q: 'Harbourview' },
    enabled: true,
  });

  assert.equal(enabledResult.loading, false);
  assert.ok(enabledResult.hospitals.length > 0, 'hospitals must be populated after enabling');
  assert.equal(enabledResult.hospitals[0].name, 'Harbourview Medical Centre');
  harness.unmount();
});

test('5. Disabling hook while request in progress does not allow stale results to overwrite disabled state', async () => {
  const origFrom = supabase.from;
  let resolveDbQuery;
  const dbPromise = new Promise((resolve) => {
    resolveDbQuery = resolve;
  });

  supabase.from = () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          range: async () => {
            await dbPromise;
            return {
              data: [
                {
                  id: 'delayed-hosp-1',
                  slug: 'delayed-hospital',
                  name: 'Delayed Hospital',
                  locality: 'Koramangala',
                  city: 'Bengaluru',
                  published: true,
                },
              ],
              count: 1,
              error: null,
            };
          },
        }),
      }),
    }),
  });

  try {
    const harness = createHookHarness(useHospitalSearch);

    // 1. Start search while enabled
    harness.render({
      mode: 'canonical',
      filters: { q: '' },
      enabled: true,
    });

    // 2. Disable hook before DB resolves
    const disabledState = harness.render({
      mode: 'canonical',
      filters: { q: '' },
      enabled: false,
    });

    assert.equal(disabledState.loading, false);
    assert.deepEqual(disabledState.hospitals, []);

    // 3. Resolve the delayed DB query
    resolveDbQuery();
    await new Promise((resolve) => setTimeout(resolve, 40));

    // 4. Re-render and verify disabled state was not overwritten by stale in-flight response
    const afterResolveState = harness.render({
      mode: 'canonical',
      filters: { q: '' },
      enabled: false,
    });

    assert.equal(afterResolveState.loading, false, 'loading must remain false');
    assert.deepEqual(afterResolveState.hospitals, [], 'hospitals must remain empty');
    assert.equal(afterResolveState.totalCount, null, 'totalCount must remain null');
    assert.equal(afterResolveState.error, null, 'error must remain null');
    harness.unmount();
  } finally {
    supabase.from = origFrom;
  }
});

test('6. Static verification: Compare.jsx does not contain __waiting_for_compare_search__ and passes enabled: Boolean(search)', () => {
  const comparePath = path.join(projectRoot, 'src/pages/App/Compare.jsx');
  const compareCode = fs.readFileSync(comparePath, 'utf8');

  // Verify dummy search token is eradicated
  assert.doesNotMatch(
    compareCode,
    /__waiting_for_compare_search__/,
    'Compare.jsx must not contain __waiting_for_compare_search__'
  );
  assert.doesNotMatch(
    compareCode,
    /const\s+WAITING\b/,
    'Compare.jsx must not define WAITING constant'
  );

  // Verify enabled: Boolean(search) is passed to useHospitalSearch
  assert.match(
    compareCode,
    /useHospitalSearch\(\{\s*mode,\s*filters,\s*pageSize:\s*9,\s*enabled:\s*Boolean\(search\)\s*\}\)/,
    'Compare.jsx must pass enabled: Boolean(search) to useHospitalSearch'
  );

  // Verify filters fallback defaults to EMPTY when search is null
  assert.match(
    compareCode,
    /filters\s*=\s*useMemo\(\s*\(\)\s*=>\s*\(search\s*\?[\s\S]*?:\s*EMPTY\)/,
    'Compare.jsx filters must fallback to EMPTY when search is null'
  );

  // Verify useHospitalSearch hook accepts enabled = true parameter
  const hookPath = path.join(projectRoot, 'src/hooks/useHospitalSearch.js');
  const hookCode = fs.readFileSync(hookPath, 'utf8');
  assert.match(
    hookCode,
    /enabled\s*=\s*true/,
    'useHospitalSearch must accept enabled with default true'
  );
  assert.match(
    hookCode,
    /useState\(\(\)\s*=>\s*Boolean\(enabled\)\)/,
    'useHospitalSearch must initialize loading state based on enabled'
  );
});

test('7. Static/runtime verification: Replacement-hospital searching and priority filtering still function when search is set', () => {
  const comparePath = path.join(projectRoot, 'src/pages/App/Compare.jsx');
  const compareCode = fs.readFileSync(comparePath, 'utf8');

  // Verify inferNeed and replacement search UI are intact
  assert.match(
    compareCode,
    /inferNeed\(search\?\.q,\s*facets\.specialties\)/,
    'Compare.jsx must retain inferNeed for search query interpretation'
  );
  assert.match(
    compareCode,
    /Matching catalog options/,
    'Compare.jsx must retain Matching catalog options search header'
  );

  // Runtime verification: when search is set, filters and discovery activate
  const EMPTY = { q: '', city: '', locality: '', specialty: '', facility: '' };
  const searchDraft = { ...EMPTY, q: 'Cardiology' };
  assert.equal(Boolean(searchDraft), true, 'Boolean(searchDraft) must evaluate to true');

  const harness = createHookHarness(useHospitalSearch);
  const result = harness.render({
    mode: 'demo',
    filters: { ...searchDraft, specialty: 'Cardiology' },
    enabled: Boolean(searchDraft),
  });

  assert.equal(result.loading, true, 'Search should immediately enter loading state when enabled with search query');
  harness.unmount();
});
