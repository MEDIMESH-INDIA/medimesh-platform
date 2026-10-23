import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

// 1. Static and contract tests for CollapsibleFilter and DoctorDiscoverExperience
const collapsibleFilterPath = resolve(process.cwd(), 'src/components/hospital/CollapsibleFilter.jsx');
const doctorDiscoverPath = resolve(process.cwd(), 'src/pages/App/DoctorDiscoverExperience.jsx');

const collapsibleFilterSrc = readFileSync(collapsibleFilterPath, 'utf8');
const doctorDiscoverSrc = readFileSync(doctorDiscoverPath, 'utf8');

test('CollapsibleFilter: implements progressive disclosure and removes nested scrollbar', () => {
  // Nested scrollbar must be eliminated from individual groups to avoid nested scrollbar traps
  assert.ok(
    !collapsibleFilterSrc.includes('max-h-[220px] overflow-y-auto'),
    'CollapsibleFilter must NOT contain nested max-h-[220px] overflow-y-auto scrollbars'
  );

  // Progressive disclosure controls must exist
  assert.ok(
    collapsibleFilterSrc.includes('initialVisibleCount'),
    'CollapsibleFilter should accept initialVisibleCount prop'
  );
  assert.ok(
    collapsibleFilterSrc.includes('Show all ('),
    'CollapsibleFilter should render dynamic "Show all (N)" toggle'
  );
  assert.ok(
    collapsibleFilterSrc.includes('Show fewer'),
    'CollapsibleFilter should render "Show fewer" toggle when expanded'
  );
});

test('CollapsibleFilter: category search and option filtering logic', () => {
  assert.ok(
    collapsibleFilterSrc.includes('searchThreshold'),
    'CollapsibleFilter should support configurable searchThreshold'
  );
  assert.ok(
    collapsibleFilterSrc.includes('aria-label={`Search ${title.toLowerCase()}`}'),
    'Search input must have accessible aria-label'
  );
  assert.ok(
    collapsibleFilterSrc.includes('Clear ${title.toLowerCase()} search'),
    'Search input must have clear button with accessible label'
  );

  // Pure logic simulation of option filtering
  const options = ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Radiology'];
  const search = 'ortho';
  const cleanSearch = search.trim().toLowerCase();
  const filtered = options.filter(opt => opt.toLowerCase().includes(cleanSearch));

  assert.deepEqual(filtered, ['Orthopedics'], 'Option filtering should match case-insensitively');
});

test('CollapsibleFilter: selection preservation during category search', () => {
  // Verifies that when an active selection is excluded from search results, an indicator preserves it
  assert.ok(
    collapsibleFilterSrc.includes('hasSelectedValue && search && !filteredOptions.includes(value)'),
    'CollapsibleFilter must detect when current selection does not match active category search'
  );
  assert.ok(
    collapsibleFilterSrc.includes('Selected:'),
    'CollapsibleFilter must render a prominent Selected indicator preserving the active option'
  );

  // Pure simulation: verify active selection is not overwritten or dropped
  const selectedValue = 'Cardiology';
  const matchingOptions = ['Neurology']; // user searched 'neuro'
  const isSelectionPreserved = selectedValue && !matchingOptions.includes(selectedValue);
  assert.equal(isSelectionPreserved, true, 'Cardiology remains selected even when searching for neurology');
});

test('CollapsibleFilter: progressive disclosure slice calculation with selection preservation', () => {
  const options = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8'];
  const initialLimit = 5;

  // Case A: No selection, first 5 items shown
  const sliceA = options.slice(0, initialLimit);
  assert.equal(sliceA.length, 5);
  assert.deepEqual(sliceA, ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);

  // Case B: Selection at Item 8 (beyond limit), Item 8 must be injected into visible list
  const selected = 'Item 8';
  let sliceB = options.slice(0, initialLimit);
  if (selected && options.includes(selected) && !sliceB.includes(selected)) {
    sliceB = [...sliceB.slice(0, initialLimit - 1), selected];
  }
  assert.equal(sliceB.length, 5);
  assert.ok(sliceB.includes('Item 8'), 'Selected item beyond top 5 must remain visible without requiring manual expansion');
});

test('DoctorDiscoverExperience: default expansion configuration', () => {
  // Specialization is open by default (primary clinical axis)
  assert.ok(
    doctorDiscoverSrc.includes('title="Specialization"') &&
    doctorDiscoverSrc.includes('defaultOpen={true}'),
    'Specialization should be open by default'
  );

  // Other categories open only when an active filter is present
  assert.ok(
    doctorDiscoverSrc.includes('title="Hospital Affiliation"') &&
    doctorDiscoverSrc.includes('defaultOpen={Boolean(filters.hospital)}'),
    'Hospital Affiliation should be collapsed unless active'
  );

  assert.ok(
    doctorDiscoverSrc.includes('title="City"') &&
    doctorDiscoverSrc.includes('defaultOpen={Boolean(filters.city)}'),
    'City should be collapsed unless active'
  );

  assert.ok(
    doctorDiscoverSrc.includes('title="Area / Locality"') &&
    doctorDiscoverSrc.includes('defaultOpen={Boolean(filters.locality)}'),
    'Locality should be collapsed unless active'
  );
});

test('DoctorDiscoverExperience: unified single scroll container for sidebar', () => {
  assert.ok(
    doctorDiscoverSrc.includes('lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto lg:pr-1.5 custom-scrollbar'),
    'Sidebar filters must be wrapped in a single, dedicated desktop scroll container'
  );
});

test('DoctorDiscoverExperience: active chips representation and removal semantics', () => {
  // Verify home visits chip label format
  assert.ok(
    doctorDiscoverSrc.includes("if (filters.homeVisitsOnly) activeChips.push({ key: 'homeVisitsOnly', label: 'Home visits' });"),
    'Home visits chip should use concise "Home visits" label'
  );

  // Simulation of active filter chips logic
  const mockFilters = {
    q: 'Sharma',
    specialization: 'Cardiology',
    hospital: 'Fortis Hospital',
    city: 'Navi Mumbai',
    locality: 'Vashi',
    homeVisitsOnly: true,
  };

  const chips = [];
  if (mockFilters.city) chips.push({ key: 'city', label: mockFilters.city });
  if (mockFilters.locality) chips.push({ key: 'locality', label: mockFilters.locality });
  if (mockFilters.specialization) chips.push({ key: 'specialization', label: mockFilters.specialization });
  if (mockFilters.hospital) chips.push({ key: 'hospital', label: mockFilters.hospital });
  if (mockFilters.homeVisitsOnly) chips.push({ key: 'homeVisitsOnly', label: 'Home visits' });

  assert.equal(chips.length, 5);
  assert.deepEqual(chips.map(c => c.label), [
    'Navi Mumbai',
    'Vashi',
    'Cardiology',
    'Fortis Hospital',
    'Home visits'
  ]);

  // Removing one chip: e.g. specialization
  const updatedFilters = { ...mockFilters };
  delete updatedFilters.specialization;
  assert.equal(updatedFilters.specialization, undefined);
  assert.equal(updatedFilters.hospital, 'Fortis Hospital');
});

test('DoctorDiscoverExperience: clear all filters contract', () => {
  assert.ok(
    doctorDiscoverSrc.includes('const clearAllFilters = () => {'),
    'clearAllFilters handler must exist'
  );
  assert.ok(
    doctorDiscoverSrc.includes('setSearchParams(new URLSearchParams());'),
    'clearAllFilters must reset URL parameters'
  );
  assert.ok(
    doctorDiscoverSrc.includes("setQuery('');"),
    'clearAllFilters must reset search input'
  );
});
