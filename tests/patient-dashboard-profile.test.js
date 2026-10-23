import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { calculateProfileCompleteness } from '../src/lib/profile/profileCompleteness.js';
import { validateAvatarFile, MAX_AVATAR_SIZE_BYTES } from '../src/lib/profile/avatarService.js';

// Inspect file contents for architecture & integration assertions
const patientDashboardPath = resolve(process.cwd(), 'src/pages/App/PatientDashboard.jsx');
const profilePath = resolve(process.cwd(), 'src/pages/App/Profile.jsx');
const welcomeHeaderPath = resolve(process.cwd(), 'src/components/patient/PatientWelcomeHeader.jsx');
const profileEditorPath = resolve(process.cwd(), 'src/components/patient/PatientProfileEditor.jsx');
const discoveryActionsPath = resolve(process.cwd(), 'src/components/patient/PatientDiscoveryActions.jsx');
const userAvatarPath = resolve(process.cwd(), 'src/components/common/UserAvatar.jsx');
const appShellPath = resolve(process.cwd(), 'src/components/layout/AppShell.jsx');
const storageMigrationPath = resolve(process.cwd(), 'supabase/migrations/20261024020000_avatar_storage_bucket.sql');

const patientDashboardSrc = readFileSync(patientDashboardPath, 'utf8');
const profileSrc = readFileSync(profilePath, 'utf8');
const welcomeHeaderSrc = readFileSync(welcomeHeaderPath, 'utf8');
const profileEditorSrc = readFileSync(profileEditorPath, 'utf8');
const discoveryActionsSrc = readFileSync(discoveryActionsPath, 'utf8');
const userAvatarSrc = readFileSync(userAvatarPath, 'utf8');
const appShellSrc = readFileSync(appShellPath, 'utf8');
const storageMigrationSrc = readFileSync(storageMigrationPath, 'utf8');

test('1. calculateProfileCompleteness: calculates accurate score and does not penalize optional fields', () => {
  // Empty profile
  const empty = calculateProfileCompleteness({});
  assert.equal(empty.percentage, 0);
  assert.equal(empty.completedCount, 0);
  assert.equal(empty.isComplete, false);
  assert.deepEqual(empty.missingFields, ['Display name', 'Contact phone', 'City', 'Country']);

  // Partial profile
  const partial = calculateProfileCompleteness({
    display_name: 'Aditi Rao',
    city: 'Navi Mumbai',
  });
  assert.equal(partial.percentage, 50);
  assert.equal(partial.completedCount, 2);
  assert.equal(partial.isComplete, false);
  assert.deepEqual(partial.missingFields, ['Contact phone', 'Country']);

  // Fully complete core profile
  const complete = calculateProfileCompleteness({
    display_name: 'Aditi Rao',
    phone: '+91 98765 43210',
    city: 'Navi Mumbai',
    country: 'India',
  });
  assert.equal(complete.percentage, 100);
  assert.equal(complete.completedCount, 4);
  assert.equal(complete.isComplete, true);
  assert.deepEqual(complete.missingFields, []);

  // Ensure optional medical/emergency info is not required for 100% account completeness
  assert.equal(complete.percentage, 100, 'Core profile can reach 100% without optional health fields');
});

test('2. Avatar validation: checks allowed file formats and size bounds', () => {
  assert.equal(validateAvatarFile(null).valid, false);

  // Invalid mime types
  const pdfFile = { type: 'application/pdf', size: 1024 };
  assert.equal(validateAvatarFile(pdfFile).valid, false);

  const exeFile = { type: 'application/octet-stream', size: 1024 };
  assert.equal(validateAvatarFile(exeFile).valid, false);

  // Exceeding 2MB
  const largeJpg = { type: 'image/jpeg', size: MAX_AVATAR_SIZE_BYTES + 1 };
  assert.equal(validateAvatarFile(largeJpg).valid, false);

  // Valid files
  const validPng = { type: 'image/png', size: 500 * 1024 };
  assert.equal(validateAvatarFile(validPng).valid, true);

  const validWebp = { type: 'image/webp', size: 1.5 * 1024 * 1024 };
  assert.equal(validateAvatarFile(validWebp).valid, true);
});

test('3. UserAvatar component: resilient fallback and error handling', () => {
  assert.ok(
    userAvatarSrc.includes('onError={() => setHasError(true)}'),
    'UserAvatar must catch broken image URLs with onError handler'
  );
  assert.ok(
    userAvatarSrc.includes('setHasError(false)'),
    'UserAvatar must reset error state when src changes'
  );
  assert.ok(
    userAvatarSrc.includes('initial'),
    'UserAvatar must render letter initial when src is absent or fails'
  );
});

test('4. Unified Patient Dashboard: integrates identity, overview, and profile editor without duplication', () => {
  // Verifies that PatientDashboard contains both overview and profile editing
  assert.ok(
    patientDashboardSrc.includes('PatientWelcomeHeader'),
    'PatientDashboard must include PatientWelcomeHeader'
  );
  assert.ok(
    patientDashboardSrc.includes('PatientProfileEditor'),
    'PatientDashboard must embed PatientProfileEditor directly'
  );
  assert.ok(
    patientDashboardSrc.includes('PatientDiscoveryActions'),
    'PatientDashboard must include PatientDiscoveryActions'
  );

  // Verifies tabs synchronization
  assert.ok(
    patientDashboardSrc.includes("activeTab === 'overview'"),
    'PatientDashboard must support Healthcare Overview tab'
  );
  assert.ok(
    patientDashboardSrc.includes("activeTab === 'profile'"),
    'PatientDashboard must support Profile & Health Records tab'
  );
});

test('5. PatientWelcomeHeader: displays actual profile photo, greeting, and read-only email', () => {
  assert.ok(
    welcomeHeaderSrc.includes('src={profile?.avatar_url}'),
    'Welcome header must render canonical avatar_url'
  );
  assert.ok(
    welcomeHeaderSrc.includes('Welcome, {firstName}'),
    'Welcome header must greet user by personalized name'
  );
  assert.ok(
    welcomeHeaderSrc.includes('Read-only'),
    'Account email must be visibly labelled as read-only'
  );
  assert.ok(
    welcomeHeaderSrc.includes('Patient Account'),
    'Header must identify account role badge'
  );
});

test('6. Profile Management Editor: handles personal, optional health, and emergency fields', () => {
  // Personal fields
  assert.ok(profileEditorSrc.includes('profile-display-name'), 'Must include display name field');
  assert.ok(profileEditorSrc.includes('profile-first-name'), 'Must include first name field');
  assert.ok(profileEditorSrc.includes('profile-last-name'), 'Must include last name field');
  assert.ok(profileEditorSrc.includes('profile-phone'), 'Must include phone field');
  assert.ok(profileEditorSrc.includes('profile-city'), 'Must include city field');
  assert.ok(profileEditorSrc.includes('profile-country'), 'Must include country field');

  // Optional health fields
  assert.ok(profileEditorSrc.includes('profile-blood-group'), 'Must include blood group field');
  assert.ok(profileEditorSrc.includes('profile-dob'), 'Must include date of birth field');
  assert.ok(profileEditorSrc.includes('profile-gender'), 'Must include gender field');
  assert.ok(profileEditorSrc.includes('profile-allergies'), 'Must include allergies field');
  assert.ok(profileEditorSrc.includes('profile-chronic'), 'Must include chronic conditions field');

  // Optional emergency contact fields
  assert.ok(profileEditorSrc.includes('profile-em-name'), 'Must include emergency name field');
  assert.ok(profileEditorSrc.includes('profile-em-rel'), 'Must include emergency relationship field');
  assert.ok(profileEditorSrc.includes('profile-em-phone'), 'Must include emergency phone field');

  // Saving state and refreshProfile trigger
  assert.ok(
    profileEditorSrc.includes('await refreshProfile()'),
    'Editor must call refreshProfile() on successful save to update global identity'
  );
});

test('7. Route compatibility: /app/profile seamlessly routes patients into unified dashboard profile tab', () => {
  assert.ok(
    profileSrc.includes("if (profile?.role === 'patient')"),
    'Profile.jsx must detect patient role'
  );
  assert.ok(
    profileSrc.includes('<PatientDashboard initialTab="profile" />'),
    'Profile.jsx must render unified PatientDashboard in profile mode for patients'
  );
});

test('8. Healthcare discovery actions: includes Care Finder as a first-class action alongside existing links', () => {
  assert.ok(
    discoveryActionsSrc.includes("label: 'Care Finder'"),
    'Care Finder must be included in discovery actions'
  );
  assert.ok(
    discoveryActionsSrc.includes("href: '/app/care-finder'"),
    'Care Finder action must link to /app/care-finder'
  );
  assert.ok(
    discoveryActionsSrc.includes("href: '/app/discover'"),
    'Hospital discovery must link to /app/discover'
  );
  assert.ok(
    discoveryActionsSrc.includes("href: '/app/doctors'"),
    'Doctor discovery must link to /app/doctors'
  );
  assert.ok(
    discoveryActionsSrc.includes("href: '/app/home-visits'"),
    'Home visit doctor discovery must link to /app/home-visits'
  );
  assert.ok(
    discoveryActionsSrc.includes("href: '/app/compare'"),
    'Hospital comparison must link to /app/compare'
  );
  assert.ok(
    discoveryActionsSrc.includes("href: '/app/saved'"),
    'Saved hospitals must link to /app/saved'
  );
});

test('9. Storage bucket migration: provisions avatars bucket with isolated user folder RLS', () => {
  assert.ok(
    storageMigrationSrc.includes("INSERT INTO storage.buckets (id, name, public"),
    'Migration must provision storage.buckets for avatars'
  );
  assert.ok(
    storageMigrationSrc.includes("(storage.foldername(name))[1] = auth.uid()::text"),
    'Storage policies must isolate user avatar uploads strictly to their own auth.uid folder'
  );
});

test('10. AppShell avatar parity: uses canonical UserAvatar instead of static letter placeholder', () => {
  assert.ok(
    appShellSrc.includes('<UserAvatar'),
    'AppShell sidebar must use UserAvatar component'
  );
  assert.ok(
    appShellSrc.includes('src={profile?.avatar_url}'),
    'AppShell sidebar must pass canonical profile.avatar_url'
  );
});

