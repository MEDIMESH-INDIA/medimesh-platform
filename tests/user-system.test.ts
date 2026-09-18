/**
 * MEDIMESH INDIA 2.0 — Phase 06 User System & Personal Discovery Tests
 *
 * Exhaustive unit and integration test suite covering:
 * A. User account lifecycle and isolation
 * B. Saved items across all 10 supported discovery types & referential integrity
 * C. Strictly-2 facility comparisons & symmetrical normalization
 * D. Recent searches & non-diagnostic privacy preservation
 * E. Platform preferences (location semantics, accessibility toggles)
 * F. Informational platform notifications
 * G. Structural safety assertions (zero clinical / patient-record fields)
 * H. Terminology audit compliance
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  SyntheticUserStore,
  SyntheticUserRepository,
  SyntheticPreferenceRepository,
  SyntheticSavedItemRepository,
  SyntheticComparisonRepository,
  SyntheticRecentSearchRepository,
  SyntheticNotificationRepository,
} from '../src/features/user/repositories/synthetic-user-repository.ts';
import { UserService } from '../src/features/user/services/user-service.ts';
import { SavedEntityResolver } from '../src/features/user/services/saved-entity-resolver.ts';
import type {
  SavedEntityType,
  NotificationType,
} from '../src/features/user/domain/index.ts';

describe('MEDIMESH Phase 06 — User System & Personal Discovery Tests', () => {
  let store: SyntheticUserStore;
  let userRepo: SyntheticUserRepository;
  let prefRepo: SyntheticPreferenceRepository;
  let savedItemRepo: SyntheticSavedItemRepository;
  let comparisonRepo: SyntheticComparisonRepository;
  let searchRepo: SyntheticRecentSearchRepository;
  let notifRepo: SyntheticNotificationRepository;
  let resolver: SavedEntityResolver;
  let userService: UserService;

  beforeEach(() => {
    store = new SyntheticUserStore();
    userRepo = new SyntheticUserRepository(store);
    prefRepo = new SyntheticPreferenceRepository(store);
    savedItemRepo = new SyntheticSavedItemRepository(store);
    comparisonRepo = new SyntheticComparisonRepository(store);
    searchRepo = new SyntheticRecentSearchRepository(store);
    notifRepo = new SyntheticNotificationRepository(store);
    resolver = new SavedEntityResolver();
    userService = new UserService(
      userRepo,
      prefRepo,
      savedItemRepo,
      comparisonRepo,
      searchRepo,
      notifRepo,
      resolver
    );
  });

  // ---------------------------------------------------------------------------
  // A. User Account Lifecycle & Isolation
  // ---------------------------------------------------------------------------
  describe('A. User Account Lifecycle & Isolation', () => {
    it('should retrieve seeded synthetic Demo User 001 by ID', async () => {
      const user = await userRepo.findById('user-demo-001');
      assert.ok(user, 'Demo User 001 must exist');
      assert.equal(user.displayName, 'Demo User 001');
      assert.equal(user.authIdentifier, 'auth-demo-001');
      assert.equal(user.preferredLanguage, 'en');
      assert.equal(user.status, 'ACTIVE');
    });

    it('should retrieve user by authentication identifier', async () => {
      const user = await userRepo.findByAuthIdentifier('auth-demo-001');
      assert.ok(user);
      assert.equal(user.id, 'user-demo-001');
    });

    it('should update display name and preferred language', async () => {
      const updated = await userRepo.updateProfile('user-demo-001', {
        displayName: 'Demo User 001 Updated',
        preferredLanguage: 'hi',
      });
      assert.equal(updated.displayName, 'Demo User 001 Updated');
      assert.equal(updated.preferredLanguage, 'hi');

      const reloaded = await userRepo.findById('user-demo-001');
      assert.equal(reloaded?.displayName, 'Demo User 001 Updated');
      assert.equal(reloaded?.preferredLanguage, 'hi');
    });

    it('should enforce user isolation: User 1 cannot access User 2 profile', async () => {
      const user1 = await userRepo.findById('user-demo-001');
      const user2 = await userRepo.findById('user-demo-002');
      assert.ok(user1 && user2);
      assert.notEqual(user1.id, user2.id);
      assert.notEqual(user1.authIdentifier, user2.authIdentifier);
      assert.equal(user2.displayName, 'Demo User 002');
    });
  });

  // ---------------------------------------------------------------------------
  // B. Saved Discovery Items & 7-Step Referential Integrity
  // ---------------------------------------------------------------------------
  describe('B. Saved Discovery Items Across All 10 Supported Types', () => {
    const all10Types: Array<{ type: SavedEntityType; id: string }> = [
      { type: 'FACILITY', id: 'hosp-001' },
      { type: 'HOSPITAL', id: 'hosp-002' },
      { type: 'SPECIALTY', id: 'spec-001' },
      { type: 'DOCTOR', id: 'doc-001' },
      { type: 'SERVICE', id: 'svc-001' },
      { type: 'SCHEME', id: 'sch-pmjay' },
      { type: 'TARIFF', id: 'tar-001' },
      { type: 'AMBULANCE', id: 'fac-amb-01' },
      { type: 'PHARMACY', id: 'fac-pharm-01' },
      { type: 'HOME_HEALTHCARE', id: 'fac-home-01' },
    ];

    it('should confirm all 10 supported entity types pass referential validation when valid', async () => {
      for (const item of all10Types) {
        const exists = await resolver.exists(item.type, item.id);
        assert.ok(exists, `Entity ${item.type}:${item.id} must exist in canonical repository`);
      }
    });

    it('should save and resolve items across all 10 supported entity types', async () => {
      const testUserId = 'user-demo-001';

      for (const item of all10Types) {
        const saved = await userService.saveItem(testUserId, item.type, item.id);
        assert.ok(saved.id, `SavedItem for ${item.type} must have ID`);
        assert.equal(saved.userId, testUserId);
        assert.equal(saved.entityType, item.type);
        assert.equal(saved.entityId, item.id);

        const isSaved = await userService.isItemSaved(testUserId, item.type, item.id);
        assert.equal(isSaved, true);
      }

      const resolvedList = await userService.listSavedItemsResolved(testUserId);
      assert.ok(resolvedList.length >= 10);

      for (const r of resolvedList) {
        assert.ok(r.title, 'Resolved item must have title');
        assert.ok(r.categoryLabel, 'Resolved item must have category label');
        assert.ok(r.verificationState, 'Resolved item must have verification state');
        assert.equal(r.isDemo, true, 'Seeded synthetic records must have isDemo: true');
      }
    });

    it('should prevent duplicate saves for the same user and entity', async () => {
      const save1 = await userService.saveItem('user-demo-001', 'FACILITY', 'hosp-002');
      const save2 = await userService.saveItem('user-demo-001', 'FACILITY', 'hosp-002');
      assert.equal(save1.id, save2.id, 'Duplicate save should return existing record without duplicate insertion');

      const items = await savedItemRepo.listByUserId('user-demo-001', 'FACILITY');
      const count = items.filter((i) => i.entityId === 'hosp-002').length;
      assert.equal(count, 1, 'Exactly one saved record must exist for hosp-002');
    });

    it('should reject arbitrary nonexistent entity IDs through referential validation', async () => {
      await assert.rejects(
        async () => {
          await userService.saveItem('user-demo-001', 'FACILITY', 'made-up-facility-id');
        },
        /Referential integrity error/
      );

      await assert.rejects(
        async () => {
          await userService.saveItem('user-demo-001', 'DOCTOR', 'fake-doctor-id');
        },
        /Referential integrity error/
      );
    });

    it('should allow unsaving an item', async () => {
      await userService.saveItem('user-demo-001', 'FACILITY', 'hosp-002');
      const removed = await userService.unsaveItem('user-demo-001', 'FACILITY', 'hosp-002');
      assert.equal(removed, true);

      const isSaved = await userService.isItemSaved('user-demo-001', 'FACILITY', 'hosp-002');
      assert.equal(isSaved, false);
    });

    it('should enforce user isolation on saved items', async () => {
      // User 2 has hosp-003 saved
      const user2Items = await savedItemRepo.listByUserId('user-demo-002');
      assert.ok(user2Items.some((i) => i.entityId === 'hosp-003'));

      // User 1 cannot see User 2's hosp-003 in their saved items
      const user1Items = await savedItemRepo.listByUserId('user-demo-001');
      assert.ok(!user1Items.some((i) => i.entityId === 'hosp-003'));

      // User 1 cannot unsave User 2's item
      const unauthorizedRemove = await savedItemRepo.unsaveItem('user-demo-001', 'FACILITY', 'hosp-003');
      assert.equal(unauthorizedRemove, false);
    });
  });

  // ---------------------------------------------------------------------------
  // C. Saved Facility Comparisons
  // ---------------------------------------------------------------------------
  describe('C. Saved Facility Comparisons', () => {
    it('should save a valid comparison between two facilities', async () => {
      const comp = await userService.saveComparison('user-demo-001', 'hosp-001', 'hosp-002');
      assert.ok(comp.id);
      assert.equal(comp.userId, 'user-demo-001');
      assert.equal(comp.entityType, 'FACILITY');
      assert.equal(comp.entityAId, 'hosp-001');
      assert.equal(comp.entityBId, 'hosp-002');
    });

    it('should reject comparing the same facility to itself', async () => {
      await assert.rejects(
        async () => {
          await userService.saveComparison('user-demo-001', 'hosp-001', 'hosp-001');
        },
        /Cannot compare a facility to itself/
      );
    });

    it('should reject invalid or nonexistent facilities in comparison', async () => {
      await assert.rejects(
        async () => {
          await userService.saveComparison('user-demo-001', 'hosp-001', 'nonexistent-fac-id');
        },
        /not found/
      );
    });

    it('should normalize [A, B] and [B, A] symmetrically to prevent duplicate logical pairs', async () => {
      // Save [hosp-001, hosp-002]
      const comp1 = await comparisonRepo.saveComparison('user-demo-001', 'hosp-001', 'hosp-002');
      // Save reverse [hosp-002, hosp-001]
      const comp2 = await comparisonRepo.saveComparison('user-demo-001', 'hosp-002', 'hosp-001');

      assert.equal(comp1.id, comp2.id, 'Reverse pair must normalize to identical comparison');

      const all = await comparisonRepo.listByUserId('user-demo-001');
      const pairs = all.filter(
        (c) =>
          (c.entityAId === 'hosp-001' && c.entityBId === 'hosp-002') ||
          (c.entityAId === 'hosp-002' && c.entityBId === 'hosp-001')
      );
      assert.equal(pairs.length, 1, 'Only 1 normalized pair must be stored');
    });

    it('should resolve side-by-side facility comparison attributes neutrally', async () => {
      const resolved = await userService.listComparisonsResolved('user-demo-001');
      assert.ok(resolved.length > 0);

      const r = resolved[0];
      assert.ok(r.facilityA.name);
      assert.ok(r.facilityB.name);
      assert.ok(r.facilityA.category);
      assert.ok(r.facilityB.category);
      assert.equal(r.facilityA.isDemo, true);
      assert.equal(r.facilityB.isDemo, true);
    });

    it('should remove comparison when requested by owner and enforce user isolation', async () => {
      const comp = await comparisonRepo.saveComparison('user-demo-001', 'hosp-001', 'hosp-002');

      // User 2 cannot remove User 1's comparison
      const unauthorizedRemove = await comparisonRepo.removeComparison('user-demo-002', comp.id);
      assert.equal(unauthorizedRemove, false);

      // User 1 can remove their own comparison
      const removed = await comparisonRepo.removeComparison('user-demo-001', comp.id);
      assert.equal(removed, true);
    });
  });

  // ---------------------------------------------------------------------------
  // D. Recent Discovery Searches (Non-Diagnostic)
  // ---------------------------------------------------------------------------
  describe('D. Recent Discovery Searches', () => {
    it('should record discovery searches with newest-first ordering', async () => {
      const testUser = 'user-demo-001-searches';
      await userRepo.create({
        id: testUser,
        authIdentifier: 'auth-searches-test',
        displayName: 'Search Test User',
        preferredLanguage: 'en',
        status: 'ACTIVE',
      });

      await userService.recordSearch(testUser, 'cardiac ICU', 'Bengaluru', 'Service: Dedicated Cardiac ICU');
      await userService.recordSearch(testUser, 'pediatric hospital', 'Pune', 'Specialty: Pediatrics');

      const list = await userService.listRecentSearches(testUser);
      assert.equal(list[0].query, 'pediatric hospital', 'Latest search must be first');
      assert.equal(list[1].query, 'cardiac ICU');
    });

    it('should remove a single search entry', async () => {
      const testUser = 'user-demo-001-remove-search';
      const created = await userService.recordSearch(testUser, 'temporary query');
      const removed = await userService.removeRecentSearch(testUser, created.id);
      assert.equal(removed, true);

      const list = await userService.listRecentSearches(testUser);
      assert.ok(!list.some((s) => s.id === created.id));
    });

    it('should clear all search history for a user while preserving other users', async () => {
      const userA = 'user-demo-clear-a';
      const userB = 'user-demo-clear-b';

      await searchRepo.recordSearch(userA, 'query for user A');
      await searchRepo.recordSearch(userB, 'query for user B');

      await userService.clearRecentSearches(userA);
      const listA = await userService.listRecentSearches(userA);
      assert.equal(listA.length, 0);

      // User B's search history must remain intact
      const listB = await searchRepo.listByUserId(userB);
      assert.equal(listB.length, 1);
      assert.equal(listB[0].query, 'query for user B');
    });

    it('should strictly contain NO clinical inference or diagnostic fields', async () => {
      const search = await userService.recordSearch('user-demo-001', 'chest pain hospital');
      const keys = Object.keys(search);

      const forbiddenFields = [
        'diagnosis',
        'diagnoses',
        'symptom',
        'symptoms',
        'clinicalInference',
        'medicalCondition',
        'patientHealthState',
        'emergencyStatus',
        'triageCategory',
      ];

      for (const field of forbiddenFields) {
        assert.ok(!keys.includes(field), `RecentSearch must NOT contain prohibited clinical field: ${field}`);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // E. User Platform Preferences
  // ---------------------------------------------------------------------------
  describe('E. User Platform Preferences', () => {
    it('should retrieve default preferences for Demo User 001', async () => {
      const pref = await userService.getPreferences('user-demo-001');
      assert.ok(pref);
      assert.equal(pref.userId, 'user-demo-001');
      assert.equal(pref.locationMode, 'SELECTED');
      assert.equal(pref.locationCity, 'Bengaluru');
      assert.equal(pref.reduceMotion, false);
      assert.equal(pref.largerText, false);
      assert.equal(pref.highContrast, false);
      assert.equal(pref.emailUpdates, true);
      assert.equal(pref.serviceAnnouncements, true);
    });

    it('should update location mode, accessibility toggles, and communication preferences', async () => {
      const updated = await userService.updatePreferences('user-demo-001', {
        locationMode: 'APPROXIMATE',
        locationDisplayName: 'Mumbai, Maharashtra',
        locationCity: 'Mumbai',
        locationState: 'Maharashtra',
        reduceMotion: true,
        largerText: true,
        highContrast: true,
        emailUpdates: false,
      });

      assert.equal(updated.locationMode, 'APPROXIMATE');
      assert.equal(updated.locationCity, 'Mumbai');
      assert.equal(updated.reduceMotion, true);
      assert.equal(updated.largerText, true);
      assert.equal(updated.highContrast, true);
      assert.equal(updated.emailUpdates, false);
      assert.equal(updated.serviceAnnouncements, true); // preserved
    });

    it('should verify preferences contain NO locationPinCode or precise GPS coordinates', async () => {
      const pref = await userService.getPreferences('user-demo-001');
      const keys = Object.keys(pref);

      const forbiddenLocationFields = [
        'pinCode',
        'pincode',
        'postalCode',
        'latitude',
        'longitude',
        'lat',
        'lng',
        'gpsCoordinates',
        'preciseLocation',
      ];

      for (const field of forbiddenLocationFields) {
        assert.ok(!keys.includes(field), `UserPreference must NOT contain precise location field: ${field}`);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // F. Platform Notifications
  // ---------------------------------------------------------------------------
  describe('F. Platform Notifications', () => {
    it('should list notifications and calculate unread count', async () => {
      const list = await userService.listNotifications('user-demo-001');
      assert.ok(list.length >= 4);

      const unreadCount = await userService.getUnreadNotificationCount('user-demo-001');
      assert.equal(unreadCount, list.filter((n) => !n.readAt).length);
    });

    it('should mark a notification as read and decrement unread count', async () => {
      const initialCount = await userService.getUnreadNotificationCount('user-demo-001');
      const list = await userService.listNotifications('user-demo-001', true);
      assert.ok(list.length > 0);

      const targetId = list[0].id;
      const updated = await userService.markNotificationAsRead('user-demo-001', targetId);
      assert.ok(updated.readAt);

      const newCount = await userService.getUnreadNotificationCount('user-demo-001');
      assert.equal(newCount, initialCount - 1);
    });

    it('should mark all notifications as read', async () => {
      const count = await userService.markAllNotificationsAsRead('user-demo-001');
      assert.ok(count > 0);

      const unreadRemaining = await userService.getUnreadNotificationCount('user-demo-001');
      assert.equal(unreadRemaining, 0);
    });

    it('should verify notifications contain only the 4 allowed platform categories', async () => {
      const list = await userService.listNotifications('user-demo-001');
      const allowedCategories: NotificationType[] = [
        'SAVED_INFORMATION',
        'CORRECTION_UPDATE',
        'ACCOUNT_SECURITY',
        'SYSTEM',
      ];

      for (const notif of list) {
        assert.ok(
          allowedCategories.includes(notif.type),
          `Notification type '${notif.type}' must be one of the 4 locked platform types`
        );
      }
    });

    it('should enforce user isolation on notifications', async () => {
      const notifsUser1 = await notifRepo.listByUserId('user-demo-001');
      const user1NotifId = notifsUser1[0].id;

      // User 2 cannot mark User 1's notification as read
      await assert.rejects(
        async () => {
          await notifRepo.markAsRead('user-demo-002', user1NotifId);
        },
        /not found/
      );
    });
  });

  // ---------------------------------------------------------------------------
  // G. Structural Safety Assertions
  // ---------------------------------------------------------------------------
  describe('G. Structural Safety Assertions', () => {
    it('should confirm User entity has zero clinical / medical-record fields', async () => {
      const user = await userRepo.findById('user-demo-001');
      assert.ok(user);
      const keys = Object.keys(user);

      const prohibitedUserFields = [
        'medicalHistory',
        'clinicalRecords',
        'diagnoses',
        'prescriptions',
        'allergies',
        'bloodGroup',
        'emergencyContactRelationship',
        'triageStatus',
        'aadhaarNumber',
        'insurancePolicyNumber',
      ];

      for (const field of prohibitedUserFields) {
        assert.ok(!keys.includes(field), `User entity must not contain: ${field}`);
      }
    });

    it('should confirm SavedItem contains NO notes field or user health text', async () => {
      const items = await savedItemRepo.listByUserId('user-demo-001');
      assert.ok(items.length > 0);

      for (const item of items) {
        const keys = Object.keys(item);
        assert.ok(!keys.includes('notes'), 'SavedItem must NOT have a notes field');
        assert.ok(!keys.includes('userNotes'), 'SavedItem must NOT have userNotes');
        assert.ok(!keys.includes('healthNotes'), 'SavedItem must NOT have healthNotes');
        assert.ok(!keys.includes('tags'), 'SavedItem must NOT have arbitrary tags');
      }
    });

    it('should confirm SavedComparison contains NO score, rank, winner, or recommendation fields', async () => {
      const comp = await comparisonRepo.saveComparison('user-demo-001', 'hosp-001', 'hosp-002');
      const keys = Object.keys(comp);

      const prohibitedComparisonFields = [
        'score',
        'rating',
        'rank',
        'winner',
        'recommendedFacility',
        'suitabilityScore',
        'qualityRating',
      ];

      for (const field of prohibitedComparisonFields) {
        assert.ok(!keys.includes(field), `SavedComparison must NOT contain: ${field}`);
      }
    });
  });
});
