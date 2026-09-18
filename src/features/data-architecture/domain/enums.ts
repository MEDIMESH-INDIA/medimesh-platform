/**
 * MEDIMESH INDIA 2.0 — Data Architecture Enums
 *
 * Strongly typed domain enumerations representing canonical verification states,
 * research workflow states, correction states, facility taxonomy, and demo isolation.
 */

/** The canonical 6 verification states for any piece of healthcare data in MEDIMESH */
export type VerificationState =
  | 'PUBLIC_SOURCE'
  | 'FACILITY_REPORTED'
  | 'MEDIMESH_VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'NOT_CONFIRMED'
  | 'UNABLE_TO_VERIFY';

/**
 * Research -> Review -> Publication lifecycle states.
 * A researcher cannot directly publish data; each record must pass review.
 */
export type WorkflowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFORMATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'UNABLE_TO_VERIFY'
  | 'PUBLISHED'
  | 'ARCHIVED';

/**
 * Lifecycle states for public/facility correction submissions.
 * Published state is strictly preserved while a correction is under review.
 */
export type CorrectionStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFORMATION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'UNABLE_TO_VERIFY';

/**
 * Data origin classification ensuring synthetic demo data is completely isolated.
 */
export type DataOrigin =
  | 'SYNTHETIC_DEMO'
  | 'STAGED_RESEARCH'
  | 'PUBLISHED_PRODUCTION';

/**
 * Generic healthcare facility categories.
 */
export type FacilityCategory =
  | 'Hospital'
  | 'Clinic'
  | 'Diagnostic/Laboratory'
  | 'Specialty Centre'
  | 'Emergency/Critical Care'
  | 'Rehabilitation'
  | 'Home Healthcare'
  | 'Pharmacy';

/**
 * Hospital classification types.
 */
export type HospitalType =
  | 'Super Specialty Hospital'
  | 'Multi-Specialty Hospital'
  | 'Single Specialty Hospital'
  | 'Government Medical College Hospital'
  | 'Community Health Center'
  | 'Daycare & Polyclinic';

/**
 * Clinical specialty domains for discovery taxonomy (not diagnosis).
 */
export type ClinicalDomain =
  | 'Cardiology'
  | 'Orthopedics'
  | 'Neurology & Neurosurgery'
  | 'Oncology'
  | 'Nephrology & Urology'
  | 'Pediatrics'
  | 'General Medicine'
  | 'Obstetrics & Gynecology'
  | 'Gastroenterology'
  | 'Emergency & Critical Care';

/**
 * Sourced capability and infrastructure categories.
 */
export type ServiceCategory =
  | 'Critical Care'
  | 'Diagnostic Imaging'
  | 'Laboratory'
  | 'Surgical'
  | 'Therapeutic'
  | 'Emergency Support';

/**
 * Extensible source origin categories.
 */
export type SourceType =
  | 'FACILITY_REPORTED'
  | 'GOVERNMENT_PUBLICATION'
  | 'PUBLIC_REGISTRY'
  | 'PROFESSIONAL_REGISTRY'
  | 'OFFICIAL_SCHEME_SOURCE'
  | 'PUBLIC_DOCUMENT'
  | 'OTHER_PUBLIC_SOURCE'
  | 'SYNTHETIC_DEMO';

/**
 * Operational availability status for time-sensitive services.
 * Must NEVER imply a guarantee.
 */
export type AvailabilityStatus =
  | 'ACTIVE'
  | 'LIMITED'
  | 'NOT_REPORTED'
  | 'CLOSED'
  | 'UNKNOWN';
