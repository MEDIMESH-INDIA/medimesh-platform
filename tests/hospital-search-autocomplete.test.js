import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';

const projectRoot = process.cwd();
const autocompletePath = path.join(projectRoot, 'src/components/hospital/HospitalSearchAutocomplete.jsx');
const autocompleteSrc = fs.readFileSync(autocompletePath, 'utf8');

test('1. Module-level DEFAULT_FILTERS is declared and used as component parameter default', () => {
  // Must declare module-level DEFAULT_FILTERS before component
  assert.match(
    autocompleteSrc,
    /(?:export\s+)?const\s+DEFAULT_FILTERS\s*=\s*\{\s*\};/,
    'HospitalSearchAutocomplete.jsx must declare module-level DEFAULT_FILTERS = {}'
  );

  // Must use filters = DEFAULT_FILTERS in component parameters
  assert.match(
    autocompleteSrc,
    /filters\s*=\s*DEFAULT_FILTERS/,
    'HospitalSearchAutocomplete parameter list must default filters to DEFAULT_FILTERS'
  );

  // Must NOT use unstable filters = {} inline object default
  assert.doesNotMatch(
    autocompleteSrc,
    /filters\s*=\s*\{\s*\}/,
    'HospitalSearchAutocomplete parameter list must not use an inline object literal {} as default'
  );
});

test('2. Callback and effect dependencies properly connect to filters', () => {
  // fetchSuggestions must depend on [filters, mode]
  assert.match(
    autocompleteSrc,
    /fetchSuggestions\s*=\s*useCallback\([\s\S]*?\[filters,\s*mode\]\);/,
    'fetchSuggestions must be memoized with useCallback depending on [filters, mode]'
  );

  // Debounced search trigger must depend on [query, fetchSuggestions] with 220ms delay
  assert.match(
    autocompleteSrc,
    /useEffect\(\(\)\s*=>\s*\{[\s\S]*?setTimeout\([\s\S]*?220\)[\s\S]*?return\s*\(\)\s*=>\s*clearTimeout\(timer\);[\s\S]*?\}\s*,\s*\[query,\s*fetchSuggestions\]\);/,
    'Debounce effect must depend on [query, fetchSuggestions] and cancel active timer via clearTimeout'
  );
});

test('3. All call sites omit filters and benefit from DEFAULT_FILTERS stability', () => {
  const comparePath = path.join(projectRoot, 'src/pages/App/Compare.jsx');
  const discoverPath = path.join(projectRoot, 'src/pages/App/DiscoverExperience.jsx');
  const welcomePath = path.join(projectRoot, 'src/components/patient/PatientWelcomeHeader.jsx');

  const compareSrc = fs.readFileSync(comparePath, 'utf8');
  const discoverSrc = fs.readFileSync(discoverPath, 'utf8');
  const welcomeSrc = fs.readFileSync(welcomePath, 'utf8');

  // Verify all 3 call sites integrate HospitalSearchAutocomplete
  assert.match(compareSrc, /<HospitalSearchAutocomplete/);
  assert.match(discoverSrc, /<HospitalSearchAutocomplete/);
  assert.match(welcomeSrc, /<HospitalSearchAutocomplete/);

  // Extract <HospitalSearchAutocomplete ... /> invocations and ensure none pass filters prop
  const compareUsage = compareSrc.match(/<HospitalSearchAutocomplete[^>]+>/s)?.[0] || '';
  const discoverUsage = discoverSrc.match(/<HospitalSearchAutocomplete[^>]+>/s)?.[0] || '';
  const welcomeUsage = welcomeSrc.match(/<HospitalSearchAutocomplete[^>]+>/s)?.[0] || '';

  assert.ok(!compareUsage.includes('filters='), 'Compare.jsx should omit filters prop to use DEFAULT_FILTERS');
  assert.ok(!discoverUsage.includes('filters='), 'DiscoverExperience.jsx should omit filters prop to use DEFAULT_FILTERS');
  assert.ok(!welcomeUsage.includes('filters='), 'PatientWelcomeHeader.jsx should omit filters prop to use DEFAULT_FILTERS');
});

test('4. React hook lifecycle simulation: DEFAULT_FILTERS prevents debounce cancellation across re-renders', () => {
  const DEFAULT_FILTERS = {};

  // Simulate React useCallback and useEffect dependency tracking
  function simulateHookLifecycle(getFiltersProp) {
    let prevCallback = null;
    let callbackRecreations = 0;
    let timerClears = 0;
    let timerStarts = 0;
    let activeTimer = null;
    let prevEffectDeps = null;

    // Simulate 5 re-renders where parent state changes but search query remains unchanged
    for (let render = 0; render < 5; render++) {
      const filters = getFiltersProp();
      const mode = 'canonical';

      // useCallback(fn, [filters, mode])
      let callback;
      if (!prevCallback || prevCallback.deps[0] !== filters || prevCallback.deps[1] !== mode) {
        callback = { id: render, deps: [filters, mode] };
        callbackRecreations++;
        prevCallback = callback;
      } else {
        callback = prevCallback;
      }

      // useEffect(timer, [query, fetchSuggestions])
      const query = 'Apollo';
      const depsChanged = !prevEffectDeps || prevEffectDeps[0] !== query || prevEffectDeps[1] !== callback;

      if (depsChanged) {
        if (activeTimer) {
          timerClears++;
          activeTimer = null;
        }
        activeTimer = { id: render };
        timerStarts++;
        prevEffectDeps = [query, callback];
      }
    }

    return { callbackRecreations, timerClears, timerStarts };
  }

  // Case A: With unstable inline {} (the previous bug)
  const unstable = simulateHookLifecycle(() => ({}));
  assert.equal(unstable.callbackRecreations, 5, 'Inline {} recreates callback on every render');
  assert.equal(unstable.timerClears, 4, 'Inline {} repeatedly cancels debounce timer 4 times across 5 renders');
  assert.equal(unstable.timerStarts, 5, 'Inline {} restarts debounce timer 5 times');

  // Case B: With stable DEFAULT_FILTERS (the fix)
  const stable = simulateHookLifecycle(() => DEFAULT_FILTERS);
  assert.equal(stable.callbackRecreations, 1, 'DEFAULT_FILTERS preserves callback identity across all renders');
  assert.equal(stable.timerClears, 0, 'DEFAULT_FILTERS NEVER cancels debounce timer during unrelated re-renders');
  assert.equal(stable.timerStarts, 1, 'DEFAULT_FILTERS starts debounce timer exactly once');
});

test('5. Explicitly supplied filters override DEFAULT_FILTERS correctly', () => {
  const DEFAULT_FILTERS = {};

  function resolveProps(props = {}) {
    const { filters = DEFAULT_FILTERS, mode = 'canonical' } = props;
    return { filters, mode };
  }

  // When omitted -> resolves to DEFAULT_FILTERS
  assert.equal(resolveProps().filters, DEFAULT_FILTERS);
  assert.equal(resolveProps({}).filters, DEFAULT_FILTERS);

  // When explicitly passed -> resolves to caller-provided object
  const customFilters = { city: 'Mumbai', specialty: 'Cardiology' };
  const resolved = resolveProps({ filters: customFilters });
  assert.equal(resolved.filters, customFilters);
  assert.equal(resolved.filters.city, 'Mumbai');
  assert.equal(resolved.filters.specialty, 'Cardiology');
  assert.notEqual(resolved.filters, DEFAULT_FILTERS);
});

test('6. Existing autocomplete functionality contracts remain intact', () => {
  // Navigation, keyboard handling, and accessibility
  assert.match(autocompleteSrc, /useNavigate/);
  assert.match(autocompleteSrc, /ArrowDown/);
  assert.match(autocompleteSrc, /ArrowUp/);
  assert.match(autocompleteSrc, /Enter/);
  assert.match(autocompleteSrc, /Escape/);
  assert.match(autocompleteSrc, /aria-autocomplete="list"/);
  assert.match(autocompleteSrc, /aria-expanded/);
  assert.match(autocompleteSrc, /role="listbox"/);
  assert.match(autocompleteSrc, /role="option"/);
  assert.match(autocompleteSrc, /matchReason/);
  assert.match(autocompleteSrc, /getHospitalSuggestions/);
});
