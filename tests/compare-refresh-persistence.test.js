import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  GUEST_STORAGE_KEY,
  getAccountStorageKey,
  getCompareStorageKey,
  readStoredComparison,
  clearPersistedComparison,
  clearAllComparisonStorage,
} from '../src/hooks/useCompare.js';
import { getCachedUserId } from '../src/routes/authGuardState.js';

class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

test('1. Anonymous user: single hospital persists across simulated page refresh', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  // Simulate user selecting 1 hospital in anonymous session
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(['harbourview-medical-centre']));

  // Simulate page refresh (re-reading from storage on component mount)
  const restored = readStoredComparison();
  assert.equal(restored.length, 1);
  assert.equal(restored[0].slug, 'harbourview-medical-centre');
});

test('2. Anonymous user: 3 hospitals persist across simulated refresh with max limit enforced', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  const slugs = ['hospital-alpha', 'hospital-beta', 'hospital-gamma'];
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(slugs));

  const restored = readStoredComparison();
  assert.equal(restored.length, 3);
  assert.deepEqual(restored.map(h => h.slug), slugs);

  // If over 3 were somehow placed, strictly cap at 3
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify([...slugs, 'hospital-delta']));
  const capped = readStoredComparison();
  assert.equal(capped.length, 3);
  assert.deepEqual(capped.map(h => h.slug), slugs);
});

test('3. Removing a hospital persists across page refresh', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  // Initial: 3 hospitals
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(['hosp-1', 'hosp-2', 'hosp-3']));
  assert.equal(readStoredComparison().length, 3);

  // User removes hosp-2
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(['hosp-1', 'hosp-3']));

  // Browser refreshes
  const afterRefresh = readStoredComparison();
  assert.equal(afterRefresh.length, 2);
  assert.deepEqual(afterRefresh.map(h => h.slug), ['hosp-1', 'hosp-3']);
  assert.equal(afterRefresh.some(h => h.slug === 'hosp-2'), false);
});

test('4. Comparison order is strictly preserved across page refresh', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  const customOrder = ['hospital-charlie', 'hospital-alpha', 'hospital-bravo'];
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(customOrder));

  const restored = readStoredComparison();
  assert.deepEqual(restored.map(h => h.slug), customOrder);
});

test('5. Authenticated user: account-scoped persistence isolates selections and survives refresh', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  const userId = 'usr_patient_8899';
  const userKey = getAccountStorageKey(userId);
  assert.equal(userKey, `medimesh_compare_v1_${userId}`);

  // Authenticated user token cached in storage
  mockStorage.setItem('sb-testproject-auth-token', JSON.stringify({
    user: { id: userId, email: 'patient@example.com' }
  }));

  assert.equal(getCachedUserId(), userId);
  assert.equal(getCompareStorageKey(), userKey);

  // Save selection under user's account key
  mockStorage.setItem(userKey, JSON.stringify(['apollo-navi-mumbai', 'fortis-vashi']));

  // Guest key has different/empty selection
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(['guest-hospital']));

  // On page refresh, authenticated user loads their own selections, not guest selections
  const userRestored = readStoredComparison(userId);
  assert.deepEqual(userRestored.map(h => h.slug), ['apollo-navi-mumbai', 'fortis-vashi']);

  // Guest context reads guest key
  const guestRestored = readStoredComparison(null);
  assert.deepEqual(guestRestored.map(h => h.slug), ['guest-hospital']);
});

test('6. Legacy storage fallback and automatic one-time migration to versioned key', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  // Existing user has legacy data in 'compareList' before versioned keys existed
  mockStorage.setItem(STORAGE_KEY, JSON.stringify([
    { slug: 'legacy-hospital-1', name: 'Legacy Hospital 1' },
    { slug: 'legacy-hospital-2', name: 'Legacy Hospital 2' }
  ]));

  // Versioned key is uninitialized
  assert.equal(mockStorage.getItem(GUEST_STORAGE_KEY), null);

  // Reading migrates to versioned key
  const restored = readStoredComparison(null);
  assert.equal(restored.length, 2);
  assert.deepEqual(restored.map(h => h.slug), ['legacy-hospital-1', 'legacy-hospital-2']);

  // Check versioned key is now populated with array of slug IDs
  const migratedRaw = mockStorage.getItem(GUEST_STORAGE_KEY);
  assert.ok(migratedRaw);
  assert.deepEqual(JSON.parse(migratedRaw), ['legacy-hospital-1', 'legacy-hospital-2']);
});

test('7. Malformed, corrupted, or non-array stored data handled safely without throwing', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  // Invalid JSON
  mockStorage.setItem(GUEST_STORAGE_KEY, '{not-json');
  assert.doesNotThrow(() => {
    const res = readStoredComparison(null);
    assert.deepEqual(res, []);
  });

  // Stored number or object instead of array
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(12345));
  assert.deepEqual(readStoredComparison(null), []);

  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({ slug: 'not-an-array' }));
  assert.deepEqual(readStoredComparison(null), []);

  // Array with null, empty string, or whitespace
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify([null, '', '   ', 'valid-slug', undefined]));
  assert.deepEqual(readStoredComparison(null).map(h => h.slug), ['valid-slug']);
});

test('8. clearPersistedComparison satisfies test suite contracts while clearAllComparisonStorage cleans state', () => {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage;

  const userId = 'usr_test_123';
  mockStorage.setItem(STORAGE_KEY, JSON.stringify(['legacy-1']));
  mockStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(['guest-1']));
  mockStorage.setItem(getAccountStorageKey(userId), JSON.stringify(['user-1']));

  // clearPersistedComparison removes legacy key
  clearPersistedComparison();
  assert.equal(mockStorage.getItem(STORAGE_KEY), null);

  // clearAllComparisonStorage removes guest and user keys too
  clearAllComparisonStorage(userId);
  assert.equal(mockStorage.getItem(GUEST_STORAGE_KEY), null);
  assert.equal(mockStorage.getItem(getAccountStorageKey(userId)), null);
});

test('9. Storage failure or blocked storage in restricted environments does not throw', () => {
  const failingStorage = {
    getItem() {
      throw new Error('SecurityError: The operation is insecure.');
    },
    setItem() {
      throw new Error('QuotaExceededError');
    },
    removeItem() {
      throw new Error('Blocked');
    },
    length: 0,
    key() {
      return null;
    }
  };
  globalThis.localStorage = failingStorage;

  assert.doesNotThrow(() => {
    const res = readStoredComparison();
    assert.deepEqual(res, []);
  });

  assert.doesNotThrow(() => {
    clearPersistedComparison();
  });
});

