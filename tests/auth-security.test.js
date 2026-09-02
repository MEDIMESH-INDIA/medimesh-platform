import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAuthIdentityTransition,
  getProtectedRouteState,
  getRoleRouteState,
} from '../src/routes/authGuardState.js';
import { getRoleDashboardPath } from '../src/routes/roleDashboardPaths.js';

const user = { id: 'user-a' };
const completePatientProfile = {
  id: 'user-a',
  role: 'patient',
  onboarding_completed: true,
};

test('role dashboard paths never synthesize null or undefined routes', () => {
  assert.equal(getRoleDashboardPath('patient'), '/app');
  assert.equal(getRoleDashboardPath('doctor'), '/doctor');
  assert.equal(getRoleDashboardPath('hospital'), '/hospital');
  assert.equal(getRoleDashboardPath('admin'), '/admin');
  assert.equal(getRoleDashboardPath(null), null);
  assert.equal(getRoleDashboardPath(undefined), null);
  assert.equal(getRoleDashboardPath('unknown'), null);
});

test('protected routes load, redirect, recover, and allow fail closed', () => {
  const base = {
    authLoading: false,
    user,
    profileLoading: false,
    profileError: null,
    profile: completePatientProfile,
    role: 'patient',
    pathname: '/app',
  };

  assert.deepEqual(getProtectedRouteState({ ...base, authLoading: true }), { status: 'loading' });
  assert.deepEqual(getProtectedRouteState({ ...base, profileLoading: true }), { status: 'loading' });
  assert.deepEqual(getProtectedRouteState({ ...base, user: null }), {
    status: 'redirect',
    to: '/login?redirect=%2Fapp',
  });
  assert.deepEqual(getProtectedRouteState({ ...base, profile: null, role: null }), {
    status: 'profile-error',
  });
  assert.deepEqual(getProtectedRouteState({ ...base, profileError: new Error('failed') }), {
    status: 'profile-error',
  });
  assert.deepEqual(getProtectedRouteState({
    ...base,
    profile: { ...completePatientProfile, id: 'user-b' },
  }), { status: 'profile-error' });
  assert.deepEqual(getProtectedRouteState({
    ...base,
    profile: { ...completePatientProfile, onboarding_completed: false },
  }), { status: 'redirect', to: '/onboarding' });
  assert.deepEqual(getProtectedRouteState({
    ...base,
    pathname: '/onboarding',
  }), { status: 'redirect', to: '/app' });
  assert.deepEqual(getProtectedRouteState(base), { status: 'allow' });
});

test('role routes deny unresolved and unauthorized roles', () => {
  const base = {
    authLoading: false,
    user,
    profileLoading: false,
    profileError: null,
    profile: completePatientProfile,
    role: 'patient',
    pathname: '/doctor',
    allowedRoles: ['doctor'],
  };

  assert.deepEqual(getRoleRouteState({ ...base, role: null }), {
    status: 'redirect',
    to: '/',
  });
  assert.deepEqual(getRoleRouteState({ ...base, profile: null }), {
    status: 'redirect',
    to: '/',
  });
  assert.deepEqual(getRoleRouteState(base), { status: 'redirect', to: '/app' });
  assert.deepEqual(getRoleRouteState({ ...base, pathname: '/admin', allowedRoles: ['admin'] }), {
    status: 'redirect',
    to: '/app',
  });
  assert.deepEqual(getRoleRouteState({ ...base, allowedRoles: ['patient'] }), {
    status: 'allow',
  });
  assert.deepEqual(getRoleRouteState({
    ...base,
    profile: { ...completePatientProfile, onboarding_completed: false },
  }), { status: 'redirect', to: '/onboarding' });
});

test('identity transitions clear stale data and hydrate only new identities', () => {
  assert.deepEqual(getAuthIdentityTransition(null, { user: { id: 'user-a' } }), {
    nextUser: { id: 'user-a' },
    nextUserId: 'user-a',
    identityChanged: true,
    shouldClearProfile: true,
    shouldLoadProfile: true,
  });
  assert.deepEqual(getAuthIdentityTransition('user-a', { user: { id: 'user-a' } }), {
    nextUser: { id: 'user-a' },
    nextUserId: 'user-a',
    identityChanged: false,
    shouldClearProfile: false,
    shouldLoadProfile: false,
  });
  assert.deepEqual(getAuthIdentityTransition('user-a', { user: { id: 'user-b' } }), {
    nextUser: { id: 'user-b' },
    nextUserId: 'user-b',
    identityChanged: true,
    shouldClearProfile: true,
    shouldLoadProfile: true,
  });
  assert.deepEqual(getAuthIdentityTransition('user-a', null), {
    nextUser: null,
    nextUserId: null,
    identityChanged: true,
    shouldClearProfile: true,
    shouldLoadProfile: false,
  });
});
