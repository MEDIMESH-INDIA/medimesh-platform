import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();

test('1. CompareTray: uses createPortal to document.body and has accessibility semantics', () => {
  const trayPath = path.join(projectRoot, 'src/components/hospital/CompareTray.jsx');
  const code = fs.readFileSync(trayPath, 'utf8');

  assert.match(code, /createPortal\(/, 'CompareTray must be rendered via createPortal');
  assert.match(code, /document\.body/, 'CompareTray portal container must be document.body');
  assert.doesNotMatch(code, /classList\.add\(['"]has-compare-tray['"]\)/, 'CompareTray must not inject body padding class');
  assert.match(code, /role=["']region["']/, 'CompareTray must have role="region"');
  assert.match(code, /aria-label=["']Hospital comparison bar["']/, 'CompareTray must have accessible aria-label');
  assert.match(code, /safe-area-inset-bottom/, 'CompareTray must respect mobile safe area insets');
});

test('2. index.css: does not add dead scroll space via body.has-compare-tray', () => {
  const cssPath = path.join(projectRoot, 'src/styles/index.css');
  const code = fs.readFileSync(cssPath, 'utf8');

  assert.doesNotMatch(code, /body\.has-compare-tray/, 'index.css must not add bottom padding to body');
});

test('3. Footer: provides bottom clearance internally when compare tray is active', () => {
  const footerPath = path.join(projectRoot, 'src/components/layout/Footer.jsx');
  const code = fs.readFileSync(footerPath, 'utf8');

  assert.match(code, /useCompare\(\)/, 'Footer must inspect comparison state');
  assert.match(code, /hasCompareTray/, 'Footer must track active compare tray');
  assert.match(code, /pb-28/, 'Footer must apply internal bottom clearance for floating compare bar');
});

test('4. Global single mount: App.jsx mounts CompareTray and page components do not duplicate it', () => {
  const appPath = path.join(projectRoot, 'src/App.jsx');
  const discoverPath = path.join(projectRoot, 'src/pages/App/DiscoverExperience.jsx');
  const careFinderPath = path.join(projectRoot, 'src/pages/CareFinder/CareFinderExperience.jsx');
  const appShellPath = path.join(projectRoot, 'src/components/layout/AppShell.jsx');

  const appCode = fs.readFileSync(appPath, 'utf8');
  const discoverCode = fs.readFileSync(discoverPath, 'utf8');
  const careFinderCode = fs.readFileSync(careFinderPath, 'utf8');
  const appShellCode = fs.readFileSync(appShellPath, 'utf8');

  assert.match(appCode, /<CompareTray \/>/, 'App.jsx must mount CompareTray globally');
  assert.doesNotMatch(discoverCode, /<CompareTray/, 'DiscoverExperience must not instantiate local CompareTray');
  assert.doesNotMatch(careFinderCode, /<CompareTray/, 'CareFinderExperience must not instantiate local CompareTray');
  assert.doesNotMatch(appShellCode, /<CompareTray/, 'AppShell must not instantiate local CompareTray');
});

test('5. Navbar: mobile drawer has backdrop, focus restoration, body scroll lock, and user card', () => {
  const navbarPath = path.join(projectRoot, 'src/components/layout/Navbar.jsx');
  const code = fs.readFileSync(navbarPath, 'utf8');

  assert.match(code, /isMobileMenuOpen/, 'Navbar must track mobile menu state');
  assert.match(code, /toggleButtonRef/, 'Navbar must track toggle button ref for focus restoration');
  assert.match(code, /document\.body\.style\.overflow/, 'Navbar must lock body scroll when mobile menu is open');
  assert.match(code, /fixed inset-0.*bg-black/, 'Navbar must render backdrop overlay for mobile menu');
  assert.match(code, /UserAvatar/, 'Navbar mobile drawer must display UserAvatar');
  assert.match(code, /dashboardLink/, 'Navbar mobile drawer must provide dashboard link');
  assert.match(code, /profile/i, 'Navbar mobile drawer must provide profile link');
});

test('6. AppShell: mobile drawer has backdrop, focus restoration, escape listener, and scroll lock', () => {
  const appShellPath = path.join(projectRoot, 'src/components/layout/AppShell.jsx');
  const code = fs.readFileSync(appShellPath, 'utf8');

  assert.match(code, /toggleButtonRef/, 'AppShell must track toggle button ref for focus restoration');
  assert.match(code, /fixed inset-0 bg-black/, 'AppShell must render backdrop overlay for mobile navigation');
  assert.match(code, /document\.body\.style\.overflow = 'hidden'/, 'AppShell must lock body scroll when mobile menu is open');
  assert.match(code, /Escape/, 'AppShell must close mobile drawer on Escape key');
});

test('7. Modals: AuthModal, HospitalChooserModal, ConfirmationDialog consistently lock body scroll', () => {
  const authModalPath = path.join(projectRoot, 'src/components/auth/AuthModal.jsx');
  const chooserModalPath = path.join(projectRoot, 'src/components/hospital/HospitalChooserModal.jsx');
  const confirmDialogPath = path.join(projectRoot, 'src/components/booking/ConfirmationDialog.jsx');

  const authModalCode = fs.readFileSync(authModalPath, 'utf8');
  const chooserModalCode = fs.readFileSync(chooserModalPath, 'utf8');
  const confirmDialogCode = fs.readFileSync(confirmDialogPath, 'utf8');

  assert.match(authModalCode, /document\.body\.style\.overflow = 'hidden'/, 'AuthModal must lock body scroll');
  assert.match(chooserModalCode, /document\.body\.style\.overflow = 'hidden'/, 'HospitalChooserModal must lock body scroll');
  assert.match(confirmDialogCode, /document\.body\.style\.overflow = 'hidden'/, 'ConfirmationDialog must lock body scroll');
});
