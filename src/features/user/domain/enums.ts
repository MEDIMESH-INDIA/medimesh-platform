/**
 * MEDIMESH INDIA 2.0 — User Domain Enums
 *
 * Strongly typed enumerations defining user account status, location modes,
 * supported saved discovery entity types, and informational notification types.
 *
 * STRICT NON-CLINICAL SAFETY:
 * Zero patient record, clinical alert, diagnosis, prescription, or triage enums.
 * Decoupled from ORM drivers, React, Next.js, and browser APIs.
 */

export type SavedEntityType =
  | 'FACILITY'
  | 'HOSPITAL'
  | 'SPECIALTY'
  | 'DOCTOR'
  | 'SERVICE'
  | 'SCHEME'
  | 'TARIFF'
  | 'AMBULANCE'
  | 'PHARMACY'
  | 'HOME_HEALTHCARE';

export type NotificationType =
  | 'SAVED_INFORMATION'
  | 'CORRECTION_UPDATE'
  | 'ACCOUNT_SECURITY'
  | 'SYSTEM';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export type LocationPreferenceMode = 'SELECTED' | 'APPROXIMATE' | 'ACTUAL';
