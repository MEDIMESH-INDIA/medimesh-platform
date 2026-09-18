/**
 * MEDIMESH INDIA 2.0 — User Domain Entities
 *
 * Pure TypeScript domain entities for account personalization, public discovery saves,
 * facility comparisons, recent searches, preferences, and informational notifications.
 *
 * STRICT NON-CLINICAL SAFETY:
 * - NO patient medical records or clinical profiles
 * - NO diagnoses, symptoms, or triage
 * - NO prescriptions, medications, or treatment history
 * - NO medical alerts or clinical advice
 * - NO doctor/hospital ratings, rankings, or scores
 * - NO free-text notes field on saved items
 * - NO precise GPS coordinates or pinCode in preferences
 */

import type {
  SavedEntityType,
  NotificationType,
  UserStatus,
  LocationPreferenceMode,
} from './enums.ts';

/**
 * Minimal platform user account identity.
 * Email is optional and used solely for internal auth lookup if required;
 * it is never displayed publicly or used to build personal health profiles.
 */
export interface User {
  id: string;
  authIdentifier: string; // Unique provider-neutral auth ID
  displayName: string;
  email?: string;
  preferredLanguage: string; // Default 'en'
  status: UserStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Platform preference model honoring existing MEDIMESH location & accessibility semantics.
 * Coarse location only ("Bengaluru, Karnataka"). Zero precise GPS or pinCode stored.
 */
export interface UserPreference {
  userId: string;
  locationMode: LocationPreferenceMode;
  locationDisplayName?: string; // Coarse label, e.g. "Bengaluru, Karnataka"
  locationCity?: string;
  locationState?: string;
  reduceMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
  emailUpdates: boolean;
  serviceAnnouncements: boolean;
  updatedAt: string; // ISO 8601
}

/**
 * Saved public healthcare discovery item.
 * NOTE: User-entered free-text notes are intentionally EXCLUDED to ensure
 * the platform does not collect medical notes or personal health information.
 */
export interface SavedItem {
  id: string;
  userId: string;
  entityType: SavedEntityType;
  entityId: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * View-model projection: SavedItem with live resolved public metadata.
 * Sourced from the canonical Phase 04/05 domain repositories.
 */
export interface SavedItemResolved {
  savedItem: SavedItem;
  title: string;
  categoryLabel: string;
  locationText?: string;
  verificationState: string;
  sourceOrganization?: string;
  lastReviewedAt?: string;
  slug?: string;
  isDemo: boolean;
  isAvailable: boolean; // false if underlying record was archived/superseded
  tariffDetails?: {
    amount: number;
    currency: string;
    unit: string;
    effectiveFrom?: string;
    effectiveTo?: string;
    isExpired?: boolean;
  };
}

/**
 * Saved comparison: strictly two facilities compared side-by-side.
 * Never ratings, never winners, never rankings, never suitability scores.
 */
export interface SavedComparison {
  id: string;
  userId: string;
  entityType: 'FACILITY'; // Explicitly limited to facility comparisons
  entityAId: string;
  entityBId: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Resolved facility comparison summary used for neutral side-by-side display.
 */
export interface ResolvedFacilityComparisonSummary {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
  verificationState: string;
  slug: string;
  operatingHours?: string;
  primaryPhone?: string;
  isDemo: boolean;
  bedCapacityTotal?: number;
  icuBedCapacity?: number;
  emergencyOperational?: boolean;
  specialtiesCount?: number;
  schemesCount?: number;
}

/**
 * View-model projection: SavedComparison with resolved side-by-side facility attributes.
 */
export interface SavedComparisonResolved {
  comparison: SavedComparison;
  facilityA: ResolvedFacilityComparisonSummary;
  facilityB: ResolvedFacilityComparisonSummary;
}

/**
 * Recent discovery search entry.
 * Strictly non-diagnostic: captures only the search text, coarse location,
 * and discovery keyword intent. Never converted into medical facts about the user.
 */
export interface RecentSearch {
  id: string;
  userId: string;
  query: string;
  interpretedIntent?: string; // e.g. "Specialty: Cardiology"
  selectedLocation?: string;  // e.g. "Bengaluru"
  createdAt: string;          // ISO 8601
}

/**
 * Informational platform notification.
 * Restricted strictly to platform notices: saved item updates, correction workflow updates,
 * account preference updates, and system maintenance. Never clinical alerts.
 */
export interface PlatformNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: SavedEntityType;
  relatedEntityId?: string;
  readAt?: string;            // ISO 8601
  expiresAt?: string;         // ISO 8601
  createdAt: string;          // ISO 8601
}
