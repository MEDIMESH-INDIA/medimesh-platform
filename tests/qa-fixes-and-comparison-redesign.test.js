import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

// Asset and source paths
const brandDir = resolve(process.cwd(), 'src/assets/brand');
const logoHorizontalPath = resolve(brandDir, 'medimesh-horizontal.png');
const logoStackedPath = resolve(brandDir, 'medimesh-stacked.png');
const obsoleteLogoPath = resolve(brandDir, 'medimesh-logo.png');
const obsoleteMarkPath = resolve(brandDir, 'medimesh-mark.png');
const obsoleteWordmarkPath = resolve(brandDir, 'medimesh-wordmark.png');

const medimeshLogoSrc = readFileSync(resolve(process.cwd(), 'src/components/brand/MedimeshLogo.jsx'), 'utf8');
const navbarSrc = readFileSync(resolve(process.cwd(), 'src/components/layout/Navbar.jsx'), 'utf8');
const footerSrc = readFileSync(resolve(process.cwd(), 'src/components/layout/Footer.jsx'), 'utf8');
const appShellSrc = readFileSync(resolve(process.cwd(), 'src/components/layout/AppShell.jsx'), 'utf8');
const authLayoutSrc = readFileSync(resolve(process.cwd(), 'src/components/layout/AuthLayout.jsx'), 'utf8');
const authModalSrc = readFileSync(resolve(process.cwd(), 'src/components/auth/AuthModal.jsx'), 'utf8');
const verifyEmailSrc = readFileSync(resolve(process.cwd(), 'src/pages/Auth/VerifyEmail.jsx'), 'utf8');
const protectedRouteSrc = readFileSync(resolve(process.cwd(), 'src/routes/ProtectedRoute.jsx'), 'utf8');
const guestRouteSrc = readFileSync(resolve(process.cwd(), 'src/routes/GuestRoute.jsx'), 'utf8');

const compareSrc = readFileSync(resolve(process.cwd(), 'src/pages/App/Compare.jsx'), 'utf8');
const hospitalRepoSrc = readFileSync(resolve(process.cwd(), 'src/lib/data/hospitalRepository.js'), 'utf8');
const autocompleteSrc = readFileSync(resolve(process.cwd(), 'src/components/hospital/HospitalSearchAutocomplete.jsx'), 'utf8');
const discoverSrc = readFileSync(resolve(process.cwd(), 'src/pages/App/DiscoverExperience.jsx'), 'utf8');
const welcomeHeaderSrc = readFileSync(resolve(process.cwd(), 'src/components/patient/PatientWelcomeHeader.jsx'), 'utf8');

const patientOnboardingSrc = readFileSync(resolve(process.cwd(), 'src/components/onboarding/PatientOnboarding.jsx'), 'utf8');
const patientProfileEditorSrc = readFileSync(resolve(process.cwd(), 'src/components/patient/PatientProfileEditor.jsx'), 'utf8');

const doctorRepoSrc = readFileSync(resolve(process.cwd(), 'src/lib/data/doctorRepository.js'), 'utf8');
const useDoctorSearchSrc = readFileSync(resolve(process.cwd(), 'src/hooks/useDoctorSearch.js'), 'utf8');
const homeVisitExpSrc = readFileSync(resolve(process.cwd(), 'src/pages/App/HomeVisitDoctorExperience.jsx'), 'utf8');
const doctorDiscoverSrc = readFileSync(resolve(process.cwd(), 'src/pages/App/DoctorDiscoverExperience.jsx'), 'utf8');
const doctorHomeVisitRequestsSrc = readFileSync(resolve(process.cwd(), 'src/pages/App/Doctor/HomeVisitRequests.jsx'), 'utf8');
const patientHomeVisitBookingsSrc = readFileSync(resolve(process.cwd(), 'src/pages/App/Patient/HomeVisitBookings.jsx'), 'utf8');

const registerSrc = readFileSync(resolve(process.cwd(), 'src/pages/Auth/Register.jsx'), 'utf8');
const onboardingSrc = readFileSync(resolve(process.cwd(), 'src/pages/App/Onboarding.jsx'), 'utf8');

test('1. Brand logos: new assets exist and obsolete placeholder assets are deleted', () => {
  assert.equal(existsSync(logoHorizontalPath), true, 'Horizontal logo must exist');
  assert.equal(existsSync(logoStackedPath), true, 'Stacked logo must exist');
  assert.equal(existsSync(obsoleteLogoPath), false, 'Obsolete medimesh-logo.png must be removed');
  assert.equal(existsSync(obsoleteMarkPath), false, 'Obsolete medimesh-mark.png must be removed');
  assert.equal(existsSync(obsoleteWordmarkPath), false, 'Obsolete medimesh-wordmark.png must be removed');
});

test('2. MedimeshLogo: supports horizontal and stacked variants with accessible markup', () => {
  assert.match(medimeshLogoSrc, /variant\s*=\s*['"]horizontal['"]/);
  assert.match(medimeshLogoSrc, /logoHorizontal/);
  assert.match(medimeshLogoSrc, /logoStacked/);
  assert.match(medimeshLogoSrc, /alt="MEDIMESH"/);
  assert.doesNotMatch(medimeshLogoSrc, /filter|hue-rotate|invert/, 'Logo colors must be preserved as supplied');
});

test('3. Brand logo placements: Navbar, Footer, AppShell, AuthLayout, AuthModal use MedimeshLogo', () => {
  assert.match(navbarSrc, /<MedimeshLogo/);
  assert.match(footerSrc, /<MedimeshLogo/);
  assert.match(appShellSrc, /<MedimeshLogo/);
  assert.match(authLayoutSrc, /<MedimeshLogo/);
  assert.match(authModalSrc, /<MedimeshLogo\s+variant=['"]stacked['"]/);
  assert.match(verifyEmailSrc, /<MedimeshLogo\s+variant=['"]stacked['"]/);
  assert.match(protectedRouteSrc, /<MedimeshLogo\s+variant=['"]stacked['"]/);
  assert.match(guestRouteSrc, /<MedimeshLogo\s+variant=['"]stacked['"]/);
});

test('4. Comparison redesign: Wireframe contracts, heading, priorities, and table overflow protection', () => {
  // Title must be Comparison
  assert.match(compareSrc, /<h1[^>]*>[\s\n]*Comparison[\s\n]*<\/h1>/);

  // Must not render literal Option 1 / Option 2 labels
  assert.doesNotMatch(compareSrc, />\s*Option\s+[0-9]+\s*</i);

  // "Your Priorities" section spanning full width with aligned result columns
  assert.match(compareSrc, /Your Priorities/);
  assert.match(compareSrc, /grid-cols-/);

  // Accessible indicators with text and icons (not color alone)
  assert.match(compareSrc, /CheckCircle2|Check/);
  assert.match(compareSrc, /XCircle|X/);
  assert.match(compareSrc, /HelpCircle/);
  assert.match(compareSrc, /Confirmed|Not confirmed|Not reported|Available|Not available|Verified/);

  // Horizontal scroller container preventing window overflow
  assert.match(compareSrc, /overflow-x-auto/);

  // Autocomplete integrated into comparison addition form
  assert.match(compareSrc, /<HospitalSearchAutocomplete/);
});

test('5. Hospital Search Autocomplete: suggestions, keyboard nav, debouncing, and explainable reasons', () => {
  // hospitalRepository getHospitalSuggestions contract
  assert.match(hospitalRepoSrc, /export async function getHospitalSuggestions/);
  assert.match(hospitalRepoSrc, /matchReason/);

  // HospitalSearchAutocomplete component capabilities
  assert.match(autocompleteSrc, /ArrowDown/);
  assert.match(autocompleteSrc, /ArrowUp/);
  assert.match(autocompleteSrc, /Enter/);
  assert.match(autocompleteSrc, /Escape/);
  assert.match(autocompleteSrc, /clearTimeout/);
  assert.match(autocompleteSrc, /matchReason/);

  // Discover and Patient Dashboard WelcomeHeader integration
  assert.match(discoverSrc, /<HospitalSearchAutocomplete/);
  assert.match(welcomeHeaderSrc, /<HospitalSearchAutocomplete/);
});

test('6. Mandatory Emergency Contact: validated in onboarding and profile editor', () => {
  // PatientOnboarding Step 3 requires emergency contact name & phone
  assert.match(patientOnboardingSrc, /Emergency Contact \(Required\)/);
  assert.match(patientOnboardingSrc, /!cleanEmName\s*\|\|\s*!cleanEmPhone/);

  // PatientProfileEditor enforces emergency contact for patient role
  assert.match(patientProfileEditorSrc, /Emergency Contact/);
  assert.match(patientProfileEditorSrc, /Required/);
  assert.match(patientProfileEditorSrc, /Emergency contact name and phone number are required/);
});

test('7. Loading & performance: Supabase errors thrown and in-place retry supported without window reload', () => {
  // doctorRepository throws error on Supabase failure
  assert.match(doctorRepoSrc, /if\s*\(error\)\s*\{[\s\n]*console\.error\([^)]*\);[\s\n]*throw error;/);

  // useDoctorSearch exposes refetch
  assert.match(useDoctorSearchSrc, /refetch/);

  // Discovery experiences do not use window.location.reload()
  assert.doesNotMatch(homeVisitExpSrc, /window\.location\.reload/);
  assert.doesNotMatch(doctorDiscoverSrc, /window\.location\.reload/);
  assert.match(homeVisitExpSrc, /refetch\(\)/);
  assert.match(doctorDiscoverSrc, /refetch\(\)/);

  // Home visit management views support retry action
  assert.match(doctorHomeVisitRequestsSrc, /refresh\(\)/);
  assert.match(patientHomeVisitBookingsSrc, /refresh\(\)/);
});

test('8. Onboarding clarification: role preselection and post-onboarding routing to role dashboards', () => {
  // Register parses ?role= query param and explains doctor/hospital listing claim
  assert.match(registerSrc, /searchParams\.get\(['"]role['"]\)/);
  assert.match(registerSrc, /Practitioner or Organization Listing/);

  // Onboarding redirects doctors to /doctor and hospitals to /hospital
  assert.match(onboardingSrc, /getRoleDashboardPath\(role\)/);
});

