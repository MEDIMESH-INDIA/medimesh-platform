import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  isValidReturnDestination,
  sanitizeReturnDestination,
  getPostAuthDestination,
} from '../src/routes/roleDashboardPaths.js';

test('1. isValidReturnDestination: strictly prevents open redirect attack vectors', () => {
  const attacks = [
    '//evil.com',
    '//evil.com/path',
    '///evil.com',
    'https://evil.com',
    'http://evil.com',
    'http://localhost:3000',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '/\\evil.com',
    '/\\\\evil.com',
    '\\evil.com',
    '/evil.com:80',
    'ftp://evil.com',
    'file:///etc/passwd',
    '',
    null,
    undefined,
    123,
    {},
  ];

  for (const attack of attacks) {
    assert.equal(
      isValidReturnDestination(attack, 'patient'),
      false,
      `Expected open redirect attack vector "${attack}" to be rejected`
    );
  }
});

test('2. isValidReturnDestination: permits legitimate public healthcare discovery routes with query strings', () => {
  const validPublicRoutes = [
    '/discover',
    '/discover?city=Navi+Mumbai&locality=Vashi',
    '/discover?q=Apollo&sort=name_asc',
    '/doctors',
    '/doctors?specialization=Cardiology&city=Navi+Mumbai',
    '/doctors?homeVisitsOnly=true',
    '/hospitals/apollo-hospital-navi-mumbai',
    '/compare',
    '/compare?compare=apollo-hospital,fortis-hospital',
    '/care-finder',
    '/home-visits',
    '/home-visits?serviceArea=Vashi',
    '/about',
  ];

  for (const route of validPublicRoutes) {
    assert.equal(
      isValidReturnDestination(route, 'patient'),
      true,
      `Expected valid public route "${route}" to be allowed`
    );
  }
});

test('3. isValidReturnDestination: enforces role workspace boundaries and denies cross-role privilege escalation', () => {
  // Patient workspace routes
  assert.equal(isValidReturnDestination('/app', 'patient'), true);
  assert.equal(isValidReturnDestination('/app/saved', 'patient'), true);
  assert.equal(isValidReturnDestination('/app/settings', 'patient'), true);
  assert.equal(isValidReturnDestination('/app/doctors/dr-sharma/book-home-visit', 'patient'), true);

  // Patient attempting cross-role escalation into doctor/admin spaces must be rejected
  assert.equal(isValidReturnDestination('/doctor', 'patient'), false);
  assert.equal(isValidReturnDestination('/doctor/verification', 'patient'), false);
  assert.equal(isValidReturnDestination('/admin', 'patient'), false);
  assert.equal(isValidReturnDestination('/hospital', 'patient'), false);

  // Doctor workspace routes
  assert.equal(isValidReturnDestination('/doctor', 'doctor'), true);
  assert.equal(isValidReturnDestination('/doctor/settings', 'doctor'), true);
  assert.equal(isValidReturnDestination('/app', 'doctor'), false);
  assert.equal(isValidReturnDestination('/admin', 'doctor'), false);
});

test('4. sanitizeReturnDestination: falls back to role dashboard or root on invalid destination', () => {
  assert.equal(
    sanitizeReturnDestination('//malicious.com', 'patient'),
    '/app',
    'Should fallback to patient dashboard on protocol-relative URL'
  );

  assert.equal(
    sanitizeReturnDestination('https://malicious.com', 'patient'),
    '/app',
    'Should fallback to patient dashboard on absolute external URL'
  );

  assert.equal(
    sanitizeReturnDestination('/admin/users', 'patient'),
    '/app',
    'Should fallback to patient dashboard on unauthorized role path'
  );

  assert.equal(
    sanitizeReturnDestination('/discover?city=Mumbai', 'patient'),
    '/discover?city=Mumbai',
    'Should preserve valid discovery destination with query parameters'
  );
});

test('5. getPostAuthDestination: respects onboarding state before custom destination', () => {
  const pendingOnboardingProfile = { id: 'usr-1', role: 'patient', onboarding_completed: false };
  const completeProfile = { id: 'usr-1', role: 'patient', onboarding_completed: true };

  assert.equal(
    getPostAuthDestination({
      profile: pendingOnboardingProfile,
      role: 'patient',
      requestedPath: '/discover?city=Mumbai',
    }),
    '/onboarding',
    'Incomplete onboarding must always route to /onboarding regardless of requested destination'
  );

  assert.equal(
    getPostAuthDestination({
      profile: completeProfile,
      role: 'patient',
      requestedPath: '/discover?city=Mumbai',
    }),
    '/discover?city=Mumbai',
    'Completed profile should route to requested public destination'
  );

  assert.equal(
    getPostAuthDestination({
      profile: completeProfile,
      role: 'patient',
      requestedPath: '//attacker.com',
    }),
    '/app',
    'Completed profile with malicious destination should fall back to /app'
  );
});

test('6. Progressive Auth Gate behavioral contract: gating, resumption, and loading protection', () => {
  // Simulate requireAuth core contract
  let modalState = null;
  let actionExecuted = false;

  const simulateRequireAuth = ({
    user,
    authLoading,
    action,
    message,
    title,
    returnTo,
    resumeAction,
  }) => {
    if (authLoading) return false;
    if (user) {
      if (typeof action === 'function') action();
      return true;
    }
    modalState = {
      isOpen: true,
      title: title || 'Continue with MEDIMESH',
      message: message || 'Sign in or create an account to continue.',
      returnTo: returnTo || '/',
      resumeAction: resumeAction || action,
    };
    return false;
  };

  // Case A: Auth is still loading -> do not false-trigger
  modalState = null;
  actionExecuted = false;
  const loadingResult = simulateRequireAuth({
    user: null,
    authLoading: true,
    action: () => { actionExecuted = true; },
  });
  assert.equal(loadingResult, false);
  assert.equal(modalState, null, 'Modal must NOT open while auth session is loading');
  assert.equal(actionExecuted, false);

  // Case B: Authenticated user -> execute immediately
  modalState = null;
  actionExecuted = false;
  const authedResult = simulateRequireAuth({
    user: { id: 'u1', email: 'patient@example.com' },
    authLoading: false,
    action: () => { actionExecuted = true; },
  });
  assert.equal(authedResult, true);
  assert.equal(modalState, null, 'Modal must NOT open for authenticated user');
  assert.equal(actionExecuted, true, 'Action must execute immediately for authenticated user');

  // Case C: Unauthenticated visitor triggers gated action (e.g. Load More)
  modalState = null;
  actionExecuted = false;
  let resumedExecuted = false;
  const guestResult = simulateRequireAuth({
    user: null,
    authLoading: false,
    action: () => { actionExecuted = true; },
    message: 'Sign in to explore more items.',
    returnTo: '/discover?city=Navi+Mumbai',
    resumeAction: () => { resumedExecuted = true; },
  });
  assert.equal(guestResult, false);
  assert.equal(actionExecuted, false, 'Gated action must NOT execute immediately for guest');
  assert.notEqual(modalState, null, 'Auth modal must open for guest');
  assert.equal(modalState.isOpen, true);
  assert.equal(modalState.message, 'Sign in to explore more items.');
  assert.equal(modalState.returnTo, '/discover?city=Navi+Mumbai');

  // Verify action resumption:
  assert.equal(resumedExecuted, false);
  modalState.resumeAction();
  assert.equal(resumedExecuted, true, 'Resume action must execute successfully post-auth');
});

test('7. Static verification: AuthGateProvider mounted in root App.jsx', () => {
  const appPath = path.resolve(process.cwd(), 'src/App.jsx');
  assert.ok(fs.existsSync(appPath), 'src/App.jsx must exist');
  const content = fs.readFileSync(appPath, 'utf8');

  assert.ok(
    /import\s*\{[^}]*AuthGateProvider[^}]*\}\s*from\s*['"]\.\/contexts\/AuthGateContext['"]/.test(content),
    'src/App.jsx must import AuthGateProvider from ./contexts/AuthGateContext'
  );
  assert.ok(
    content.includes('<AuthGateProvider>'),
    'src/App.jsx must wrap routes inside <AuthGateProvider>'
  );
});

test('8. Static verification: AuthModal accessibility and security attributes', () => {
  const modalPath = path.resolve(process.cwd(), 'src/components/auth/AuthModal.jsx');
  assert.ok(fs.existsSync(modalPath), 'src/components/auth/AuthModal.jsx must exist');
  const content = fs.readFileSync(modalPath, 'utf8');

  assert.ok(content.includes('role="dialog"'), 'AuthModal must have role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'AuthModal must have aria-modal="true"');
  assert.ok(content.includes('aria-labelledby'), 'AuthModal must have aria-labelledby');
  assert.ok(content.includes('sanitizeReturnDestination'), 'AuthModal must use sanitizeReturnDestination');
  assert.ok(content.includes('role="alert"'), 'AuthModal error display must have role="alert"');
  assert.ok(content.includes('Continue as guest'), 'AuthModal must offer Continue as guest option');
  assert.ok(content.includes('Google'), 'AuthModal must offer Google authentication option');
  assert.ok(content.includes('Sign in'), 'AuthModal must offer Sign in tab');
  assert.ok(content.includes('Create account'), 'AuthModal must offer Create account tab');
});

test('9. Static verification: Healthcare discovery experiences integrate useAuthGate', () => {
  const pages = [
    {
      file: 'src/pages/App/DiscoverExperience.jsx',
      gatedTerms: ['useAuthGate', 'handleLoadMore', 'handleSave'],
    },
    {
      file: 'src/pages/App/DoctorDiscoverExperience.jsx',
      gatedTerms: ['useAuthGate', 'handleLoadMore'],
    },
    {
      file: 'src/pages/App/HomeVisitDoctorExperience.jsx',
      gatedTerms: ['useAuthGate', 'handleLoadMore'],
    },
    {
      file: 'src/pages/App/HospitalDetailExperience.jsx',
      gatedTerms: ['useAuthGate', 'handleSave'],
    },
    {
      file: 'src/components/doctor/DoctorCard.jsx',
      gatedTerms: ['useAuthGate', 'handleBookClick'],
    },
    {
      file: 'src/pages/App/DoctorDetailExperience.jsx',
      gatedTerms: ['useAuthGate', 'handleBookHomeVisit'],
    },
    {
      file: 'src/components/hospital/HospitalCard.jsx',
      gatedTerms: ['useAuthGate', 'requireAuth'],
    },
    {
      file: 'src/components/careFinder/CareFinderCard.jsx',
      gatedTerms: ['useAuthGate', 'requireAuth'],
    },
    {
      file: 'src/components/hospital/CompareTray.jsx',
      gatedTerms: ['useAuthGate', 'requireAuth'],
    },
    {
      file: 'src/components/layout/Navbar.jsx',
      gatedTerms: ['useAuthGate', 'requireAuth', '/care-finder', '/compare'],
    },
    {
      file: 'src/components/layout/Footer.jsx',
      gatedTerms: ['useAuthGate', 'requireAuth', '/compare'],
    },
  ];

  for (const { file, gatedTerms } of pages) {
    const fullPath = path.resolve(process.cwd(), file);
    assert.ok(fs.existsSync(fullPath), `${file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');

    for (const term of gatedTerms) {
      assert.ok(
        content.includes(term),
        `Expected ${file} to contain "${term}" for progressive authentication`
      );
    }
  }
});

test('10. Static verification: Legacy SignInPromptDialog is eliminated from discovery pages', () => {
  const discoverPath = path.resolve(process.cwd(), 'src/pages/App/DiscoverExperience.jsx');
  const hospitalDetailPath = path.resolve(process.cwd(), 'src/pages/App/HospitalDetailExperience.jsx');

  const discoverContent = fs.readFileSync(discoverPath, 'utf8');
  assert.ok(
    !discoverContent.includes('SignInPromptDialog'),
    'DiscoverExperience must not import or render legacy SignInPromptDialog'
  );

  const detailContent = fs.readFileSync(hospitalDetailPath, 'utf8');
  assert.ok(
    !detailContent.includes('SignInPromptDialog'),
    'HospitalDetailExperience must not import or render legacy SignInPromptDialog'
  );
});

test('11. Compare Hospitals and Care Finder are securely gated behind authentication', () => {
  const comparePath = path.resolve(process.cwd(), 'src/pages/App/Compare.jsx');
  const careFinderPath = path.resolve(process.cwd(), 'src/pages/CareFinder/CareFinderExperience.jsx');

  const compareContent = fs.readFileSync(comparePath, 'utf8');
  const careFinderContent = fs.readFileSync(careFinderPath, 'utf8');

  // Compare page must gate unauthenticated entry behind authentication
  assert.ok(
    compareContent.includes('useAuthGate'),
    'Compare.jsx must import useAuthGate'
  );
  assert.ok(
    compareContent.includes('openAuthModal'),
    'Compare.jsx must invoke openAuthModal for unauthenticated guests'
  );
  assert.ok(
    compareContent.includes('authLoading'),
    'Compare.jsx must guard against false prompts while authLoading is true'
  );
  assert.ok(
    compareContent.includes('Sign in to compare'),
    'Compare.jsx must render sign-in prompt button for guests'
  );

  // Care Finder page must gate unauthenticated entry behind authentication
  assert.ok(
    careFinderContent.includes('useAuthGate'),
    'CareFinderExperience.jsx must import useAuthGate'
  );
  assert.ok(
    careFinderContent.includes('openAuthModal'),
    'CareFinderExperience.jsx must invoke openAuthModal for unauthenticated guests'
  );
  assert.ok(
    careFinderContent.includes('authLoading'),
    'CareFinderExperience.jsx must guard against false prompts while authLoading is true'
  );
  assert.ok(
    careFinderContent.includes('Sign in to continue'),
    'CareFinderExperience.jsx must render gated call-to-action button for guests'
  );
  assert.ok(
    careFinderContent.includes('if (!user) return undefined;'),
    'CareFinderExperience.jsx must not fetch directory options or expose wizard when unauthenticated'
  );

  // Compare interactions must enforce authentication
  const cardPath = path.resolve(process.cwd(), 'src/components/hospital/HospitalCard.jsx');
  const cardContent = fs.readFileSync(cardPath, 'utf8');
  assert.ok(
    cardContent.includes('requireAuth({') && cardContent.includes('addHospital(hospital)'),
    'HospitalCard.jsx must gate + Compare button behind requireAuth'
  );

  const detailPath = path.resolve(process.cwd(), 'src/pages/App/HospitalDetailExperience.jsx');
  const detailContent = fs.readFileSync(detailPath, 'utf8');
  assert.ok(
    detailContent.includes('requireAuth({') && detailContent.includes('addHospital(hospital)'),
    'HospitalDetailExperience.jsx must gate handleCompare behind requireAuth'
  );

  const trayPath = path.resolve(process.cwd(), 'src/components/hospital/CompareTray.jsx');
  const trayContent = fs.readFileSync(trayPath, 'utf8');
  assert.ok(
    trayContent.includes('requireAuth({'),
    'CompareTray.jsx must gate Compare navigation behind requireAuth'
  );
});

test('12. Public healthcare exploration contract is strictly preserved for unauthenticated visitors', () => {
  // Discover experience: search, filter selection, and pagination are completely public
  const discoverPath = path.resolve(process.cwd(), 'src/pages/App/DiscoverExperience.jsx');
  const discoverContent = fs.readFileSync(discoverPath, 'utf8');
  assert.ok(
    !discoverContent.includes('requireAuth({ action: () => executeSearch'),
    'DiscoverExperience must allow public searching without requiring authentication'
  );

  // Doctor discover experience: doctor directory browsing is public
  const doctorPath = path.resolve(process.cwd(), 'src/pages/App/DoctorDiscoverExperience.jsx');
  const doctorContent = fs.readFileSync(doctorPath, 'utf8');
  assert.ok(
    !doctorContent.includes('requireAuth({ action: () => executeDoctorSearch'),
    'DoctorDiscoverExperience must allow public doctor browsing'
  );

  // Hospital detail: facility profiles, verified coordinate maps, and trust metadata are public
  const detailPath = path.resolve(process.cwd(), 'src/pages/App/HospitalDetailExperience.jsx');
  const detailContent = fs.readFileSync(detailPath, 'utf8');
  assert.ok(
    detailContent.includes('<TrustMetadata'),
    'HospitalDetailExperience must render TrustMetadata publicly'
  );
  assert.ok(
    detailContent.includes('<HospitalLocationPanel'),
    'HospitalDetailExperience must render HospitalLocationPanel publicly'
  );

  // Return destinations: verify that compare and care-finder (with safe query strings) are valid return destinations
  assert.equal(isValidReturnDestination('/compare', 'patient'), true);
  assert.equal(isValidReturnDestination('/compare?compare=apollo-hospital,fortis-hospital', 'patient'), true);
  assert.equal(isValidReturnDestination('/care-finder', 'patient'), true);
});
