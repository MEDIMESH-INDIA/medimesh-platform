/**
 * MEDIMESH INDIA 2.0 — Repository Interfaces
 *
 * Strongly typed domain repository contracts establishing clean abstraction boundaries.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. Unrestricted destructive deletion is PROHIBITED for provenance-sensitive healthcare data.
 *    Repository operations enforce non-destructive lifecycle: archive(), deactivate(),
 *    supersede(), and createRevision().
 * 2. If hard delete exists, it is strictly constrained to unreviewed DRAFT records (hardDeleteDraft).
 * 3. Repositories operate on domain entities, never leaking ORM-specific models.
 */

import type {
  Facility,
  HospitalProfile,
  Specialty,
  ServiceCapability,
  DoctorProfile,
  SchemeInsurance,
  FacilitySpecialtyRelation,
  FacilityServiceRelation,
  FacilitySchemeRelation,
  TariffItem,
  AvailabilityRecord,
  SourceProvenance,
  RecordRevision,
  CorrectionSubmission,
  AuditLogEntry,
  WorkflowStatus,
  VerificationState,
  DataOrigin,
  FacilityCategory,
} from '../domain/index.ts';

export interface FacilityFilterCriteria {
  city?: string;
  state?: string;
  category?: FacilityCategory | string;
  workflowStatus?: WorkflowStatus;
  verificationState?: VerificationState;
  dataOrigin?: DataOrigin;
  includeArchived?: boolean;
}

export interface IFacilityRepository {
  findById(id: string): Promise<Facility | null>;
  findBySlug(slug: string): Promise<Facility | null>;
  findMany(filter?: FacilityFilterCriteria): Promise<Facility[]>;
  createDraft(facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt' | 'workflowStatus'>): Promise<Facility>;
  updateDraft(id: string, updates: Partial<Facility>): Promise<Facility>;
  archive(id: string, reason: string): Promise<Facility>;
  deactivate(id: string): Promise<Facility>;
  supersede(id: string, newRevisionId: string): Promise<Facility>;
  /** Strictly constrained to unreviewed DRAFT records prior to submission */
  hardDeleteDraft(id: string): Promise<boolean>;
}

export interface IHospitalRepository {
  getProfileByFacilityId(facilityId: string): Promise<HospitalProfile | null>;
  getProfileBySlug(slug: string): Promise<{ facility: Facility; profile: HospitalProfile } | null>;
  updateProfileDraft(facilityId: string, updates: Partial<HospitalProfile>): Promise<HospitalProfile>;
  archiveProfile(facilityId: string): Promise<HospitalProfile>;
}

export interface ISpecialtyRepository {
  listSpecialties(): Promise<Specialty[]>;
  getSpecialtyById(id: string): Promise<Specialty | null>;
  getSpecialtyBySlug(slug: string): Promise<Specialty | null>;
  getFacilitySpecialties(facilityId: string): Promise<FacilitySpecialtyRelation[]>;
  linkSpecialty(relation: Omit<FacilitySpecialtyRelation, 'id' | 'createdAt' | 'updatedAt'>): Promise<FacilitySpecialtyRelation>;
  archiveSpecialtyLink(facilityId: string, specialtyId: string): Promise<boolean>;
}

export interface IServiceRepository {
  listServices(): Promise<ServiceCapability[]>;
  findServiceBySlug(slug: string): Promise<ServiceCapability | null>;
  getFacilityServices(facilityId: string): Promise<FacilityServiceRelation[]>;
  linkService(relation: Omit<FacilityServiceRelation, 'id' | 'createdAt' | 'updatedAt'>): Promise<FacilityServiceRelation>;
  archiveServiceLink(facilityId: string, serviceId: string): Promise<boolean>;
}

export interface IDoctorRepository {
  listDoctors(filter?: { facilityId?: string; specialtyId?: string; city?: string }): Promise<DoctorProfile[]>;
  getDoctorById(id: string): Promise<DoctorProfile | null>;
  getDoctorBySlug(slug: string): Promise<{ doctor: DoctorProfile; facility?: Facility; specialty?: Specialty } | null>;
  getDoctorsByFacility(facilityId: string): Promise<DoctorProfile[]>;
  getDoctorsBySpecialty(specialtyId: string): Promise<DoctorProfile[]>;
}

export interface ISchemeRepository {
  listSchemes(): Promise<SchemeInsurance[]>;
  findByCode(code: string): Promise<SchemeInsurance | null>;
  findSchemeBySlug(slug: string): Promise<SchemeInsurance | null>;
  getFacilitySchemes(facilityId: string): Promise<FacilitySchemeRelation[]>;
  linkScheme(relation: Omit<FacilitySchemeRelation, 'id' | 'createdAt' | 'updatedAt'>): Promise<FacilitySchemeRelation>;
  archiveSchemeLink(facilityId: string, schemeId: string): Promise<boolean>;
}

export interface ITariffRepository {
  getFacilityTariffs(facilityId: string): Promise<TariffItem[]>;
  listAllTariffs(filter?: { serviceId?: string; city?: string; includeExpired?: boolean }): Promise<TariffItem[]>;
  addTariffDraft(tariff: Omit<TariffItem, 'id' | 'createdAt' | 'updatedAt' | 'workflowStatus'>): Promise<TariffItem>;
  supersedeTariff(id: string, newTariffId: string): Promise<TariffItem>;
  archiveTariff(id: string): Promise<TariffItem>;
}

export interface IAvailabilityRepository {
  getLatest(facilityId: string, capabilityType: string): Promise<AvailabilityRecord | null>;
  recordAvailability(record: Omit<AvailabilityRecord, 'id' | 'createdAt'>): Promise<AvailabilityRecord>;
  getHistory(facilityId: string, limit?: number): Promise<AvailabilityRecord[]>;
}

export interface ISourceRepository {
  getSourceById(id: string): Promise<SourceProvenance | null>;
  createSource(source: Omit<SourceProvenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<SourceProvenance>;
  updateVerificationState(id: string, state: VerificationState, reviewedBy: string): Promise<SourceProvenance>;
}

export interface IRevisionRepository {
  createRevision(revision: Omit<RecordRevision, 'id' | 'createdAt'>): Promise<RecordRevision>;
  getRevisionHistory(entityType: string, entityId: string): Promise<RecordRevision[]>;
}

export interface ICorrectionRepository {
  submitCorrection(correction: Omit<CorrectionSubmission, 'id' | 'submittedAt' | 'status'>): Promise<CorrectionSubmission>;
  getCorrectionsForRecord(targetEntityType: string, targetEntityId: string): Promise<CorrectionSubmission[]>;
  reviewCorrection(id: string, reviewerId: string, status: CorrectionSubmission['status'], resolutionNotes: string): Promise<CorrectionSubmission>;
}

export interface IAuditLogRepository {
  recordEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
  getAuditTrail(entityType: string, entityId: string): Promise<AuditLogEntry[]>;
}
