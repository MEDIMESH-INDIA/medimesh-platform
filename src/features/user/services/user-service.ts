/**
 * MEDIMESH INDIA 2.0 — User Application Service
 *
 * Coordinates authentication, referential validation, saved discovery items,
 * strictly-2 facility comparisons, non-diagnostic recent searches, preferences,
 * and informational platform notifications.
 *
 * ARCHITECTURAL SAFETY & INTEGRITY:
 * 1. Enforces the strict 7-step referential validation sequence on every Save.
 * 2. Rejects arbitrary / nonexistent client entity IDs.
 * 3. Enforces strict user-scoping on all mutations and queries.
 * 4. Normalizes facility comparison pairs symmetrically ([A, B] == [B, A]).
 * 5. Strictly non-clinical: zero medical record, diagnosis, or triage data.
 */

import type {
  User,
  UserPreference,
  SavedItem,
  SavedItemResolved,
  SavedComparison,
  SavedComparisonResolved,
  RecentSearch,
  PlatformNotification,
  SavedEntityType,
  ResolvedFacilityComparisonSummary,
} from '../domain/index.ts';
import type {
  IUserRepository,
  IPreferenceRepository,
  ISavedItemRepository,
  ISavedComparisonRepository,
  IRecentSearchRepository,
  INotificationRepository,
} from '../repositories/interfaces.ts';
import {
  syntheticUserRepository,
  syntheticPreferenceRepository,
  syntheticSavedItemRepository,
  syntheticComparisonRepository,
  syntheticSearchRepository,
  syntheticNotificationRepository,
} from '../repositories/synthetic-user-repository.ts';
import {
  defaultSavedEntityResolver,
  type ISavedEntityResolver,
} from './saved-entity-resolver.ts';
import {
  SyntheticRepository,
  type IFacilityRepository,
  type IHospitalRepository,
} from '../../data-architecture/index.ts';

export interface AccountOverviewSummary {
  user: User;
  savedItemsCount: number;
  comparisonsCount: number;
  recentSearchesCount: number;
  unreadNotificationsCount: number;
}

export class UserService {
  private readonly userRepo: IUserRepository;
  private readonly prefRepo: IPreferenceRepository;
  private readonly savedItemRepo: ISavedItemRepository;
  private readonly comparisonRepo: ISavedComparisonRepository;
  private readonly searchRepo: IRecentSearchRepository;
  private readonly notifRepo: INotificationRepository;
  private readonly resolver: ISavedEntityResolver;
  private readonly facilityRepo: IFacilityRepository;
  private readonly hospitalRepo: IHospitalRepository;

  constructor(
    userRepo: IUserRepository = syntheticUserRepository,
    prefRepo: IPreferenceRepository = syntheticPreferenceRepository,
    savedItemRepo: ISavedItemRepository = syntheticSavedItemRepository,
    comparisonRepo: ISavedComparisonRepository = syntheticComparisonRepository,
    searchRepo: IRecentSearchRepository = syntheticSearchRepository,
    notifRepo: INotificationRepository = syntheticNotificationRepository,
    resolver: ISavedEntityResolver = defaultSavedEntityResolver,
    facilityRepo: IFacilityRepository = new SyntheticRepository(),
    hospitalRepo: IHospitalRepository = new SyntheticRepository()
  ) {
    this.userRepo = userRepo;
    this.prefRepo = prefRepo;
    this.savedItemRepo = savedItemRepo;
    this.comparisonRepo = comparisonRepo;
    this.searchRepo = searchRepo;
    this.notifRepo = notifRepo;
    this.resolver = resolver;
    this.facilityRepo = facilityRepo;
    this.hospitalRepo = hospitalRepo;
  }

  // ---------------------------------------------------------------------------
  // Account Overview
  // ---------------------------------------------------------------------------

  async getAccountOverview(userId: string): Promise<AccountOverviewSummary> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error(`[UserService] User not found: ${userId}`);

    const [saved, comparisons, searches, unreadNotifs] = await Promise.all([
      this.savedItemRepo.listByUserId(userId),
      this.comparisonRepo.listByUserId(userId),
      this.searchRepo.listByUserId(userId),
      this.notifRepo.getUnreadCount(userId),
    ]);

    return {
      user,
      savedItemsCount: saved.length,
      comparisonsCount: comparisons.length,
      recentSearchesCount: searches.length,
      unreadNotificationsCount: unreadNotifs,
    };
  }

  async getUser(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }

  async updateProfile(
    userId: string,
    updates: { displayName?: string; preferredLanguage?: string }
  ): Promise<User> {
    return this.userRepo.updateProfile(userId, updates);
  }

  // ---------------------------------------------------------------------------
  // Saved Items (With 7-Step Referential Integrity)
  // ---------------------------------------------------------------------------

  /**
   * Saves a public healthcare item after validating referential existence.
   * Rejects arbitrary client entity IDs.
   */
  async saveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<SavedItem> {
    // 1 & 2. Validate user and entity type
    if (!userId) throw new Error('[UserService] User ID is required');
    const validTypes: SavedEntityType[] = [
      'FACILITY',
      'HOSPITAL',
      'SPECIALTY',
      'DOCTOR',
      'SERVICE',
      'SCHEME',
      'TARIFF',
      'AMBULANCE',
      'PHARMACY',
      'HOME_HEALTHCARE',
    ];
    if (!validTypes.includes(entityType)) {
      throw new Error(`[UserService] Unsupported entity type: ${entityType}`);
    }

    // 3, 4, 5. Validate entity exists in domain repositories
    const exists = await this.resolver.exists(entityType, entityId);
    if (!exists) {
      throw new Error(`[UserService] Referential integrity error: ${entityType} '${entityId}' not found in discovery records`);
    }

    // 6 & 7. Check uniqueness & persist
    return this.savedItemRepo.saveItem(userId, entityType, entityId);
  }

  async unsaveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean> {
    return this.savedItemRepo.unsaveItem(userId, entityType, entityId);
  }

  async isItemSaved(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean> {
    return this.savedItemRepo.isSaved(userId, entityType, entityId);
  }

  async listSavedItemsResolved(userId: string, entityType?: SavedEntityType): Promise<SavedItemResolved[]> {
    const rawItems = await this.savedItemRepo.listByUserId(userId, entityType);
    return Promise.all(rawItems.map((item) => this.resolver.resolve(item)));
  }

  // ---------------------------------------------------------------------------
  // Saved Comparisons (Strictly 2 Facilities, Normalized)
  // ---------------------------------------------------------------------------

  async saveComparison(userId: string, entityAId: string, entityBId: string): Promise<SavedComparison> {
    if (!userId) throw new Error('[UserService] User ID is required');
    if (!entityAId || !entityBId) throw new Error('[UserService] Two facility IDs are required for comparison');
    if (entityAId === entityBId) throw new Error('[UserService] Cannot compare a facility to itself');

    // Confirm both facilities exist
    const [facA, facB] = await Promise.all([
      this.facilityRepo.findById(entityAId) || this.facilityRepo.findBySlug(entityAId),
      this.facilityRepo.findById(entityBId) || this.facilityRepo.findBySlug(entityBId),
    ]);

    if (!facA) throw new Error(`[UserService] Comparison facility A not found: ${entityAId}`);
    if (!facB) throw new Error(`[UserService] Comparison facility B not found: ${entityBId}`);

    return this.comparisonRepo.saveComparison(userId, facA.id, facB.id);
  }

  async removeComparison(userId: string, comparisonId: string): Promise<boolean> {
    return this.comparisonRepo.removeComparison(userId, comparisonId);
  }

  async listComparisonsResolved(userId: string): Promise<SavedComparisonResolved[]> {
    const comparisons = await this.comparisonRepo.listByUserId(userId);

    const resolved = await Promise.all(
      comparisons.map(async (comp) => {
        const [facA, facB] = await Promise.all([
          this.facilityRepo.findById(comp.entityAId),
          this.facilityRepo.findById(comp.entityBId),
        ]);

        const [profA, profB] = await Promise.all([
          facA ? this.hospitalRepo.getProfileByFacilityId(facA.id) : null,
          facB ? this.hospitalRepo.getProfileByFacilityId(facB.id) : null,
        ]);

        const buildSummary = (f: typeof facA, p: typeof profA): ResolvedFacilityComparisonSummary => {
          if (!f) {
            return {
              id: 'unknown',
              name: 'Unavailable Facility Record',
              category: 'Facility',
              city: 'Unknown',
              state: 'Unknown',
              verificationState: 'NOT_CONFIRMED',
              slug: '#',
              isDemo: true,
            };
          }

          return {
            id: f.id,
            name: f.name,
            category: f.category,
            city: f.location.city,
            state: f.location.state,
            verificationState: f.verificationState,
            slug: `/facilities/${f.slug}`,
            operatingHours: f.operatingHours,
            primaryPhone: f.contact.primaryPhone,
            isDemo: f.dataOrigin === 'SYNTHETIC_DEMO',
            bedCapacityTotal: p?.bedCapacityTotal,
            icuBedCapacity: p?.icuBedCapacity,
            emergencyOperational: p?.emergencyIntakeOperational,
          };
        };

        return {
          comparison: comp,
          facilityA: buildSummary(facA, profA),
          facilityB: buildSummary(facB, profB),
        };
      })
    );

    return resolved;
  }

  // ---------------------------------------------------------------------------
  // Recent Searches (Non-Diagnostic)
  // ---------------------------------------------------------------------------

  async recordSearch(
    userId: string,
    query: string,
    selectedLocation?: string,
    interpretedIntent?: string
  ): Promise<RecentSearch> {
    return this.searchRepo.recordSearch(userId, query, selectedLocation, interpretedIntent);
  }

  async listRecentSearches(userId: string, limit: number = 20): Promise<RecentSearch[]> {
    return this.searchRepo.listByUserId(userId, limit);
  }

  async removeRecentSearch(userId: string, searchId: string): Promise<boolean> {
    return this.searchRepo.removeSearch(userId, searchId);
  }

  async clearRecentSearches(userId: string): Promise<boolean> {
    return this.searchRepo.clearHistory(userId);
  }

  // ---------------------------------------------------------------------------
  // Preferences (No GPS / No PinCode)
  // ---------------------------------------------------------------------------

  async getPreferences(userId: string): Promise<UserPreference> {
    const existing = await this.prefRepo.getByUserId(userId);
    if (existing) return existing;

    // Return default preferences
    return {
      userId,
      locationMode: 'SELECTED',
      locationDisplayName: 'Bengaluru, Karnataka',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      reduceMotion: false,
      largerText: false,
      highContrast: false,
      emailUpdates: true,
      serviceAnnouncements: true,
      updatedAt: new Date().toISOString(),
    };
  }

  async updatePreferences(userId: string, updates: Partial<UserPreference>): Promise<UserPreference> {
    const current = await this.getPreferences(userId);
    const updated: UserPreference = {
      ...current,
      ...updates,
      userId, // Ensure immutable userId
      updatedAt: new Date().toISOString(),
    };
    return this.prefRepo.upsert(updated);
  }

  // ---------------------------------------------------------------------------
  // Platform Notifications (Informational Only)
  // ---------------------------------------------------------------------------

  async listNotifications(userId: string, unreadOnly: boolean = false): Promise<PlatformNotification[]> {
    return this.notifRepo.listByUserId(userId, unreadOnly);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notifRepo.getUnreadCount(userId);
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<PlatformNotification> {
    return this.notifRepo.markAsRead(userId, notificationId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    return this.notifRepo.markAllAsRead(userId);
  }
}

/** Singleton instance backed by synthetic repositories */
export const defaultUserService = new UserService();
