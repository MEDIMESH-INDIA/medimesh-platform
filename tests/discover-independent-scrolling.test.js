import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';

const projectRoot = process.cwd();
const filterPanelPath = path.join(projectRoot, 'src/components/hospital/FilterPanel.jsx');
const filterPanelSrc = fs.readFileSync(filterPanelPath, 'utf8');

const discoverPath = path.join(projectRoot, 'src/pages/App/DiscoverExperience.jsx');
const discoverSrc = fs.readFileSync(discoverPath, 'utf8');

test('1. FilterPanel desktop branch declares sticky positioning and independent vertical scrolling', () => {
  // Desktop branch must have sticky positioning to stay visible during page scroll
  assert.match(
    filterPanelSrc,
    /className="[^"]*lg:sticky[^"]*lg:top-24[^"]*lg:self-start[^"]*"/,
    'FilterPanel desktop aside must have lg:sticky lg:top-24 lg:self-start'
  );
  // Must constrain max-height to viewport minus header offset
  assert.match(
    filterPanelSrc,
    /className="[^"]*lg:max-h-\[calc\(100vh-7\.5rem\)\][^"]*"/,
    'FilterPanel desktop aside must have lg:max-h-[calc(100vh-7.5rem)]'
  );
  // Must have independent vertical scrolling and overscroll containment
  assert.match(
    filterPanelSrc,
    /className="[^"]*lg:overflow-y-auto[^"]*"/,
    'FilterPanel desktop aside must have lg:overflow-y-auto'
  );
  assert.match(
    filterPanelSrc,
    /className="[^"]*lg:overscroll-contain[^"]*"/,
    'FilterPanel desktop aside must have lg:overscroll-contain to prevent scroll chaining'
  );
  assert.match(
    filterPanelSrc,
    /className="[^"]*custom-scrollbar[^"]*"/,
    'FilterPanel desktop aside must include custom-scrollbar styling'
  );
  // Preserves existing desktop panel width
  assert.match(
    filterPanelSrc,
    /w-\[235px\]\s+xl:w-\[245px\]\s+shrink-0/,
    'FilterPanel desktop aside must preserve w-[235px] xl:w-[245px] shrink-0 width'
  );
});

test('2. FilterPanel mobile/tablet portal drawer is fully preserved', () => {
  assert.match(
    filterPanelSrc,
    /return createPortal\(/,
    'FilterPanel must preserve createPortal drawer for mobile/tablet'
  );
  assert.match(
    filterPanelSrc,
    /<aside[^>]*className="discovery-filters absolute inset-y-0 left-0 w-full max-w-\[360px\] flex flex-col overflow-y-auto overscroll-contain/,
    'Mobile drawer aside must retain original styling and independent drawer scroll'
  );
  assert.match(
    filterPanelSrc,
    /lockScroll\(\)/,
    'FilterPanel must lock scroll when drawer opens on mobile'
  );
});

test('3. DiscoverExperience results panel retains original natural height without internal scrollbar', () => {
  // Results section must retain full natural height without height limit or internal scrollbar
  assert.doesNotMatch(
    discoverSrc,
    /discovery-results[^`]*lg:overflow-y-auto/,
    'discovery-results section must not have internal vertical scrollbar'
  );
  assert.doesNotMatch(
    discoverSrc,
    /discovery-results[^`]*lg:h-/,
    'discovery-results section must not force a reduced fixed height'
  );
  assert.doesNotMatch(
    discoverSrc,
    /discovery-results[^`]*lg:max-h-/,
    'discovery-results section must not restrict its maximum height'
  );
  // Internal padding accommodates CompareTray
  assert.match(
    discoverSrc,
    /\$\{isComparing \? 'pb-24 sm:pb-28' : 'pb-6'\} mb-6/,
    'discovery-results section must provide dynamic bottom clearance for CompareTray'
  );
});

test('4. DiscoverExperience search header and autocomplete remain outside scroll containers', () => {
  assert.match(
    discoverSrc,
    /<div className="discovery-header mb-6 relative z-20">/,
    'discovery-header must remain outside scroll containers and have relative z-20 to layer above panels'
  );
  assert.match(
    discoverSrc,
    /<HospitalSearchAutocomplete[\s\S]*?\/>/,
    'HospitalSearchAutocomplete must reside inside discovery-header outside scroll containers'
  );
});

test('5. Global styles and layouts are untouched by invasive scroll restrictions', () => {
  const indexCss = fs.readFileSync(path.join(projectRoot, 'src/styles/index.css'), 'utf8');
  assert.doesNotMatch(
    indexCss,
    /body\s*\{\s*overflow:\s*hidden\s*;?\s*\}/,
    'index.css must not introduce global body overflow hidden'
  );
  assert.doesNotMatch(
    indexCss,
    /html\s*\{\s*overflow:\s*hidden\s*;?\s*\}/,
    'index.css must not introduce global html overflow hidden'
  );
});

test('6. Layout-aware sticky positioning for Public vs Authenticated Discover', () => {
  const publicDiscoverPath = path.join(projectRoot, 'src/pages/PublicDiscover.jsx');
  const publicDiscoverSrc = fs.readFileSync(publicDiscoverPath, 'utf8');
  const patientDiscoverPath = path.join(projectRoot, 'src/pages/App/PatientDiscover.jsx');
  const patientDiscoverSrc = fs.readFileSync(patientDiscoverPath, 'utf8');

  // Public Discover passes navbar clearance (top-24 and calc(100vh-7.5rem))
  assert.match(
    publicDiscoverSrc,
    /stickyTop="[^"]*lg:top-24[^"]*lg:max-h-\[calc\(100vh-7\.5rem\)\][^"]*"/,
    'PublicDiscover must configure public sticky positioning for fixed navbar clearance'
  );

  // Authenticated Discover configures top-6 and calc(100vh-2.5rem)
  assert.match(
    patientDiscoverSrc,
    /stickyTop="[^"]*lg:top-6[^"]*lg:max-h-\[calc\(100vh-2\.5rem\)\][^"]*"/,
    'PatientDiscover must configure authenticated sticky positioning without dead gap'
  );

  // DiscoverExperience forwards stickyTop prop to FilterPanel
  assert.match(
    discoverSrc,
    /<FilterPanel[\s\S]*?stickyTop=\{stickyTop\}/,
    'DiscoverExperience must forward explicit stickyTop prop to FilterPanel'
  );

  // FilterPanel accepts stickyTop prop
  assert.match(
    filterPanelSrc,
    /stickyTop/,
    'FilterPanel must accept stickyTop prop for layout-aware positioning'
  );
});
