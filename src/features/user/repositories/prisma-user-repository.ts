/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MEDIMESH INDIA 2.0 — PostgreSQL / Prisma User Repositories
 *
 * Implements persistent repository abstractions for Phase 06 User System:
 * - PrismaUserRepository: IUserRepository
 * - PrismaPreferenceRepository: IPreferenceRepository
 * - PrismaSavedItemRepository: ISavedItemRepository
 * - PrismaComparisonRepository: ISavedComparisonRepository
 * - PrismaRecentSearchRepository: IRecentSearchRepository
 * - PrismaNotificationRepository: INotificationRepository
 * - PrismaUserCompositeRepository: Bundled facade
 *
 * HARD MULTI-TENANT & PRIVACY BOUNDARIES:
 * - Strict userId scoping on ALL queries and mutations.
 * - Symmetrical pair normalization on facility comparisons (smaller ID first).
 * - Zero clinical fields, no patient medical records, no precise GPS.
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

export interface PrismaUserClientLike {
  user: any;
  userPreference: any;
  savedItem: any;
  savedComparison: any;
  recentSearch: any;
  platformNotification: any;
}

// ---------------------------------------------------------------------------
// 1. Prisma User Repository (IUserRepository)
// ---------------------------------------------------------------------------

export class PrismaUserRepository implements IUserRepository {
  private prisma: PrismaUserClientLike;

  constructor(prisma: PrismaUserClientLike) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.mapUser(record) : null;
  }

  async findByAuthIdentifier(authIdentifier: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { authIdentifier } });
    return record ? this.mapUser(record) : null;
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        id: user.id,
        authIdentifier: user.authIdentifier,
        displayName: user.displayName,
        email: user.email ?? null,
        preferredLanguage: user.preferredLanguage,
        status: user.status,
      },
    });
    return this.mapUser(record);
  }

  async updateProfile(
    id: string,
    updates: { displayName?: string; preferredLanguage?: string }
  ): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updates.displayName ? { displayName: updates.displayName } : {}),
        ...(updates.preferredLanguage ? { preferredLanguage: updates.preferredLanguage } : {}),
      },
    });
    return this.mapUser(record);
  }

  async deactivate(id: string): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id },
      data: { status: 'DEACTIVATED' },
    });
    return this.mapUser(record);
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      authIdentifier: row.authIdentifier,
      displayName: row.displayName,
      email: row.email ?? undefined,
      preferredLanguage: row.preferredLanguage,
      status: row.status,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }
}

// ---------------------------------------------------------------------------
// 2. Prisma Preference Repository (IPreferenceRepository)
// ---------------------------------------------------------------------------

export class PrismaPreferenceRepository implements IPreferenceRepository {
  private prisma: PrismaUserClientLike;

  constructor(prisma: PrismaUserClientLike) {
    this.prisma = prisma;
  }

  async getByUserId(userId: string): Promise<UserPreference | null> {
    const record = await this.prisma.userPreference.findUnique({ where: { userId } });
    return record ? this.mapPreference(record) : null;
  }

  async upsert(preference: UserPreference): Promise<UserPreference> {
    const record = await this.prisma.userPreference.upsert({
      where: { userId: preference.userId },
      create: {
        userId: preference.userId,
        locationMode: preference.locationMode,
        locationDisplayName: preference.locationDisplayName ?? null,
        locationCity: preference.locationCity ?? null,
        locationState: preference.locationState ?? null,
        reduceMotion: preference.reduceMotion,
        largerText: preference.largerText,
        highContrast: preference.highContrast,
        emailUpdates: preference.emailUpdates,
        serviceAnnouncements: preference.serviceAnnouncements,
      },
      update: {
        locationMode: preference.locationMode,
        locationDisplayName: preference.locationDisplayName ?? null,
        locationCity: preference.locationCity ?? null,
        locationState: preference.locationState ?? null,
        reduceMotion: preference.reduceMotion,
        largerText: preference.largerText,
        highContrast: preference.highContrast,
        emailUpdates: preference.emailUpdates,
        serviceAnnouncements: preference.serviceAnnouncements,
      },
    });
    return this.mapPreference(record);
  }

  private mapPreference(row: any): UserPreference {
    return {
      userId: row.userId,
      locationMode: row.locationMode,
      locationDisplayName: row.locationDisplayName ?? undefined,
      locationCity: row.locationCity ?? undefined,
      locationState: row.locationState ?? undefined,
      reduceMotion: Boolean(row.reduceMotion),
      largerText: Boolean(row.largerText),
      highContrast: Boolean(row.highContrast),
      emailUpdates: Boolean(row.emailUpdates),
      serviceAnnouncements: Boolean(row.serviceAnnouncements),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Prisma Saved Item Repository (ISavedItemRepository)
// ---------------------------------------------------------------------------

export class PrismaSavedItemRepository implements ISavedItemRepository {
  private prisma: PrismaUserClientLike;

  constructor(prisma: PrismaUserClientLike) {
    this.prisma = prisma;
  }

  async listByUserId(userId: string, entityType?: SavedEntityType): Promise<SavedItem[]> {
    const records = await this.prisma.savedItem.findMany({
      where: {
        userId,
        ...(entityType ? { entityType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapSavedItem(r));
  }

  async saveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<SavedItem> {
    const record = await this.prisma.savedItem.upsert({
      where: {
        userId_entityType_entityId: {
          userId,
          entityType,
          entityId,
        },
      },
      create: {
        userId,
        entityType,
        entityId,
      },
      update: {},
    });
    return this.mapSavedItem(record);
  }

  async unsaveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean> {
    try {
      await this.prisma.savedItem.delete({
        where: {
          userId_entityType_entityId: {
            userId,
            entityType,
            entityId,
          },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async isSaved(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean> {
    const count = await this.prisma.savedItem.count({
      where: {
        userId,
        entityType,
        entityId,
      },
    });
    return count > 0;
  }

  private mapSavedItem(row: any): SavedItem {
    return {
      id: row.id,
      userId: row.userId,
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }
}

// ---------------------------------------------------------------------------
// 4. Prisma Saved Comparison Repository (ISavedComparisonRepository)
// ---------------------------------------------------------------------------

export class PrismaComparisonRepository implements ISavedComparisonRepository {
  private prisma: PrismaUserClientLike;

  constructor(prisma: PrismaUserClientLike) {
    this.prisma = prisma;
  }

  async listByUserId(userId: string): Promise<SavedComparison[]> {
    const records = await this.prisma.savedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapComparison(r));
  }

  async saveComparison(userId: string, entityAId: string, entityBId: string): Promise<SavedComparison> {
    if (entityAId === entityBId) {
      throw new Error('[PrismaComparisonRepository] Cannot compare an entity to itself');
    }

    // Canonical symmetrical normalization: smaller ID first
    const [normA, normB] = entityAId < entityBId ? [entityAId, entityBId] : [entityBId, entityAId];

    const record = await this.prisma.savedComparison.upsert({
      where: {
        userId_entityAId_entityBId: {
          userId,
          entityAId: normA,
          entityBId: normB,
        },
      },
      create: {
        userId,
        entityType: 'FACILITY',
        entityAId: normA,
        entityBId: normB,
      },
      update: {},
    });
    return this.mapComparison(record);
  }

  async removeComparison(userId: string, comparisonId: string): Promise<boolean> {
    try {
      const result = await this.prisma.savedComparison.deleteMany({
        where: {
          id: comparisonId,
          userId,
        },
      });
      return result.count > 0;
    } catch {
      return false;
    }
  }

  private mapComparison(row: any): SavedComparison {
    return {
      id: row.id,
      userId: row.userId,
      entityType: 'FACILITY',
      entityAId: row.entityAId,
      entityBId: row.entityBId,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }
}

// ---------------------------------------------------------------------------
// 5. Prisma Recent Search Repository (IRecentSearchRepository)
// ---------------------------------------------------------------------------

export class PrismaRecentSearchRepository implements IRecentSearchRepository {
  private prisma: PrismaUserClientLike;

  constructor(prisma: PrismaUserClientLike) {
    this.prisma = prisma;
  }

  async listByUserId(userId: string, limit = 20): Promise<RecentSearch[]> {
    const records = await this.prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return records.map((r: any) => this.mapSearch(r));
  }

  async recordSearch(
    userId: string,
    query: string,
    selectedLocation?: string,
    interpretedIntent?: string
  ): Promise<RecentSearch> {
    const trimmed = query.trim();
    if (!trimmed) throw new Error('[PrismaRecentSearchRepository] Search query cannot be empty');

    const record = await this.prisma.recentSearch.create({
      data: {
        userId,
        query: trimmed,
        selectedLocation: selectedLocation?.trim() || null,
        interpretedIntent: interpretedIntent?.trim() || null,
      },
    });
    return this.mapSearch(record);
  }

  async removeSearch(userId: string, searchId: string): Promise<boolean> {
    try {
      const res = await this.prisma.recentSearch.deleteMany({
        where: { id: searchId, userId },
      });
      return res.count > 0;
    } catch {
      return false;
    }
  }

  async clearHistory(userId: string): Promise<boolean> {
    try {
      await this.prisma.recentSearch.deleteMany({
        where: { userId },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapSearch(row: any): RecentSearch {
    return {
      id: row.id,
      userId: row.userId,
      query: row.query,
      interpretedIntent: row.interpretedIntent ?? undefined,
      selectedLocation: row.selectedLocation ?? undefined,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    };
  }
}

// ---------------------------------------------------------------------------
// 6. Prisma Notification Repository (INotificationRepository)
// ---------------------------------------------------------------------------

export class PrismaNotificationRepository implements INotificationRepository {
  private prisma: PrismaUserClientLike;

  constructor(prisma: PrismaUserClientLike) {
    this.prisma = prisma;
  }

  async listByUserId(userId: string, unreadOnly = false): Promise<PlatformNotification[]> {
    const records = await this.prisma.platformNotification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapNotification(r));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.platformNotification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<PlatformNotification> {
    const record = await this.prisma.platformNotification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });
    return this.mapNotification(record);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const res = await this.prisma.platformNotification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
    return res.count;
  }

  async createNotification(
    notification: Omit<PlatformNotification, 'id' | 'createdAt'>
  ): Promise<PlatformNotification> {
    const record = await this.prisma.platformNotification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedEntityType: notification.relatedEntityType ?? null,
        relatedEntityId: notification.relatedEntityId ?? null,
        expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : null,
      },
    });
    return this.mapNotification(record);
  }

  private mapNotification(row: any): PlatformNotification {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      message: row.message,
      relatedEntityType: row.relatedEntityType ?? undefined,
      relatedEntityId: row.relatedEntityId ?? undefined,
      readAt: row.readAt ? (row.readAt instanceof Date ? row.readAt.toISOString() : String(row.readAt)) : undefined,
      expiresAt: row.expiresAt ? (row.expiresAt instanceof Date ? row.expiresAt.toISOString() : String(row.expiresAt)) : undefined,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    };
  }
}

// ---------------------------------------------------------------------------
// Composite Prisma Repository
// ---------------------------------------------------------------------------

export class PrismaUserCompositeRepository {
  public readonly users: PrismaUserRepository;
  public readonly preferences: PrismaPreferenceRepository;
  public readonly savedItems: PrismaSavedItemRepository;
  public readonly comparisons: PrismaComparisonRepository;
  public readonly searches: PrismaRecentSearchRepository;
  public readonly notifications: PrismaNotificationRepository;

  constructor(prisma: PrismaUserClientLike) {
    this.users = new PrismaUserRepository(prisma);
    this.preferences = new PrismaPreferenceRepository(prisma);
    this.savedItems = new PrismaSavedItemRepository(prisma);
    this.comparisons = new PrismaComparisonRepository(prisma);
    this.searches = new PrismaRecentSearchRepository(prisma);
    this.notifications = new PrismaNotificationRepository(prisma);
  }
}
