/**
 * MEDIMESH INDIA 2.0 — Data Architecture Entities
 *
 * Strongly typed normalized domain entities representing the core healthcare data model.
 * Decoupled from ORM drivers to allow clean domain logic and multi-adapter storage.
 */

import type {
  VerificationState,
  WorkflowStatus,
  CorrectionStatus,
  DataOrigin,
  FacilityCategory,
  HospitalType,
  ClinicalDomain,
  ServiceCategory,
  SourceType,
  AvailabilityStatus,
} from './enums.ts';

// ---------------------------------------------------------------------------
// 1. Source & Provenance Model
// ---------------------------------------------------------------------------

/**
 * Universal Source / Provenance entity.
 * Every verifiable piece of healthcare data traces to an auditable source record.
 */
export interface SourceProvenance {
  id: string;
  sourceType: SourceType;
  sourceOrganization: string;
  sourceTitle?: string;
  sourceUrl?: string; // Only when legitimately available; never fake
  publishedAt?: string; // ISO 8601
  collectedAt: string; // ISO 8601
  lastReviewedAt?: string; // ISO 8601
  collectedBy?: string; // Researcher ID/Role
  reviewedBy?: string; // Reviewer ID/Role
  verificationState: VerificationState;
  notes?: string;
  dataOrigin: DataOrigin;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 2. Revision & Workflow Review Model
// ---------------------------------------------------------------------------

/**
 * Revision history preserving previous data states and auditability.
 */
export interface RecordRevision {
  id: string;
  entityType: string;
  entityId: string;
  revisionNumber: number;
  changeSummary: string;
  previousData?: Record<string, unknown>;
  newData: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  sourceId: string;
  reviewId?: string;
}

/**
 * Structured review record recording the transition between workflow states.
 */
export interface WorkflowReview {
  id: string;
  revisionId: string;
  reviewerId: string;
  status: WorkflowStatus;
  decisionNotes: string;
  reviewedAt: string;
}

// ---------------------------------------------------------------------------
// 3. Facility Model (Generic Facility Identity)
// ---------------------------------------------------------------------------

export interface FacilityContact {
  primaryPhone: string;
  emergencyPhone?: string;
  email?: string;
  websiteUrl?: string; // Only when legitimately sourced
}

export interface FacilityLocation {
  address: string;
  locality?: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number; // Facility coordinate, never user GPS
  longitude?: number;
}

export interface Facility {
  id: string;
  slug: string; // Unique public URL identifier
  name: string;
  category: FacilityCategory;
  ownershipType?: 'Public' | 'Private' | 'Trust/Non-Profit' | 'Autonomous';
  description: string;
  location: FacilityLocation;
  contact: FacilityContact;
  operatingHours?: string;
  workflowStatus: WorkflowStatus;
  currentRevisionId?: string;
  sourceId: string;
  verificationState: VerificationState;
  dataOrigin: DataOrigin;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 4. Hospital Profile (Hospital-Specific Domain Extensions)
// ---------------------------------------------------------------------------

export interface HospitalProfile {
  id: string;
  facilityId: string;
  hospitalType: HospitalType;
  bedCapacityTotal: number;
  icuBedCapacity: number;
  traumaCapability: boolean;
  emergencyIntakeOperational: boolean;
  isMedicalCollege: boolean;
  accreditationSummary?: string; // e.g., 'NABH (Sample Model)'
  workflowStatus: WorkflowStatus;
  currentRevisionId?: string;
  sourceId: string;
  verificationState: VerificationState;
  dataOrigin: DataOrigin;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 5. Specialty Taxonomy & Facility Relationships
// ---------------------------------------------------------------------------

export interface Specialty {
  id: string;
  slug: string;
  name: string;
  clinicalDomain: ClinicalDomain;
  description?: string;
  isAdult: boolean;
  isPediatric: boolean;
}

export interface FacilitySpecialtyRelation {
  id: string;
  facilityId: string;
  specialtyId: string;
  opdAvailable: boolean;
  inpatientAvailable: boolean;
  workflowStatus: WorkflowStatus;
  sourceId: string;
  verificationState: VerificationState;
  dataOrigin: DataOrigin;
  isArchived: boolean;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 6. Services & Diagnostic Capabilities
// ---------------------------------------------------------------------------

export interface ServiceCapability {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description?: string;
}

export interface FacilityServiceRelation {
  id: string;
  facilityId: string;
  serviceId: string;
  is24x7: boolean;
  operationalNotes?: string;
  workflowStatus: WorkflowStatus;
  sourceId: string;
  verificationState: VerificationState;
  dataOrigin: DataOrigin;
  isArchived: boolean;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 7. Doctor & Professional Profiles (Public Registry Info Only)
// ---------------------------------------------------------------------------

export interface DoctorProfile {
  id: string;
  slug: string;
  facilityId: string;
  name: string;
  title: string;
  qualifications: string;
  specialtyId: string;
  subSpecialtyIds?: string[];
  facilityAffiliationIds?: string[];
  department?: string;
  experienceYears?: number;
  languagesSpoken?: string[];
  consultationFee?: number;
  registrationReference?: string;
  opdTimings?: string;
  workflowStatus: WorkflowStatus;
  sourceId: string;
  verificationState: VerificationState;
  dataOrigin: DataOrigin;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 8. Government Schemes & Insurance Empanelment
// ---------------------------------------------------------------------------

export interface SchemeInsurance {
  id: string;
  slug: string;
  code: string;
  name: string;
  providerType: 'GOVERNMENT' | 'SOCIAL_SECURITY' | 'COMMERCIAL_TPA';
  stateScope?: string; // Specific state or 'ALL_INDIA'
  description?: string;
}

export interface FacilitySchemeRelation {
  id: string;
  facilityId: string;
  schemeId: string;
  empanelmentCategory?: string;
  helpdeskLocation?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  workflowStatus: WorkflowStatus;
  sourceId: string;
  verificationState: VerificationState;
  dataOrigin: DataOrigin;
  isArchived: boolean;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 9. Informational Tariffs (Non-Promotional Price Data)
// ---------------------------------------------------------------------------

export interface TariffItem {
  id: string;
  facilityId: string;
  serviceId: string;
  amount: number;
  currency: 'INR';
  unit: string; // e.g. 'per day', 'per scan', 'package'
  effectiveFrom?: string;
  effectiveTo?: string;
  notes?: string;
  workflowStatus: WorkflowStatus;
  sourceId: string;
  verificationState: VerificationState;
  dataOrigin: DataOrigin;
  isArchived: boolean;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 10. Availability Tracking (Time-Sensitive, Never a Guarantee)
// ---------------------------------------------------------------------------

export interface AvailabilityRecord {
  id: string;
  facilityId: string;
  capabilityType: 'CASUALTY' | 'ICU_BED' | 'BLOOD_BANK' | 'GENERAL_BED';
  status: AvailabilityStatus;
  observedAt: string; // ISO 8601
  expiresAt?: string; // When the observation is considered stale
  sourceId: string;
  verificationState: VerificationState;
  requiresConfirmation: boolean; // Always true for consumer guidance
  contextNotes?: string;
  dataOrigin: DataOrigin;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// 11. Correction Submissions (Public / Facility Feedback Workflow)
// ---------------------------------------------------------------------------

export interface CorrectionSubmission {
  id: string;
  targetEntityType: string;
  targetEntityId: string;
  targetField: string;
  currentValue?: string;
  proposedValue: string;
  justification: string;
  sourceCitation: string;
  submitterContact?: string;
  status: CorrectionStatus;
  submittedAt: string;
  reviewedBy?: string;
  resolutionNotes?: string;
  resultingRevisionId?: string;
  resolvedAt?: string;
}

// ---------------------------------------------------------------------------
// 12. Application Audit Log (Platform Admin/Research Operations)
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  previousStateRef?: string;
  newStateRef?: string;
  metadata?: Record<string, unknown>;
}
