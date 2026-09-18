/**
 * MEDIMESH INDIA 2.0 — Synthetic User & Personal Discovery Repositories
 *
 * Implements in-memory repository abstractions for Phase 06 User System:
 * - SyntheticUserStore: Shared memory store initialized with canonical synthetic demo data
 * - SyntheticUserRepository: IUserRepository
 * - SyntheticPreferenceRepository: IPreferenceRepository
 * - SyntheticSavedItemRepository: ISavedItemRepository
 * - SyntheticComparisonRepository: ISavedComparisonRepository
 * - SyntheticRecentSearchRepository: IRecentSearchRepository
 * - SyntheticNotificationRepository: INotificationRepository
 * - SyntheticUserCompositeRepository: Bundled facade for multi-tenant isolation and convenience
 *
 * STRICT SAFETY & INTEGRITY:
 * - Only uses synthetic demo identities ("Demo User 001", "Demo User 002")
 * - Strictly references existing Phase 04/05 synthetic healthcare records
 * - No clinical fields, no patient medical records, no precise GPS
 * - Symmetrical pair normalization on facility comparisons
 */

import type {
  User,
  UserPreference,
  SavedItem,
  SavedComparison,
  RecentSearch,
  PlatformNotification,
  SavedEntityType,
} from '../domain/index.ts';
import type {
  IUserRepository,
  IPreferenceRepository,
  ISavedItemRepository,
  ISavedComparisonRepository,
  IRecentSearchRepository,
  INotificationRepository,
} from './interfaces.ts';
export type { INotificationRepository };

// ---------------------------------------------------------------------------
// Shared Synthetic Memory Store
// ---------------------------------------------------------------------------

export class SyntheticUserStore {
  public users: Map<string, User> = new Map();
  public preferences: Map<string, UserPreference> = new Map();
  public savedItems: Map<string, SavedItem> = new Map();
  public comparisons: Map<string, SavedComparison> = new Map();
  public searches: RecentSearch[] = [];
  public notifications: Map<string, PlatformNotification> = new Map();

  constructor() {
    this.seed();
  }

  seed(): void {
    const now = new Date().toISOString();

    // 1. Synthetic Demo User 001
    const user1: User = {
      id: 'user-demo-001',
      authIdentifier: 'auth-demo-001',
      displayName: 'Demo User 001',
      preferredLanguage: 'en',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user1.id, user1);

    const pref1: UserPreference = {
      userId: user1.id,
      locationMode: 'SELECTED',
      locationDisplayName: 'Bengaluru, Karnataka',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      reduceMotion: false,
      largerText: false,
      highContrast: false,
      emailUpdates: true,
      serviceAnnouncements: true,
      updatedAt: now,
    };
    this.preferences.set(user1.id, pref1);

    // Seeded saved items for User 1 (existing Phase 04/05 records)
    const seedSaves1: Array<{ type: SavedEntityType; id: string }> = [
      { type: 'FACILITY', id: 'hosp-001' },
      { type: 'SPECIALTY', id: 'spec-001' },
      { type: 'DOCTOR', id: 'doc-001' },
      { type: 'SCHEME', id: 'sch-pmjay' },
      { type: 'TARIFF', id: 'tar-001' },
    ];

    seedSaves1.forEach((item, index) => {
      const savedId = `save-demo-001-${index + 1}`;
      this.savedItems.set(savedId, {
        id: savedId,
        userId: user1.id,
        entityType: item.type,
        entityId: item.id,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Seeded facility comparison for User 1 (strictly 2 facilities)
    const comp1: SavedComparison = {
      id: 'comp-demo-001-1',
      userId: user1.id,
      entityType: 'FACILITY',
      entityAId: 'hosp-001',
      entityBId: 'hosp-002',
      createdAt: now,
      updatedAt: now,
    };
    this.comparisons.set(comp1.id, comp1);

    // Seeded recent discovery searches for User 1 (non-diagnostic)
    this.searches.push(
      {
        id: 'search-demo-001-1',
        userId: user1.id,
        query: 'cardiac ICU',
        interpretedIntent: 'Service: Dedicated Cardiac ICU',
        selectedLocation: 'Bengaluru',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'search-demo-001-2',
        userId: user1.id,
        query: 'cardiologist near me',
        interpretedIntent: 'Specialty: Cardiology',
        selectedLocation: 'Bengaluru',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'search-demo-001-3',
        userId: user1.id,
        query: 'PM-JAY hospitals',
        interpretedIntent: 'Scheme: Ayushman Bharat (PM-JAY)',
        selectedLocation: 'Bengaluru',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      }
    );

    // Seeded informational platform notifications for User 1
    const notifs1: PlatformNotification[] = [
      {
        id: 'notif-demo-001-1',
        userId: user1.id,
        type: 'SAVED_INFORMATION',
        title: 'Saved Information Update',
        message: 'Operating hours for a healthcare facility saved to your account were recently confirmed.',
        relatedEntityType: 'FACILITY',
        relatedEntityId: 'hosp-001',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif-demo-001-2',
        userId: user1.id,
        type: 'CORRECTION_UPDATE',
        title: 'Correction Submission Update',
        message: 'A public information correction submission you reported has been placed under editorial review.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'notif-demo-001-3',
        userId: user1.id,
        type: 'ACCOUNT_SECURITY',
        title: 'Preferences Updated',
        message: 'Your platform accessibility and discovery preferences were updated successfully.',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: 'notif-demo-001-4',
        userId: user1.id,
        type: 'SYSTEM',
        title: 'Platform Maintenance Notice',
        message: 'Scheduled directory indexing complete. Public healthcare discovery records updated.',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
      },
    ];

    notifs1.forEach((n) => this.notifications.set(n.id, n));

    // 2. Synthetic Demo User 002 (for multi-tenant isolation validation)
    const user2: User = {
      id: 'user-demo-002',
      authIdentifier: 'auth-demo-002',
      displayName: 'Demo User 002',
      preferredLanguage: 'en',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user2.id, user2);

    const pref2: UserPreference = {
      userId: user2.id,
      locationMode: 'SELECTED',
      locationDisplayName: 'Pune, Maharashtra',
      locationCity: 'Pune',
      locationState: 'Maharashtra',
      reduceMotion: true,
      largerText: false,
      highContrast: false,
      emailUpdates: false,
      serviceAnnouncements: true,
      updatedAt: now,
    };
    this.preferences.set(user2.id, pref2);

    // Seeded saves for User 2
    const saveUser2: SavedItem = {
      id: 'save-demo-002-1',
      userId: user2.id,
      entityType: 'FACILITY',
      entityId: 'hosp-003',
      createdAt: now,
      updatedAt: now,
    };
    this.savedItems.set(saveUser2.id, saveUser2);

    // Seeded notification for User 2
    const notifUser2: PlatformNotification = {
      id: 'notif-demo-002-1',
      userId: user2.id,
      type: 'SYSTEM',
      title: 'Welcome to MEDIMESH',
      message: 'Your personal discovery preferences and public saved items are active.',
      createdAt: now,
    };
    this.notifications.set(notifUser2.id, notifUser2);
  }
}

export const defaultSyntheticStore = new SyntheticUserStore();

// ---------------------------------------------------------------------------
// 1. Synthetic User Repository (IUserRepository)
// ---------------------------------------------------------------------------

export class SyntheticUserRepository implements IUserRepository {
  private store: SyntheticUserStore;

  constructor(store: SyntheticUserStore = defaultSyntheticStore) {
    this.store = store;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.store.users.get(id);
    return user ? { ...user } : null;
  }

  async findByAuthIdentifier(authIdentifier: string): Promise<User | null> {
    for (const user of this.store.users.values()) {
      if (user.authIdentifier === authIdentifier) {
        return { ...user };
      }
    }
    return null;
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const created: User = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    this.store.users.set(created.id, created);
    return { ...created };
  }

  async updateProfile(
    id: string,
    updates: { displayName?: string; preferredLanguage?: string }
  ): Promise<User> {
    const user = this.store.users.get(id);
    if (!user) throw new Error(`User not found: ${id}`);

    const updated: User = {
      ...user,
      ...(updates.displayName ? { displayName: updates.displayName } : {}),
      ...(updates.preferredLanguage ? { preferredLanguage: updates.preferredLanguage } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.store.users.set(id, updated);
    return { ...updated };
  }

  async deactivate(id: string): Promise<User> {
    const user = this.store.users.get(id);
    if (!user) throw new Error(`User not found: ${id}`);

    const updated: User = {
      ...user,
      status: 'DEACTIVATED',
      updatedAt: new Date().toISOString(),
    };
    this.store.users.set(id, updated);
    return { ...updated };
  }
}

// ---------------------------------------------------------------------------
// 2. Synthetic Preference Repository (IPreferenceRepository)
// ---------------------------------------------------------------------------

export class SyntheticPreferenceRepository implements IPreferenceRepository {
  private store: SyntheticUserStore;

  constructor(store: SyntheticUserStore = defaultSyntheticStore) {
    this.store = store;
  }

  async getByUserId(userId: string): Promise<UserPreference | null> {
    const pref = this.store.preferences.get(userId);
    return pref ? { ...pref } : null;
  }

  async upsert(preference: UserPreference): Promise<UserPreference> {
    const updated: UserPreference = {
      ...preference,
      updatedAt: new Date().toISOString(),
    };
    this.store.preferences.set(preference.userId, updated);
    return { ...updated };
  }
}

// ---------------------------------------------------------------------------
// 3. Synthetic Saved Item Repository (ISavedItemRepository)
// ---------------------------------------------------------------------------

export class SyntheticSavedItemRepository implements ISavedItemRepository {
  private store: SyntheticUserStore;

  constructor(store: SyntheticUserStore = defaultSyntheticStore) {
    this.store = store;
  }

  async listByUserId(userId: string, entityType?: SavedEntityType): Promise<SavedItem[]> {
    const results: SavedItem[] = [];
    for (const item of this.store.savedItems.values()) {
      if (item.userId === userId) {
        if (!entityType || item.entityType === entityType) {
          results.push({ ...item });
        }
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async saveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<SavedItem> {
    // Check duplicate
    for (const item of this.store.savedItems.values()) {
      if (item.userId === userId && item.entityType === entityType && item.entityId === entityId) {
        return { ...item };
      }
    }

    const now = new Date().toISOString();
    const id = `save-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const saved: SavedItem = {
      id,
      userId,
      entityType,
      entityId,
      createdAt: now,
      updatedAt: now,
    };
    this.store.savedItems.set(id, saved);
    return { ...saved };
  }

  async unsaveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean> {
    for (const [key, item] of this.store.savedItems.entries()) {
      if (item.userId === userId && item.entityType === entityType && item.entityId === entityId) {
        this.store.savedItems.delete(key);
        return true;
      }
    }
    return false;
  }

  async isSaved(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean> {
    for (const item of this.store.savedItems.values()) {
      if (item.userId === userId && item.entityType === entityType && item.entityId === entityId) {
        return true;
      }
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// 4. Synthetic Saved Comparison Repository (ISavedComparisonRepository)
// ---------------------------------------------------------------------------

export class SyntheticComparisonRepository implements ISavedComparisonRepository {
  private store: SyntheticUserStore;

  constructor(store: SyntheticUserStore = defaultSyntheticStore) {
    this.store = store;
  }

  async listByUserId(userId: string): Promise<SavedComparison[]> {
    const results: SavedComparison[] = [];
    for (const comp of this.store.comparisons.values()) {
      if (comp.userId === userId) {
        results.push({ ...comp });
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async saveComparison(userId: string, entityAId: string, entityBId: string): Promise<SavedComparison> {
    if (entityAId === entityBId) {
      throw new Error('[SyntheticComparisonRepository] Cannot compare an entity to itself');
    }

    // Canonical symmetrical normalization: smaller ID first
    const [normA, normB] = entityAId < entityBId ? [entityAId, entityBId] : [entityBId, entityAId];

    // Check duplicate logical pair for this user
    for (const comp of this.store.comparisons.values()) {
      if (comp.userId === userId && comp.entityAId === normA && comp.entityBId === normB) {
        return { ...comp };
      }
    }

    const now = new Date().toISOString();
    const id = `comp-${userId}-${Date.now()}`;
    const comp: SavedComparison = {
      id,
      userId,
      entityType: 'FACILITY',
      entityAId: normA,
      entityBId: normB,
      createdAt: now,
      updatedAt: now,
    };
    this.store.comparisons.set(id, comp);
    return { ...comp };
  }

  async removeComparison(userId: string, comparisonId: string): Promise<boolean> {
    const comp = this.store.comparisons.get(comparisonId);
    if (!comp || comp.userId !== userId) {
      return false;
    }
    return this.store.comparisons.delete(comparisonId);
  }
}

// ---------------------------------------------------------------------------
// 5. Synthetic Recent Search Repository (IRecentSearchRepository)
// ---------------------------------------------------------------------------

export class SyntheticRecentSearchRepository implements IRecentSearchRepository {
  private store: SyntheticUserStore;

  constructor(store: SyntheticUserStore = defaultSyntheticStore) {
    this.store = store;
  }

  async listByUserId(userId: string, limit = 20): Promise<RecentSearch[]> {
    return this.store.searches
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((s) => ({ ...s }));
  }

  async recordSearch(
    userId: string,
    query: string,
    selectedLocation?: string,
    interpretedIntent?: string
  ): Promise<RecentSearch> {
    const trimmed = query.trim();
    if (!trimmed) throw new Error('[SyntheticRecentSearchRepository] Search query cannot be empty');

    const search: RecentSearch = {
      id: `search-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      query: trimmed,
      selectedLocation: selectedLocation?.trim() || undefined,
      interpretedIntent: interpretedIntent?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // Prepend to maintain newest-first
    this.store.searches.unshift(search);
    return { ...search };
  }

  async removeSearch(userId: string, searchId: string): Promise<boolean> {
    const index = this.store.searches.findIndex((s) => s.id === searchId && s.userId === userId);
    if (index === -1) return false;
    this.store.searches.splice(index, 1);
    return true;
  }

  async clearHistory(userId: string): Promise<boolean> {
    this.store.searches = this.store.searches.filter((s) => s.userId !== userId);
    return true;
  }
}

// ---------------------------------------------------------------------------
// 6. Synthetic Notification Repository (INotificationRepository)
// ---------------------------------------------------------------------------

export class SyntheticNotificationRepository implements INotificationRepository {
  private store: SyntheticUserStore;

  constructor(store: SyntheticUserStore = defaultSyntheticStore) {
    this.store = store;
  }

  async listByUserId(userId: string, unreadOnly = false): Promise<PlatformNotification[]> {
    const list: PlatformNotification[] = [];
    for (const notif of this.store.notifications.values()) {
      if (notif.userId === userId) {
        if (!unreadOnly || !notif.readAt) {
          list.push({ ...notif });
        }
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadCount(userId: string): Promise<number> {
    let count = 0;
    for (const notif of this.store.notifications.values()) {
      if (notif.userId === userId && !notif.readAt) {
        count++;
      }
    }
    return count;
  }

  async markAsRead(userId: string, notificationId: string): Promise<PlatformNotification> {
    const notif = this.store.notifications.get(notificationId);
    if (!notif || notif.userId !== userId) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    const updated: PlatformNotification = {
      ...notif,
      readAt: notif.readAt ?? new Date().toISOString(),
    };
    this.store.notifications.set(notificationId, updated);
    return { ...updated };
  }

  async markAllAsRead(userId: string): Promise<number> {
    let updatedCount = 0;
    const now = new Date().toISOString();
    for (const [id, notif] of this.store.notifications.entries()) {
      if (notif.userId === userId && !notif.readAt) {
        this.store.notifications.set(id, { ...notif, readAt: now });
        updatedCount++;
      }
    }
    return updatedCount;
  }

  async createNotification(
    notification: Omit<PlatformNotification, 'id' | 'createdAt'>
  ): Promise<PlatformNotification> {
    const now = new Date().toISOString();
    const id = `notif-${notification.userId}-${Date.now()}`;
    const created: PlatformNotification = {
      ...notification,
      id,
      createdAt: now,
    };
    this.store.notifications.set(id, created);
    return { ...created };
  }
}

// ---------------------------------------------------------------------------
// Composite Repository & Global Singletons
// ---------------------------------------------------------------------------

export class SyntheticUserCompositeRepository {
  public readonly store: SyntheticUserStore;
  public readonly users: SyntheticUserRepository;
  public readonly preferences: SyntheticPreferenceRepository;
  public readonly savedItems: SyntheticSavedItemRepository;
  public readonly comparisons: SyntheticComparisonRepository;
  public readonly searches: SyntheticRecentSearchRepository;
  public readonly notifications: SyntheticNotificationRepository;

  constructor(store: SyntheticUserStore = new SyntheticUserStore()) {
    this.store = store;
    this.users = new SyntheticUserRepository(store);
    this.preferences = new SyntheticPreferenceRepository(store);
    this.savedItems = new SyntheticSavedItemRepository(store);
    this.comparisons = new SyntheticComparisonRepository(store);
    this.searches = new SyntheticRecentSearchRepository(store);
    this.notifications = new SyntheticNotificationRepository(store);
  }
}

export const syntheticUserComposite = new SyntheticUserCompositeRepository(defaultSyntheticStore);
export const syntheticUserRepository = syntheticUserComposite.users;
export const syntheticPreferenceRepository = syntheticUserComposite.preferences;
export const syntheticSavedItemRepository = syntheticUserComposite.savedItems;
export const syntheticComparisonRepository = syntheticUserComposite.comparisons;
export const syntheticSearchRepository = syntheticUserComposite.searches;
export const syntheticNotificationRepository = syntheticUserComposite.notifications;
