import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { clearPersistedComparison } from '../src/hooks/useCompare.js';

const projectRoot = process.cwd();

test('1. Footer: hides Get started CTA for authenticated users and guards against loading flash', () => {
  const footerPath = path.join(projectRoot, 'src/components/layout/Footer.jsx');
  const code = fs.readFileSync(footerPath, 'utf8');

  // Verify auth loading and user session inspection
  assert.match(code, /const\s*\{\s*user,\s*authLoading\s*\}\s*=\s*useAuth\(\)/, 'Footer must retrieve user and authLoading from useAuth');
  assert.match(code, /const\s+showGetStarted\s*=\s*!authLoading\s*&&\s*!user/, 'Footer must only show Get started when not loading and no user session');
  assert.match(code, /\{showGetStarted\s*&&\s*\(/, 'Footer must conditionally render the Get started CTA based on showGetStarted');

  // Verify compare tray bottom clearance requires authenticated session
  assert.match(code, /const\s+hasCompareTray\s*=\s*Boolean\(user\)\s*&&\s*compareList\.length\s*>\s*0/, 'Footer must only add compare tray padding when user is authenticated');
});

test('2. Compare: useCompare exports clearPersistedComparison and cleans localStorage and event bus', () => {
  const useComparePath = path.join(projectRoot, 'src/hooks/useCompare.js');
  const code = fs.readFileSync(useComparePath, 'utf8');

  assert.match(code, /export\s+function\s+clearPersistedComparison/, 'useCompare must export clearPersistedComparison function');
  assert.match(code, /localStorage\.removeItem\((STORAGE_KEY|['"]compareList['"])\)/, 'clearPersistedComparison must remove compareList from localStorage');
  assert.match(code, /window\.dispatchEvent\(new\s+Event\(['"]compare-updated['"]\)\)/, 'clearPersistedComparison must dispatch compare-updated event');

  // Verify mock execution of clearPersistedComparison in node environment does not throw
  assert.doesNotThrow(() => {
    clearPersistedComparison();
  }, 'clearPersistedComparison must be safe to call in any runtime environment');
});

test('3. AuthContext: clears comparison on SIGNED_OUT, session termination, and identity change', () => {
  const authContextPath = path.join(projectRoot, 'src/contexts/AuthContext.jsx');
  const code = fs.readFileSync(authContextPath, 'utf8');

  assert.match(code, /import\s*\{\s*clearPersistedComparison\s*\}\s*from\s*['"]\.\.\/hooks\/useCompare['"]/, 'AuthContext must import clearPersistedComparison');
  assert.match(code, /transition\.identityChanged\s*\)\s*\{\s*clearPersistedComparison\(\)/, 'AuthContext must clear persisted comparison on user identity transition');
  assert.match(code, /event\s*===\s*['"]SIGNED_OUT['"]\s*\|\|\s*!nextSession\?\.user\s*\)\s*\{\s*clearPersistedComparison\(\)/, 'AuthContext must clear persisted comparison on SIGNED_OUT or session loss');
  assert.match(code, /const\s+signOut\s*=\s*async\s*\(\)\s*=>\s*\{\s*clearPersistedComparison\(\)/, 'AuthContext signOut must clear persisted comparison before signing out');
});

test('4. CompareTray and AppShell: only visible to authenticated users and auto-hides when logged out', () => {
  const trayPath = path.join(projectRoot, 'src/components/hospital/CompareTray.jsx');
  const trayCode = fs.readFileSync(trayPath, 'utf8');

  assert.match(trayCode, /useAuth\(\)/, 'CompareTray must inspect authentication state via useAuth');
  assert.match(trayCode, /if\s*\(\s*authLoading\s*\|\|\s*!user\s*\|\|\s*compareList\.length\s*===\s*0/, 'CompareTray must return null if not authenticated or list is empty');

  const appShellPath = path.join(projectRoot, 'src/components/layout/AppShell.jsx');
  const appShellCode = fs.readFileSync(appShellPath, 'utf8');
  assert.match(appShellCode, /const\s+hasCompareTray\s*=\s*Boolean\(user\)\s*&&\s*compareCount\s*>\s*0/, 'AppShell must require authenticated user for hasCompareTray');
});

test('5. RouteScrollReset: disables browser auto scroll restoration, resets scroll on pathname change, and preserves hash', () => {
  const appPath = path.join(projectRoot, 'src/App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf8');

  // Verify manual scrollRestoration
  assert.match(appCode, /window\.history\.scrollRestoration\s*=\s*['"]manual['"]/, 'RouteScrollReset must set scrollRestoration to manual');

  // Verify resetScrollLock is invoked
  assert.match(appCode, /resetScrollLock\(\)/, 'RouteScrollReset must invoke resetScrollLock');

  // Verify window and document scroll reset to top
  assert.match(appCode, /window\.scrollTo\(\{\s*top:\s*0,\s*left:\s*0,\s*behavior:\s*['"]instant['"]\s*\}\)/, 'RouteScrollReset must reset window scroll to top');
  assert.match(appCode, /document\.documentElement\.scrollTop\s*=\s*0/, 'RouteScrollReset must reset documentElement scrollTop to 0');
  assert.match(appCode, /document\.body\.scrollTop\s*=\s*0/, 'RouteScrollReset must reset body scrollTop to 0');

  // Verify intentional hash/anchor navigation support
  assert.match(appCode, /location\.hash/, 'RouteScrollReset must check for hash navigation');
  assert.match(appCode, /scrollIntoView/, 'RouteScrollReset must scroll into view for valid anchor targets');

  // Verify effect dependencies
  assert.match(appCode, /\[location\.pathname,\s*location\.hash\]/, 'RouteScrollReset effect must track location.pathname and location.hash');
});
