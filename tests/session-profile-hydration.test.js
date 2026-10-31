import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAuthIdentityTransition,
  getProtectedRouteState,
  getRoleRouteState,
  getGuestRouteState,
} from '../src/routes/authGuardState.js';

test('Session-to-Profile Hydration and Route Guard Lifecycle', async (t) => {
  const patientProfile = {
    id: 'user-patient-1',
    display_name: 'Test Patient',
    role: 'patient',
    avatar_url: 'https://example.com/avatar.jpg',
    onboarding_completed: true,
  };

  await t.test('1. Restored session with cached user ID triggers profile hydration when profile is not loaded', () => {
    // Current user in ref matches next session user ID (normal refresh)
    const transition = getAuthIdentityTransition('user-patient-1', { user: { id: 'user-patient-1' } }, {
      requireProfileHydration: true, // profileLoadedUserIdRef was null
    });

    assert.equal(transition.nextUserId, 'user-patient-1');
    assert.equal(transition.identityChanged, false, 'Identity must not change on normal page refresh');
    assert.equal(transition.shouldClearProfile, false, 'Must not clear profile unnecessarily');
    assert.equal(transition.shouldLoadProfile, true, 'Must trigger profile hydration on restored session');
  });

  await t.test('2. Token refresh for already loaded profile does not trigger re-fetch', () => {
    // Current user in ref matches next session AND profile is already loaded
    const transition = getAuthIdentityTransition('user-patient-1', { user: { id: 'user-patient-1' } }, {
      requireProfileHydration: false, // profileLoadedUserIdRef matches nextUserId
    });

    assert.equal(transition.nextUserId, 'user-patient-1');
    assert.equal(transition.identityChanged, false);
    assert.equal(transition.shouldLoadProfile, false, 'Must not re-fetch profile on token refresh if already loaded');
  });

  await t.test('3. Account switch triggers identityChanged, clears previous profile, and loads new profile', () => {
    const transition = getAuthIdentityTransition('user-patient-1', { user: { id: 'user-doctor-2' } }, {
      requireProfileHydration: true,
    });

    assert.equal(transition.nextUserId, 'user-doctor-2');
    assert.equal(transition.identityChanged, true, 'Identity change must be detected');
    assert.equal(transition.shouldClearProfile, true, 'Previous profile must be cleared');
    assert.equal(transition.shouldLoadProfile, true, 'New user profile must be loaded');
  });

  await t.test('4. Sign-out clears profile without loading', () => {
    const transition = getAuthIdentityTransition('user-patient-1', null);

    assert.equal(transition.nextUser, null);
    assert.equal(transition.nextUserId, null);
    assert.equal(transition.identityChanged, true);
    assert.equal(transition.shouldClearProfile, true);
    assert.equal(transition.shouldLoadProfile, false);
  });

  await t.test('5. Route guards remain in loading state while profile is loading', () => {
    // During initial profile hydration, user is present and profileLoading is true
    const protectedState = getProtectedRouteState({
      authLoading: false,
      user: { id: 'user-patient-1' },
      profileLoading: true,
      profileError: null,
      profile: null,
      role: null,
      pathname: '/app',
    });
    assert.deepEqual(protectedState, { status: 'loading' });

    const roleState = getRoleRouteState({
      authLoading: false,
      user: { id: 'user-patient-1' },
      profileLoading: true,
      profileError: null,
      profile: null,
      role: null,
      pathname: '/app',
      allowedRoles: ['patient'],
    });
    assert.deepEqual(roleState, { status: 'loading' });

    const guestState = getGuestRouteState({
      authLoading: false,
      user: { id: 'user-patient-1' },
      profileLoading: true,
      profileError: null,
      profile: null,
      role: null,
      requestedPath: '/app',
    });
    assert.deepEqual(guestState, { status: 'loading' });
  });

  await t.test('6. Route guards allow access once profile hydration completes', () => {
    const protectedState = getProtectedRouteState({
      authLoading: false,
      user: { id: 'user-patient-1' },
      profileLoading: false,
      profileError: null,
      profile: patientProfile,
      role: 'patient',
      pathname: '/app',
    });
    assert.deepEqual(protectedState, { status: 'allow' });

    const roleState = getRoleRouteState({
      authLoading: false,
      user: { id: 'user-patient-1' },
      profileLoading: false,
      profileError: null,
      profile: patientProfile,
      role: 'patient',
      pathname: '/app',
      allowedRoles: ['patient'],
    });
    assert.deepEqual(roleState, { status: 'allow' });
  });

  await t.test('7. Missing avatar_url on loaded profile is NOT an authentication failure', () => {
    const profileWithoutAvatar = {
      ...patientProfile,
      avatar_url: null,
    };

    const protectedState = getProtectedRouteState({
      authLoading: false,
      user: { id: 'user-patient-1' },
      profileLoading: false,
      profileError: null,
      profile: profileWithoutAvatar,
      role: 'patient',
      pathname: '/app',
    });
    assert.deepEqual(protectedState, { status: 'allow' }, 'Missing avatar must allow access with fallback avatar');
  });

  await t.test('8. Network error on profile load returns profile-error with recoverable state', () => {
    const networkError = new Error('Failed to fetch profile: network error');
    const protectedState = getProtectedRouteState({
      authLoading: false,
      user: { id: 'user-patient-1' },
      profileLoading: false,
      profileError: networkError,
      profile: null,
      role: null,
      pathname: '/app',
    });
    assert.deepEqual(protectedState, { status: 'profile-error' });
  });
});
