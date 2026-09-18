/**
 * MEDIMESH INDIA 2.0 — User Repository Interfaces
 *
 * Domain repository contracts establishing clean abstraction boundaries for
 * user accounts, preferences, saved items, facility comparisons, recent searches,
 * and informational platform notifications.
 *
 * All operations are strictly user-scoped to prevent unauthorized cross-tenant access.
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

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByAuthIdentifier(authIdentifier: string): Promise<User | null>;
  create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  updateProfile(id: string, updates: { displayName?: string; preferredLanguage?: string }): Promise<User>;
  deactivate(id: string): Promise<User>;
}

export interface IPreferenceRepository {
  getByUserId(userId: string): Promise<UserPreference | null>;
  upsert(preference: UserPreference): Promise<UserPreference>;
}

export interface ISavedItemRepository {
  listByUserId(userId: string, entityType?: SavedEntityType): Promise<SavedItem[]>;
  saveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<SavedItem>;
  unsaveItem(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean>;
  isSaved(userId: string, entityType: SavedEntityType, entityId: string): Promise<boolean>;
}

export interface ISavedComparisonRepository {
  listByUserId(userId: string): Promise<SavedComparison[]>;
  saveComparison(userId: string, entityAId: string, entityBId: string): Promise<SavedComparison>;
  removeComparison(userId: string, comparisonId: string): Promise<boolean>;
}

export interface IRecentSearchRepository {
  listByUserId(userId: string, limit?: number): Promise<RecentSearch[]>;
  recordSearch(
    userId: string,
    query: string,
    selectedLocation?: string,
    interpretedIntent?: string
  ): Promise<RecentSearch>;
  removeSearch(userId: string, searchId: string): Promise<boolean>;
  clearHistory(userId: string): Promise<boolean>;
}

export interface INotificationRepository {
  listByUserId(userId: string, unreadOnly?: boolean): Promise<PlatformNotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(userId: string, notificationId: string): Promise<PlatformNotification>;
  markAllAsRead(userId: string): Promise<number>;
  createNotification?(notification: Omit<PlatformNotification, 'id' | 'createdAt'>): Promise<PlatformNotification>;
}
