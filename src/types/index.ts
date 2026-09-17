/**
 * MEDIMESH INDIA — Core Type Definitions
 *
 * These types define the data contracts for the MEDIMESH trust model,
 * location system, availability tracking, and source provenance.
 *
 * They are NOT database models — they represent the application-level
 * domain concepts that will be used across features.
 */

// ---------------------------------------------------------------------------
// Verification & Trust Model
// ---------------------------------------------------------------------------

/** The five trust states for any piece of healthcare data in MEDIMESH */
export type VerificationState =
  | 'PUBLIC_SOURCE'
  | 'FACILITY_REPORTED'
  | 'MEDIMESH_VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'NOT_CONFIRMED';

/** Source provenance metadata attached to verifiable data points */
export interface Source {
  /** The type of verification applied to this data */
  verificationState: VerificationState;
  /** Organization that provided the data (e.g., "National Health Authority") */
  sourceOrganization: string;
  /** Title or identifier of the source document/record */
  sourceTitle?: string;
  /** URL to the original source document, if available */
  sourceUrl?: string;
  /** Date the source document was published */
  publishedDate?: string;
  /** When this record was last updated */
  lastUpdated: string;
  /** When MEDIMESH last reviewed this record */
  lastReviewed?: string;
  /** Who performed the verification (for MEDIMESH_VERIFIED) */
  verifiedBy?: string;
  /** When the verification was performed */
  verificationDate?: string;
  /** When the data should be re-verified */
  expiryDate?: string;
}

/** Verification badge display properties */
export interface VerificationBadgeProps {
  state: VerificationState;
  label?: string;
}

// ---------------------------------------------------------------------------
// Freshness
// ---------------------------------------------------------------------------

/** How recently a piece of time-sensitive data was confirmed */
export interface Freshness {
  /** When the data was last confirmed */
  lastConfirmed: string;
  /** Who reported the data */
  reporter: 'hospital' | 'public_source' | 'medimesh' | 'unknown';
  /** Human-readable freshness label (e.g., "Updated today, 08:30 AM") */
  displayLabel: string;
  /** Whether the data is considered stale */
  isStale: boolean;
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

/** Operational availability status for time-sensitive services */
export type AvailabilityStatus =
  | 'ACTIVE'
  | 'LIMITED'
  | 'NOT_REPORTED'
  | 'CLOSED'
  | 'UNKNOWN';

export interface Availability {
  status: AvailabilityStatus;
  lastUpdated: string;
  reporter: string;
  /** Display text (e.g., "Active (Adult Emergency)") */
  displayLabel: string;
  /** Whether the user should confirm with the facility */
  requiresConfirmation: boolean;
}

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

/**
 * How the user's location was determined.
 *
 * MEDIMESH never silently implies precise GPS location.
 * All distances are estimates unless explicitly stated.
 */
export type LocationMode =
  | 'SELECTED'     // User manually chose a city/area
  | 'APPROXIMATE'  // Approximate location (IP-based or coarse)
  | 'ACTUAL'       // Actual device location when explicitly permitted
  | 'NONE';        // No location set

export interface UserLocation {
  mode: LocationMode;
  /** Display name (e.g., "Bengaluru, KA") */
  displayName: string;
  /** City name */
  city?: string;
  /** State code (e.g., "KA") */
  state?: string;
  /** PIN code */
  pinCode?: string;
  /** Approximate latitude (never claimed as precise) */
  latitude?: number;
  /** Approximate longitude (never claimed as precise) */
  longitude?: number;
}

/** Distance estimate between user and a facility */
export interface DistanceEstimate {
  /** Numeric value in km */
  valueKm: number;
  /** Display string (e.g., "~3.2 km approx") */
  displayLabel: string;
  /** Whether this is an approximation */
  isApproximate: boolean;
}

// ---------------------------------------------------------------------------
// Healthcare Data Entities (interfaces only — no implementation)
// ---------------------------------------------------------------------------

/** Minimal hospital record shape for type-safety */
export interface HospitalSummary {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  distance?: DistanceEstimate;
  verificationState: VerificationState;
  source: Source;
}

/** Minimal doctor record shape for type-safety */
export interface DoctorSummary {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  affiliationType: string;
  registrationReference?: string;
  source: Source;
}

/** Government scheme/insurance reference */
export interface SchemeSummary {
  id: string;
  name: string;
  code: string;
  verificationState: VerificationState;
  source: Source;
}

// ---------------------------------------------------------------------------
// Application-Level Types
// ---------------------------------------------------------------------------

/** Search query interpretation result */
export interface SearchInterpretation {
  rawQuery: string;
  specialty?: string;
  location?: string;
  facilityType?: string;
  services?: string[];
  schemes?: string[];
}

/** Sort option for search results */
export type SortOption =
  | 'distance'
  | 'freshness'
  | 'alphabetical'
  | 'scheme_empanelment';

// ---------------------------------------------------------------------------
// Safety Boundary Constants
// ---------------------------------------------------------------------------

/**
 * MEDIMESH safety disclaimer text.
 *
 * This is used consistently across the application to ensure
 * the platform never implies medical advice, diagnosis, or triage.
 */
export const SAFETY_DISCLAIMERS = {
  /** Primary disclosure shown on major pages */
  primaryDisclosure:
    'MEDIMESH helps people discover and understand healthcare information from available public, facility-reported and verified sources. Information may change. Confirm important details directly with the healthcare facility.',

  /** Search transparency note */
  searchTransparency:
    'MEDIMESH interprets your search terms to discover matching facilities. This tool does not provide medical diagnosis, clinical triaging, or physician referral.',

  /** Location approximation notice */
  locationApproximation:
    'Approximate location used. Distances are estimates.',

  /** Facility confirmation prompt */
  facilityConfirmation:
    'Confirm directly with the facility before travelling.',

  /** Emergency redirect */
  emergencyRedirect:
    'For urgent medical emergencies, contact local emergency services or proceed to the nearest appropriate emergency facility. MEDIMESH provides healthcare information and navigation, not medical advice or emergency services.',

  /** Non-ranking notice */
  nonRanking:
    'MEDIMESH does not rank, rate, or endorse healthcare facilities or practitioners. Results are ordered by relevance, location, and data freshness — not by commercial arrangement.',
} as const;
