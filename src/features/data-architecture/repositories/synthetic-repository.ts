/**
 * MEDIMESH INDIA 2.0 — Synthetic In-Memory Repository Implementation
 *
 * Implements the domain repository contracts backed by the Phase 03 synthetic dataset.
 * Allows local development, Next.js static site generation, and unit tests to run
 * without requiring a live PostgreSQL instance.
 *
 * Enforces non-destructive deletion rules: records are archived/superseded rather than deleted.
 */

import { generateSyntheticSeedDataset } from '../../../../database/seeds/synthetic-seed.ts';
import type {
  Facility,
  HospitalProfile,
  Specialty,
  ServiceCapability,
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
  VerificationState,
  DoctorProfile,
} from '../domain/index.ts';
import type {
  IFacilityRepository,
  IHospitalRepository,
  ISpecialtyRepository,
  IServiceRepository,
  IDoctorRepository,
  ISchemeRepository,
  ITariffRepository,
  IAvailabilityRepository,
  ISourceRepository,
  IRevisionRepository,
  ICorrectionRepository,
  IAuditLogRepository,
  FacilityFilterCriteria,
} from './interfaces.ts';

export class SyntheticRepository
  implements
    IFacilityRepository,
    IHospitalRepository,
    ISpecialtyRepository,
    IServiceRepository,
    IDoctorRepository,
    ISchemeRepository,
    ITariffRepository,
    IAvailabilityRepository,
    ISourceRepository,
    IRevisionRepository,
    ICorrectionRepository,
    IAuditLogRepository
{
  private sources: Map<string, SourceProvenance>;
  private facilities: Map<string, Facility>;
  private hospitalProfiles: Map<string, HospitalProfile>;
  private specialties: Map<string, Specialty>;
  private services: Map<string, ServiceCapability>;
  private doctors: Map<string, DoctorProfile>;
  private schemes: Map<string, SchemeInsurance>;
  private facilitySpecialties: Map<string, FacilitySpecialtyRelation>;
  private facilityServices: Map<string, FacilityServiceRelation>;
  private facilitySchemes: Map<string, FacilitySchemeRelation>;
  private tariffs: Map<string, TariffItem>;
  private availabilityRecords: AvailabilityRecord[];
  private revisions: RecordRevision[];
  private corrections: Map<string, CorrectionSubmission>;
  private auditLogs: AuditLogEntry[];

  constructor() {
    const seed = generateSyntheticSeedDataset();
    this.sources = new Map(seed.sources.map((s) => [s.id, s]));
    this.facilities = new Map(seed.facilities.map((f) => [f.id, f]));
    this.hospitalProfiles = new Map(seed.hospitalProfiles.map((p) => [p.facilityId, p]));
    this.specialties = new Map(seed.specialties.map((s) => [s.id, s]));
    this.services = new Map(seed.services.map((s) => [s.id, s]));
    this.doctors = new Map(seed.doctors.map((d) => [d.id, d]));
    this.schemes = new Map(seed.schemes.map((s) => [s.id, s]));
    this.facilitySpecialties = new Map(seed.facilitySpecialties.map((r) => [r.id, r]));
    this.facilityServices = new Map(seed.facilityServices.map((r) => [r.id, r]));
    this.facilitySchemes = new Map(seed.facilitySchemes.map((r) => [r.id, r]));
    this.tariffs = new Map(seed.tariffs.map((t) => [t.id, t]));
    this.availabilityRecords = [...seed.availabilityRecords];
    this.revisions = [];
    this.corrections = new Map();
    this.auditLogs = [];
  }

  // ---------------------------------------------------------------------------
  // Facility Repository
  // ---------------------------------------------------------------------------

  async findById(id: string): Promise<Facility | null> {
    const f = this.facilities.get(id);
    return f ? { ...f } : null;
  }

  async findBySlug(slug: string): Promise<Facility | null> {
    for (const f of this.facilities.values()) {
      if (f.slug === slug) return { ...f };
    }
    return null;
  }

  async findMany(filter?: FacilityFilterCriteria): Promise<Facility[]> {
    let list = Array.from(this.facilities.values());

    if (!filter?.includeArchived) {
      list = list.filter((f) => !f.isArchived);
    }
    if (filter?.city) {
      list = list.filter((f) => f.location.city.toLowerCase() === filter.city?.toLowerCase());
    }
    if (filter?.state) {
      list = list.filter((f) => f.location.state.toLowerCase() === filter.state?.toLowerCase());
    }
    if (filter?.category) {
      list = list.filter((f) => f.category === filter.category);
    }
    if (filter?.workflowStatus) {
      list = list.filter((f) => f.workflowStatus === filter.workflowStatus);
    }
    if (filter?.verificationState) {
      list = list.filter((f) => f.verificationState === filter.verificationState);
    }
    if (filter?.dataOrigin) {
      list = list.filter((f) => f.dataOrigin === filter.dataOrigin);
    }

    return list.map((f) => ({ ...f }));
  }

  async createDraft(
    facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt' | 'workflowStatus'>
  ): Promise<Facility> {
    const id = `fac-draft-${Date.now()}`;
    const now = new Date().toISOString();
    const facility: Facility = {
      ...facilityData,
      id,
      workflowStatus: 'DRAFT',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.facilities.set(id, facility);
    return { ...facility };
  }

  async updateDraft(id: string, updates: Partial<Facility>): Promise<Facility> {
    const existing = this.facilities.get(id);
    if (!existing) throw new Error(`Facility ${id} not found`);
    if (existing.workflowStatus !== 'DRAFT') {
      throw new Error(`Cannot directly update published or reviewed facility ${id}. Create revision instead.`);
    }
    const updated: Facility = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.facilities.set(id, updated);
    return { ...updated };
  }

  async archive(id: string, reason: string): Promise<Facility> {
    const existing = this.facilities.get(id);
    if (!existing) throw new Error(`Facility ${id} not found`);
    const archived: Facility = {
      ...existing,
      isArchived: true,
      workflowStatus: 'ARCHIVED',
      updatedAt: new Date().toISOString(),
    };
    this.facilities.set(id, archived);
    await this.recordEntry({
      actorId: 'system',
      actorRole: 'REVIEWER',
      action: 'ARCHIVE_FACILITY',
      entityType: 'Facility',
      entityId: id,
      previousStateRef: existing.workflowStatus,
      newStateRef: 'ARCHIVED',
      metadata: { reason },
    });
    return { ...archived };
  }

  async deactivate(id: string): Promise<Facility> {
    return this.archive(id, 'Deactivated by administrator');
  }

  async supersede(id: string, newRevisionId: string): Promise<Facility> {
    const existing = this.facilities.get(id);
    if (!existing) throw new Error(`Facility ${id} not found`);
    const superseded: Facility = {
      ...existing,
      currentRevisionId: newRevisionId,
      updatedAt: new Date().toISOString(),
    };
    this.facilities.set(id, superseded);
    return { ...superseded };
  }

  async hardDeleteDraft(id: string): Promise<boolean> {
    const existing = this.facilities.get(id);
    if (!existing) return false;
    // Strict constraint: only unreviewed DRAFT records may be deleted
    if (existing.workflowStatus !== 'DRAFT') {
      throw new Error(`Non-destructive rule violation: cannot hard delete record ${id} in state ${existing.workflowStatus}`);
    }
    return this.facilities.delete(id);
  }

  // ---------------------------------------------------------------------------
  // Hospital Profile Repository
  // ---------------------------------------------------------------------------

  async getProfileByFacilityId(facilityId: string): Promise<HospitalProfile | null> {
    const p = this.hospitalProfiles.get(facilityId);
    return p ? { ...p } : null;
  }

  async getProfileBySlug(slug: string): Promise<{ facility: Facility; profile: HospitalProfile } | null> {
    const facility = await this.findBySlug(slug);
    if (!facility) return null;
    const profile = await this.getProfileByFacilityId(facility.id);
    if (!profile) return null;
    return { facility, profile };
  }

  async updateProfileDraft(facilityId: string, updates: Partial<HospitalProfile>): Promise<HospitalProfile> {
    const existing = this.hospitalProfiles.get(facilityId);
    if (!existing) throw new Error(`HospitalProfile for facility ${facilityId} not found`);
    if (existing.workflowStatus !== 'DRAFT') {
      throw new Error(`Cannot directly mutate non-draft profile. Create revision instead.`);
    }
    const updated: HospitalProfile = {
      ...existing,
      ...updates,
      facilityId: existing.facilityId,
      updatedAt: new Date().toISOString(),
    };
    this.hospitalProfiles.set(facilityId, updated);
    return { ...updated };
  }

  async archiveProfile(facilityId: string): Promise<HospitalProfile> {
    const existing = this.hospitalProfiles.get(facilityId);
    if (!existing) throw new Error(`HospitalProfile for facility ${facilityId} not found`);
    const archived: HospitalProfile = {
      ...existing,
      workflowStatus: 'ARCHIVED',
      updatedAt: new Date().toISOString(),
    };
    this.hospitalProfiles.set(facilityId, archived);
    return { ...archived };
  }

  // ---------------------------------------------------------------------------
  // Specialty Repository
  // ---------------------------------------------------------------------------

  async listSpecialties(): Promise<Specialty[]> {
    return Array.from(this.specialties.values()).map((s) => ({ ...s }));
  }

  async getSpecialtyById(id: string): Promise<Specialty | null> {
    const s = this.specialties.get(id);
    return s ? { ...s } : null;
  }

  async getSpecialtyBySlug(slug: string): Promise<Specialty | null> {
    for (const s of this.specialties.values()) {
      if (s.slug === slug) return { ...s };
    }
    return null;
  }

  async getFacilitySpecialties(facilityId: string): Promise<FacilitySpecialtyRelation[]> {
    const results: FacilitySpecialtyRelation[] = [];
    for (const r of this.facilitySpecialties.values()) {
      if (r.facilityId === facilityId && !r.isArchived) {
        results.push({ ...r });
      }
    }
    return results;
  }

  async linkSpecialty(
    relationData: Omit<FacilitySpecialtyRelation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FacilitySpecialtyRelation> {
    const id = `fsp-${relationData.facilityId}-${relationData.specialtyId}`;
    const now = new Date().toISOString();
    const rel: FacilitySpecialtyRelation = {
      ...relationData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.facilitySpecialties.set(id, rel);
    return { ...rel };
  }

  async archiveSpecialtyLink(facilityId: string, specialtyId: string): Promise<boolean> {
    const id = `fsp-${facilityId}-${specialtyId}`;
    const existing = this.facilitySpecialties.get(id);
    if (!existing) return false;
    existing.isArchived = true;
    existing.workflowStatus = 'ARCHIVED';
    existing.updatedAt = new Date().toISOString();
    this.facilitySpecialties.set(id, existing);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Service Repository
  // ---------------------------------------------------------------------------

  async listServices(): Promise<ServiceCapability[]> {
    return Array.from(this.services.values()).map((s) => ({ ...s }));
  }

  async findServiceBySlug(slug: string): Promise<ServiceCapability | null> {
    for (const s of this.services.values()) {
      if (s.slug === slug) return { ...s };
    }
    return null;
  }

  async getFacilityServices(facilityId: string): Promise<FacilityServiceRelation[]> {
    const results: FacilityServiceRelation[] = [];
    for (const r of this.facilityServices.values()) {
      if (r.facilityId === facilityId && !r.isArchived) {
        results.push({ ...r });
      }
    }
    return results;
  }

  async linkService(
    relationData: Omit<FacilityServiceRelation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FacilityServiceRelation> {
    const id = `fsv-${relationData.facilityId}-${relationData.serviceId}`;
    const now = new Date().toISOString();
    const rel: FacilityServiceRelation = {
      ...relationData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.facilityServices.set(id, rel);
    return { ...rel };
  }

  async archiveServiceLink(facilityId: string, serviceId: string): Promise<boolean> {
    const id = `fsv-${facilityId}-${serviceId}`;
    const existing = this.facilityServices.get(id);
    if (!existing) return false;
    existing.isArchived = true;
    existing.workflowStatus = 'ARCHIVED';
    existing.updatedAt = new Date().toISOString();
    this.facilityServices.set(id, existing);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Doctor Repository
  // ---------------------------------------------------------------------------

  async listDoctors(filter?: { facilityId?: string; specialtyId?: string; city?: string }): Promise<DoctorProfile[]> {
    let list = Array.from(this.doctors.values());
    if (filter?.facilityId) {
      list = list.filter(
        (d) => d.facilityId === filter.facilityId || d.facilityAffiliationIds?.includes(filter.facilityId!)
      );
    }
    if (filter?.specialtyId) {
      list = list.filter(
        (d) => d.specialtyId === filter.specialtyId || d.subSpecialtyIds?.includes(filter.specialtyId!)
      );
    }
    if (filter?.city) {
      const cityLower = filter.city.toLowerCase();
      const facMap = this.facilities;
      list = list.filter((d) => {
        const primaryFac = facMap.get(d.facilityId);
        return primaryFac && primaryFac.location.city.toLowerCase() === cityLower;
      });
    }
    return list.map((d) => ({ ...d }));
  }

  async getDoctorById(id: string): Promise<DoctorProfile | null> {
    const doc = this.doctors.get(id);
    return doc ? { ...doc } : null;
  }

  async getDoctorBySlug(
    slug: string
  ): Promise<{ doctor: DoctorProfile; facility?: Facility; specialty?: Specialty } | null> {
    for (const doc of this.doctors.values()) {
      if (doc.slug === slug) {
        const facility = this.facilities.get(doc.facilityId);
        const specialty = this.specialties.get(doc.specialtyId);
        return {
          doctor: { ...doc },
          facility: facility ? { ...facility } : undefined,
          specialty: specialty ? { ...specialty } : undefined,
        };
      }
    }
    return null;
  }

  async getDoctorsByFacility(facilityId: string): Promise<DoctorProfile[]> {
    return this.listDoctors({ facilityId });
  }

  async getDoctorsBySpecialty(specialtyId: string): Promise<DoctorProfile[]> {
    return this.listDoctors({ specialtyId });
  }

  // ---------------------------------------------------------------------------
  // Scheme Repository
  // ---------------------------------------------------------------------------

  async listSchemes(): Promise<SchemeInsurance[]> {
    return Array.from(this.schemes.values()).map((s) => ({ ...s }));
  }

  async findByCode(code: string): Promise<SchemeInsurance | null> {
    for (const s of this.schemes.values()) {
      if (s.code === code) return { ...s };
    }
    return null;
  }

  async findSchemeBySlug(slug: string): Promise<SchemeInsurance | null> {
    for (const s of this.schemes.values()) {
      if (s.slug === slug) return { ...s };
    }
    return null;
  }

  async getFacilitySchemes(facilityId: string): Promise<FacilitySchemeRelation[]> {
    const results: FacilitySchemeRelation[] = [];
    for (const r of this.facilitySchemes.values()) {
      if (r.facilityId === facilityId && !r.isArchived) {
        results.push({ ...r });
      }
    }
    return results;
  }

  async linkScheme(
    relationData: Omit<FacilitySchemeRelation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FacilitySchemeRelation> {
    const id = `fsc-${relationData.facilityId}-${relationData.schemeId}`;
    const now = new Date().toISOString();
    const rel: FacilitySchemeRelation = {
      ...relationData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.facilitySchemes.set(id, rel);
    return { ...rel };
  }

  async archiveSchemeLink(facilityId: string, schemeId: string): Promise<boolean> {
    const id = `fsc-${facilityId}-${schemeId}`;
    const existing = this.facilitySchemes.get(id);
    if (!existing) return false;
    existing.isArchived = true;
    existing.workflowStatus = 'ARCHIVED';
    existing.updatedAt = new Date().toISOString();
    this.facilitySchemes.set(id, existing);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Tariff Repository
  // ---------------------------------------------------------------------------

  async getFacilityTariffs(facilityId: string): Promise<TariffItem[]> {
    const results: TariffItem[] = [];
    for (const t of this.tariffs.values()) {
      if (t.facilityId === facilityId && !t.isArchived) {
        results.push({ ...t });
      }
    }
    return results;
  }

  async listAllTariffs(filter?: { serviceId?: string; city?: string; includeExpired?: boolean }): Promise<TariffItem[]> {
    let results = Array.from(this.tariffs.values());
    if (!filter?.includeExpired) {
      results = results.filter((t) => !t.isArchived && t.workflowStatus !== 'ARCHIVED');
    }
    if (filter?.serviceId) {
      results = results.filter((t) => t.serviceId === filter.serviceId);
    }
    if (filter?.city) {
      const cityLower = filter.city.toLowerCase();
      const facMap = this.facilities;
      results = results.filter((t) => {
        const fac = facMap.get(t.facilityId);
        return fac && fac.location.city.toLowerCase() === cityLower;
      });
    }
    return results.map((t) => ({ ...t }));
  }

  async addTariffDraft(
    tariffData: Omit<TariffItem, 'id' | 'createdAt' | 'updatedAt' | 'workflowStatus'>
  ): Promise<TariffItem> {
    const id = `tar-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const item: TariffItem = {
      ...tariffData,
      id,
      workflowStatus: 'DRAFT',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.tariffs.set(id, item);
    return { ...item };
  }

  async supersedeTariff(id: string, newTariffId: string): Promise<TariffItem> {
    const existing = this.tariffs.get(id);
    if (!existing) throw new Error(`Tariff ${id} not found`);
    existing.isArchived = true;
    existing.workflowStatus = 'ARCHIVED';
    existing.notes = `Superseded by tariff ${newTariffId}`;
    existing.updatedAt = new Date().toISOString();
    this.tariffs.set(id, existing);
    return { ...existing };
  }

  async archiveTariff(id: string): Promise<TariffItem> {
    const existing = this.tariffs.get(id);
    if (!existing) throw new Error(`Tariff ${id} not found`);
    existing.isArchived = true;
    existing.workflowStatus = 'ARCHIVED';
    existing.updatedAt = new Date().toISOString();
    this.tariffs.set(id, existing);
    return { ...existing };
  }

  // ---------------------------------------------------------------------------
  // Availability Repository
  // ---------------------------------------------------------------------------

  async getLatest(facilityId: string, capabilityType: string): Promise<AvailabilityRecord | null> {
    const matches = this.availabilityRecords
      .filter((r) => r.facilityId === facilityId && r.capabilityType === capabilityType)
      .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
    return matches.length > 0 ? { ...matches[0] } : null;
  }

  async recordAvailability(
    recordData: Omit<AvailabilityRecord, 'id' | 'createdAt'>
  ): Promise<AvailabilityRecord> {
    const id = `avail-${Date.now()}`;
    const record: AvailabilityRecord = {
      ...recordData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.availabilityRecords.push(record);
    return { ...record };
  }

  async getHistory(facilityId: string, limit = 10): Promise<AvailabilityRecord[]> {
    return this.availabilityRecords
      .filter((r) => r.facilityId === facilityId)
      .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime())
      .slice(0, limit)
      .map((r) => ({ ...r }));
  }

  // ---------------------------------------------------------------------------
  // Source Repository
  // ---------------------------------------------------------------------------

  async getSourceById(id: string): Promise<SourceProvenance | null> {
    const s = this.sources.get(id);
    return s ? { ...s } : null;
  }

  async createSource(
    sourceData: Omit<SourceProvenance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SourceProvenance> {
    const id = `src-${Date.now()}`;
    const now = new Date().toISOString();
    const source: SourceProvenance = {
      ...sourceData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.sources.set(id, source);
    return { ...source };
  }

  async updateVerificationState(
    id: string,
    state: VerificationState,
    reviewedBy: string
  ): Promise<SourceProvenance> {
    const existing = this.sources.get(id);
    if (!existing) throw new Error(`Source ${id} not found`);
    const updated: SourceProvenance = {
      ...existing,
      verificationState: state,
      reviewedBy,
      lastReviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sources.set(id, updated);
    return { ...updated };
  }

  // ---------------------------------------------------------------------------
  // Revision Repository
  // ---------------------------------------------------------------------------

  async createRevision(
    revisionData: Omit<RecordRevision, 'id' | 'createdAt'>
  ): Promise<RecordRevision> {
    const id = `rev-${Date.now()}`;
    const rev: RecordRevision = {
      ...revisionData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.revisions.push(rev);
    return { ...rev };
  }

  async getRevisionHistory(entityType: string, entityId: string): Promise<RecordRevision[]> {
    return this.revisions
      .filter((r) => r.entityType === entityType && r.entityId === entityId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber)
      .map((r) => ({ ...r }));
  }

  // ---------------------------------------------------------------------------
  // Correction Repository
  // ---------------------------------------------------------------------------

  async submitCorrection(
    correctionData: Omit<CorrectionSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<CorrectionSubmission> {
    const id = `corr-${Date.now()}`;
    const sub: CorrectionSubmission = {
      ...correctionData,
      id,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    };
    this.corrections.set(id, sub);
    return { ...sub };
  }

  async getCorrectionsForRecord(
    targetEntityType: string,
    targetEntityId: string
  ): Promise<CorrectionSubmission[]> {
    const results: CorrectionSubmission[] = [];
    for (const c of this.corrections.values()) {
      if (c.targetEntityType === targetEntityType && c.targetEntityId === targetEntityId) {
        results.push({ ...c });
      }
    }
    return results;
  }

  async reviewCorrection(
    id: string,
    reviewerId: string,
    status: CorrectionSubmission['status'],
    resolutionNotes: string
  ): Promise<CorrectionSubmission> {
    const existing = this.corrections.get(id);
    if (!existing) throw new Error(`Correction ${id} not found`);
    const resolved: CorrectionSubmission = {
      ...existing,
      status,
      reviewedBy: reviewerId,
      resolutionNotes,
      resolvedAt: new Date().toISOString(),
    };
    this.corrections.set(id, resolved);
    return { ...resolved };
  }

  // ---------------------------------------------------------------------------
  // Audit Log Repository
  // ---------------------------------------------------------------------------

  async recordEntry(
    entryData: Omit<AuditLogEntry, 'id' | 'timestamp'>
  ): Promise<AuditLogEntry> {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const entry: AuditLogEntry = {
      ...entryData,
      id,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(entry);
    return { ...entry };
  }

  async getAuditTrail(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return this.auditLogs
      .filter((a) => a.entityType === entityType && a.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((a) => ({ ...a }));
  }
}
