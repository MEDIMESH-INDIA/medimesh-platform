# MEDIMESH INDIA 2.0 — User System & Personal Discovery Architecture Specification

## 1. Executive Overview & Scope

Phase 06 establishes the platform account and personal discovery layer for MEDIMESH INDIA 2.0.
The purpose of this layer is strictly personal discovery management and platform personalization for public healthcare information.

### Core Capabilities
1. **Minimal Platform Account Identity**: Lightweight user profile (`id`, `authIdentifier`, `displayName`, `preferredLanguage`, `status`).
2. **Provider-Neutral Authentication Boundary**: Abstract `IAuthService` decoupled from external identity providers and demo infrastructure.
3. **Development/Demo Authentication Adapter**: Local synthetic session switching between `"Demo User 001"` and `"Demo User 002"`.
4. **Polymorphic Saved Discovery Information**: Multi-entity saves across 10 discovery types with live metadata resolution and 7-step referential integrity validation.
5. **Strictly-Two Facility Comparisons**: Side-by-side informational comparisons with symmetrical pair normalization (`[A, B] == [B, A]`) and zero rankings, ratings, or scores.
6. **Recent Discovery Searches**: User-scoped query logs with natural-language discovery interpretations, completely isolated from medical or clinical inference.
7. **Platform Preferences**: Canonical coarse location semantics (`SELECTED`, `APPROXIMATE`, `ACTUAL` without precise GPS), accessibility toggles, and notification preferences.
8. **Informational Platform Notifications**: User-scoped operational notices across 4 locked categories (`SAVED_INFORMATION`, `CORRECTION_UPDATE`, `ACCOUNT_SECURITY`, `SYSTEM`).
9. **Strict Non-Clinical & Privacy Boundary**: Immutable structural prohibition against patient records, clinical charts, diagnoses, symptoms, prescriptions, triage, or free-text medical notes.

---

## 2. Strict Non-Clinical & Privacy Boundary

MEDIMESH account data is **platform discovery data only**. It is NEVER a Personal Health Record (PHR) or Electronic Health Record (EHR).

### Forbidden Concepts (Prohibited Across Database, Domain, and UI)
The following concepts are strictly prohibited:
- Patient medical records, charts, or clinical profiles
- Diagnoses, conditions, or clinical inferences
- Symptoms or symptom checkers
- Prescriptions, medication history, or treatment history
- Clinical consultations, telemedicine, or medical advice
- Clinical alerts, triage, or emergency dispatch
- Doctor ratings, reviews, rankings, or "best doctor" badges
- Hospital quality scores, rankings, stars, or "top hospital" endorsements
- Cashless or admission guarantees
- Free-text user notes attached to saved items (to prevent storing medical notes)
- Aadhaar numbers or government identity numbers
- Precise GPS coordinates or device latitude/longitude tracking

### Privacy Disclosure Language
Displayed prominently on `/account/settings` via `PrivacyCard`:
> *"Your MEDIMESH account stores your discovery preferences, saved public healthcare information, saved facility comparisons, and recent searches. It does NOT store patient medical records, clinical history, prescriptions, diagnoses, or symptoms."*

---

## 3. User Domain Entities & Enums

Located in `src/features/user/domain/`, written in pure TypeScript with zero dependencies on React, Next.js, or Prisma:

### Locked Enums
- **`SavedEntityType`**: `FACILITY`, `HOSPITAL`, `SPECIALTY`, `DOCTOR`, `SERVICE`, `SCHEME`, `TARIFF`, `AMBULANCE`, `PHARMACY`, `HOME_HEALTHCARE`.
- **`NotificationType`**: `SAVED_INFORMATION`, `CORRECTION_UPDATE`, `ACCOUNT_SECURITY`, `SYSTEM`.
- **`UserStatus`**: `ACTIVE`, `SUSPENDED`, `DEACTIVATED`.
- **`LocationPreferenceMode`**: `SELECTED`, `APPROXIMATE`, `ACTUAL`.

### Domain Entities
- **`User`**: `id`, `authIdentifier`, `displayName`, `email?`, `preferredLanguage`, `status`, `createdAt`, `updatedAt`.
- **`UserPreference`**: `userId`, `locationMode`, `locationDisplayName?`, `locationCity?`, `locationState?`, `reduceMotion`, `largerText`, `highContrast`, `emailUpdates`, `serviceAnnouncements`, `updatedAt`.
- **`SavedItem`**: `id`, `userId`, `entityType`, `entityId`, `createdAt`, `updatedAt`. *(Note: Contains NO free-text notes field)*.
- **`SavedItemResolved`**: Live public metadata resolved from underlying discovery repositories (`title`, `categoryLabel`, `locationText?`, `verificationState`, `sourceOrganization?`, `lastReviewedAt?`, `slug?`, `isDemo`, `isAvailable`).
- **`SavedComparison`**: `id`, `userId`, `entityType: 'FACILITY'`, `entityAId`, `entityBId`, `createdAt`, `updatedAt`.
- **`SavedComparisonResolved`**: Side-by-side facility comparison summary (`comparison`, `facilityA`, `facilityB`).
- **`RecentSearch`**: `id`, `userId`, `query`, `interpretedIntent?`, `selectedLocation?`, `createdAt`.
- **`PlatformNotification`**: `id`, `userId`, `type`, `title`, `message`, `relatedEntityType?`, `relatedEntityId?`, `readAt?`, `expiresAt?`, `createdAt`.

---

## 4. Authentication Architecture & Boundary

Located in `src/features/user/auth/`:

### 4.1 Abstract Provider-Neutral Interface (`IAuthService`)
```typescript
export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  expiresAt?: string;
}

export interface IAuthService {
  getCurrentSession(): Promise<AuthSession>;
  signOut(): Promise<void>;
  getUserById?(userId: string): Promise<User | null>;
}
```
The production interface contains zero references to demo accounts or synthetic user switching.

### 4.2 Development Authentication Adapter (`DevelopmentAuthAdapter`)
- Development/testing adapter implementing `IAuthService`.
- Supports local synthetic identities exclusively:
  - `"user-demo-001"`: `"Demo User 001"`
  - `"user-demo-002"`: `"Demo User 002"`
- Isolated developer methods: `switchDemoUser(userId)` and `signInDemoUser(userId)`.
- Explicitly documented: Development/demo only, replaceable, not a real identity provider.

### 4.3 Client Context & Non-Blocking Public Discovery
- `AuthProvider` and `useAuth()` manage client session state via in-memory and local storage caching.
- Public pages remain completely non-blocking when logged out. No global server locks or authentication redirects interfere with search and discovery.

---

## 5. Saved Entity Resolution & 7-Step Referential Validation

Located in `src/features/user/services/saved-entity-resolver.ts` and `user-service.ts`.

### 5.1 The Mandatory 7-Step Sequence on Every Save
1. **Authenticate**: Identify current user from active session.
2. **Validate Entity Type**: Confirm `entityType` belongs to the 10 locked types.
3. **Invoke Domain Resolver**: Pass `(entityType, entityId)` to `SavedEntityResolver`.
4. **Confirm Existence**: Verify the entity actually exists in canonical Phase 04/Phase 05 repositories.
5. **Confirm Public Status**: Verify the record is an active, public discovery record. Arbitrary or fabricated client IDs are rejected with a `Referential integrity error`.
6. **Check User-Scoped Uniqueness**: Enforce `[userId, entityType, entityId]` uniqueness. If already saved, return existing record without duplicate insertion.
7. **Persist**: Store `SavedItem` in user repository.

### 5.2 Graceful Resolution of Superseded or Unavailable Records
When resolving `SavedItemResolved`:
- If an entity is archived or superseded, the UI does NOT crash.
- It returns an informative neutral fallback (`isAvailable: false`, `"Saved information is no longer available."`).
- Preserves provenance, freshness (`lastReviewedAt`), and demo status (`isDemo: true`).

---

## 6. Saved Facility Comparisons Architecture

### 6.1 Strict Invariants
- **Facility-to-Facility Only**: Entity type is locked to `FACILITY` (including hospital facilities).
- **Strictly Exactly Two Items**: Comparisons with 1 item or 3+ items are rejected.
- **Identity Rejection**: `entityAId === entityBId` is rejected (`Cannot compare a facility to itself`).
- **Symmetrical Pair Normalization**:
  To ensure `[A, B]` and `[B, A]` represent the identical logical pair:
  $$\text{normA} = \min(A, B), \quad \text{normB} = \max(A, B)$$
  A user can never save duplicate reverse pairs.
- **Zero Ratings or Rankings**: Side-by-side presentation renders sourced public metrics (beds, ICU, casualty, specialties, schemes, operating hours) without declaring a "winner" or computing suitability scores.

---

## 7. Platform Preferences & Location Semantics

### Coarse Location Semantics
Location mode adheres strictly to existing MEDIMESH location tokens:
1. `SELECTED`: User manually chooses a public reference location (e.g., `"Bengaluru, Karnataka"`).
2. `APPROXIMATE`: Coarse IP-based regional reference label.
3. `ACTUAL`: Coarse city/district label from device permission. **Strictly prohibits storing latitude, longitude, pin code, or GPS tracks**.

### Accessibility Toggles
- `reduceMotion`: Respects system animations and prefers reduced motion CSS.
- `largerText`: High-legibility text scale.
- `highContrast`: High-contrast borders and text tokens.

---

## 8. Informational Platform Notifications

Informational notifications are strictly platform-operational:
- `SAVED_INFORMATION`: Notice when a saved facility updates operational hours or empanelment.
- `CORRECTION_UPDATE`: Notice on status of a user's clerical correction submission.
- `ACCOUNT_SECURITY`: Notice when account preferences are updated.
- `SYSTEM`: Scheduled directory indexing or platform maintenance notices.

**Zero Clinical Alerts**: Notifications never include medication reminders, symptom warnings, diagnostic alerts, or clinical recommendations.

---

## 9. Multi-Tenant User Isolation

Every mutation and query is strictly scoped by `userId`:
- Saves: `WHERE userId = currentUser.id`
- Comparisons: `WHERE userId = currentUser.id`
- Recent Searches: `WHERE userId = currentUser.id`
- Notifications: `WHERE userId = currentUser.id`
- Preferences: `WHERE userId = currentUser.id`

Synthetic demo accounts (`user-demo-001` and `user-demo-002`) are tested to guarantee that neither user can inspect, modify, or delete the other's personal discovery data.

---

## 10. Database Schema & Migration Strategy

### 10.1 Prisma Schema (`prisma/schema.prisma`)
- Enums: `SavedEntityType`, `NotificationType`, `UserStatus`, `LocationPreferenceMode`.
- Models: `User`, `UserPreference`, `SavedItem`, `SavedComparison`, `RecentSearch`, `PlatformNotification`.
- Compound unique constraints:
  - `@@unique([userId, entityType, entityId])` on `SavedItem`
  - `@@unique([userId, entityAId, entityBId])` on `SavedComparison`
  - `@@unique([userId])` on `UserPreference`
- Compound indexes for efficient user-scoped queries:
  - `@@index([userId, createdAt])` on `SavedItem`, `SavedComparison`, `RecentSearch`, `PlatformNotification`.

### 10.2 Migration Files
- **Canonical Executable Migration**: `prisma/migrations/20260918000000_user_system/migration.sql`.
- **Reference Archive**: `database/migrations/002_user_system.sql`.
Prisma Client generated successfully via `npx prisma generate`.

---

## 11. Public Discovery Integration

- **Header / Navigation**: The Account icon navigates to `/account`; Notification icon navigates to `/account/notifications`.
- **Save Flow**:
  - Authenticated user: Entity is saved directly, triggering a toast (*"Saved to your MEDIMESH account."*).
  - Unauthenticated user: Opens `AuthPromptDialog` (*"Sign in to save this information to your MEDIMESH account."*). One-click demo sign-in seamlessly completes the save.
- **Search Page**: Saves and comparison toggles integrate with `defaultUserService` while preserving natural-language query interpretation.
