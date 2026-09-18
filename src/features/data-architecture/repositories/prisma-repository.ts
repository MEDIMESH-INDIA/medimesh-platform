/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MEDIMESH INDIA 2.0 — Prisma / PostgreSQL Repository Adapter
 *
 * Implements domain repository contracts backed by Prisma Client & PostgreSQL.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. Non-destructive operations: maps archive(), deactivate(), supersede().
 * 2. Hard deletion is strictly restricted to unreviewed DRAFT records.
 * 3. Maps database relational models into pure domain entities.
 */

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
} from '../domain/index.ts';
import type {
  IFacilityRepository,
  IHospitalRepository,
  ISpecialtyRepository,
  IServiceRepository,
  ISchemeRepository,
  ITariffRepository,
  IAvailabilityRepository,
  ISourceRepository,
  IRevisionRepository,
  ICorrectionRepository,
  IAuditLogRepository,
  FacilityFilterCriteria,
} from './interfaces.ts';

export interface PrismaClientLike {
  facility: any;
  hospitalProfile: any;
  specialty: any;
  facilitySpecialty: any;
  serviceCapability: any;
  facilityService: any;
  schemeInsurance: any;
  facilityScheme: any;
  tariffItem: any;
  availabilityRecord: any;
  sourceProvenance: any;
  recordRevision: any;
  workflowReview: any;
  correctionSubmission: any;
  auditLog: any;
}

export class PrismaRepository
  implements
    IFacilityRepository,
    IHospitalRepository,
    ISpecialtyRepository,
    IServiceRepository,
    ISchemeRepository,
    ITariffRepository,
    IAvailabilityRepository,
    ISourceRepository,
    IRevisionRepository,
    ICorrectionRepository,
    IAuditLogRepository
{
  private readonly prisma: PrismaClientLike;

  constructor(prisma: PrismaClientLike) {
    this.prisma = prisma;
  }

  // ---------------------------------------------------------------------------
  // Facility Repository
  // ---------------------------------------------------------------------------

  async findById(id: string): Promise<Facility | null> {
    const row = await this.prisma.facility.findUnique({
      where: { id },
      include: { source: true },
    });
    return row ? this.mapFacility(row) : null;
  }

  async findBySlug(slug: string): Promise<Facility | null> {
    const row = await this.prisma.facility.findUnique({
      where: { slug },
      include: { source: true },
    });
    return row ? this.mapFacility(row) : null;
  }

  async findMany(filter?: FacilityFilterCriteria): Promise<Facility[]> {
    const where: Record<string, unknown> = {};
    if (!filter?.includeArchived) {
      where.isArchived = false;
    }
    if (filter?.city) {
      where.city = { equals: filter.city, mode: 'insensitive' };
    }
    if (filter?.state) {
      where.state = { equals: filter.state, mode: 'insensitive' };
    }
    if (filter?.category) {
      where.category = filter.category;
    }
    if (filter?.workflowStatus) {
      where.workflowStatus = filter.workflowStatus;
    }
    if (filter?.verificationState) {
      where.verificationState = filter.verificationState;
    }
    if (filter?.dataOrigin) {
      where.dataOrigin = filter.dataOrigin;
    }

    const rows = await this.prisma.facility.findMany({
      where,
      include: { source: true },
    });
    return rows.map((r: any) => this.mapFacility(r));
  }

  async createDraft(
    facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt' | 'workflowStatus'>
  ): Promise<Facility> {
    const row = await this.prisma.facility.create({
      data: {
        slug: facilityData.slug,
        name: facilityData.name,
        category: facilityData.category,
        ownershipType: facilityData.ownershipType,
        description: facilityData.description,
        address: facilityData.location.address,
        locality: facilityData.location.locality,
        city: facilityData.location.city,
        district: facilityData.location.district,
        state: facilityData.location.state,
        country: facilityData.location.country,
        postalCode: facilityData.location.postalCode,
        latitude: facilityData.location.latitude,
        longitude: facilityData.location.longitude,
        primaryPhone: facilityData.contact.primaryPhone,
        emergencyPhone: facilityData.contact.emergencyPhone,
        email: facilityData.contact.email,
        websiteUrl: facilityData.contact.websiteUrl,
        operatingHours: facilityData.operatingHours,
        workflowStatus: 'DRAFT',
        sourceId: facilityData.sourceId,
        verificationState: facilityData.verificationState,
        dataOrigin: facilityData.dataOrigin,
        isArchived: false,
      },
      include: { source: true },
    });
    return this.mapFacility(row);
  }

  async updateDraft(id: string, updates: Partial<Facility>): Promise<Facility> {
    const existing = await this.prisma.facility.findUnique({ where: { id } });
    if (!existing) throw new Error(`Facility ${id} not found`);
    if (existing.workflowStatus !== 'DRAFT') {
      throw new Error(`Cannot mutate non-draft facility ${id}. Create revision instead.`);
    }

    const data: Record<string, unknown> = {};
    if (updates.name) data.name = updates.name;
    if (updates.description) data.description = updates.description;
    if (updates.operatingHours) data.operatingHours = updates.operatingHours;

    const row = await this.prisma.facility.update({
      where: { id },
      data,
      include: { source: true },
    });
    return this.mapFacility(row);
  }

  async archive(id: string, reason: string): Promise<Facility> {
    const row = await this.prisma.facility.update({
      where: { id },
      data: {
        isArchived: true,
        workflowStatus: 'ARCHIVED',
      },
      include: { source: true },
    });
    await this.recordEntry({
      actorId: 'system',
      actorRole: 'REVIEWER',
      action: 'ARCHIVE_FACILITY',
      entityType: 'Facility',
      entityId: id,
      previousStateRef: 'PUBLISHED',
      newStateRef: 'ARCHIVED',
      metadata: { reason },
    });
    return this.mapFacility(row);
  }

  async deactivate(id: string): Promise<Facility> {
    return this.archive(id, 'Deactivated by administrator');
  }

  async supersede(id: string, newRevisionId: string): Promise<Facility> {
    const row = await this.prisma.facility.update({
      where: { id },
      data: { currentRevisionId: newRevisionId },
      include: { source: true },
    });
    return this.mapFacility(row);
  }

  async hardDeleteDraft(id: string): Promise<boolean> {
    const existing = await this.prisma.facility.findUnique({ where: { id } });
    if (!existing) return false;
    if (existing.workflowStatus !== 'DRAFT') {
      throw new Error(`Non-destructive rule violation: cannot delete facility ${id} in state ${existing.workflowStatus}`);
    }
    await this.prisma.facility.delete({ where: { id } });
    return true;
  }

  // ---------------------------------------------------------------------------
  // Hospital Profile Repository
  // ---------------------------------------------------------------------------

  async getProfileByFacilityId(facilityId: string): Promise<HospitalProfile | null> {
    const row = await this.prisma.hospitalProfile.findUnique({
      where: { facilityId },
      include: { source: true },
    });
    return row ? this.mapHospitalProfile(row) : null;
  }

  async getProfileBySlug(slug: string): Promise<{ facility: Facility; profile: HospitalProfile } | null> {
    const facility = await this.findBySlug(slug);
    if (!facility) return null;
    const profile = await this.getProfileByFacilityId(facility.id);
    if (!profile) return null;
    return { facility, profile };
  }

  async updateProfileDraft(facilityId: string, updates: Partial<HospitalProfile>): Promise<HospitalProfile> {
    const existing = await this.prisma.hospitalProfile.findUnique({ where: { facilityId } });
    if (!existing) throw new Error(`HospitalProfile for facility ${facilityId} not found`);
    if (existing.workflowStatus !== 'DRAFT') {
      throw new Error(`Cannot mutate non-draft profile. Create revision instead.`);
    }

    const row = await this.prisma.hospitalProfile.update({
      where: { facilityId },
      data: {
        bedCapacityTotal: updates.bedCapacityTotal,
        icuBedCapacity: updates.icuBedCapacity,
        traumaCapability: updates.traumaCapability,
        emergencyIntakeOperational: updates.emergencyIntakeOperational,
      },
    });
    return this.mapHospitalProfile(row);
  }

  async archiveProfile(facilityId: string): Promise<HospitalProfile> {
    const row = await this.prisma.hospitalProfile.update({
      where: { facilityId },
      data: { workflowStatus: 'ARCHIVED' },
    });
    return this.mapHospitalProfile(row);
  }

  // ---------------------------------------------------------------------------
  // Specialty Repository
  // ---------------------------------------------------------------------------

  async listSpecialties(): Promise<Specialty[]> {
    const rows = await this.prisma.specialty.findMany();
    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      clinicalDomain: r.clinicalDomain,
      description: r.description,
      isAdult: r.isAdult,
      isPediatric: r.isPediatric,
    }));
  }

  async getSpecialtyById(id: string): Promise<Specialty | null> {
    const r = await this.prisma.specialty.findUnique({ where: { id } });
    if (!r) return null;
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      clinicalDomain: r.clinicalDomain,
      description: r.description,
      isAdult: r.isAdult,
      isPediatric: r.isPediatric,
    };
  }

  async getSpecialtyBySlug(slug: string): Promise<Specialty | null> {
    const r = await this.prisma.specialty.findUnique({ where: { slug } });
    if (!r) return null;
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      clinicalDomain: r.clinicalDomain,
      description: r.description,
      isAdult: r.isAdult,
      isPediatric: r.isPediatric,
    };
  }

  async getFacilitySpecialties(facilityId: string): Promise<FacilitySpecialtyRelation[]> {
    const rows = await this.prisma.facilitySpecialty.findMany({
      where: { facilityId, isArchived: false },
      include: { specialty: true, source: true },
    });
    return rows.map((r: any) => this.mapFacilitySpecialty(r));
  }

  async linkSpecialty(
    relationData: Omit<FacilitySpecialtyRelation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FacilitySpecialtyRelation> {
    const row = await this.prisma.facilitySpecialty.create({
      data: {
        facilityId: relationData.facilityId,
        specialtyId: relationData.specialtyId,
        opdAvailable: relationData.opdAvailable,
        inpatientAvailable: relationData.inpatientAvailable,
        workflowStatus: relationData.workflowStatus,
        sourceId: relationData.sourceId,
        verificationState: relationData.verificationState,
        dataOrigin: relationData.dataOrigin,
        isArchived: false,
      },
    });
    return this.mapFacilitySpecialty(row);
  }

  async archiveSpecialtyLink(facilityId: string, specialtyId: string): Promise<boolean> {
    await this.prisma.facilitySpecialty.update({
      where: { facilityId_specialtyId: { facilityId, specialtyId } },
      data: { isArchived: true, workflowStatus: 'ARCHIVED' },
    });
    return true;
  }

  // ---------------------------------------------------------------------------
  // Service Repository
  // ---------------------------------------------------------------------------

  async listServices(): Promise<ServiceCapability[]> {
    const rows = await this.prisma.serviceCapability.findMany();
    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      description: r.description,
    }));
  }

  async findServiceBySlug(slug: string): Promise<ServiceCapability | null> {
    const r = await this.prisma.serviceCapability.findUnique({ where: { slug } });
    if (!r) return null;
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      description: r.description,
    };
  }

  async getFacilityServices(facilityId: string): Promise<FacilityServiceRelation[]> {
    const rows = await this.prisma.facilityService.findMany({
      where: { facilityId, isArchived: false },
      include: { service: true, source: true },
    });
    return rows.map((r: any) => this.mapFacilityService(r));
  }

  async linkService(
    relationData: Omit<FacilityServiceRelation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FacilityServiceRelation> {
    const row = await this.prisma.facilityService.create({
      data: {
        facilityId: relationData.facilityId,
        serviceId: relationData.serviceId,
        is24x7: relationData.is24x7,
        operationalNotes: relationData.operationalNotes,
        workflowStatus: relationData.workflowStatus,
        sourceId: relationData.sourceId,
        verificationState: relationData.verificationState,
        dataOrigin: relationData.dataOrigin,
        isArchived: false,
      },
    });
    return this.mapFacilityService(row);
  }

  async archiveServiceLink(facilityId: string, serviceId: string): Promise<boolean> {
    await this.prisma.facilityService.update({
      where: { facilityId_serviceId: { facilityId, serviceId } },
      data: { isArchived: true, workflowStatus: 'ARCHIVED' },
    });
    return true;
  }

  // ---------------------------------------------------------------------------
  // Scheme Repository
  // ---------------------------------------------------------------------------

  async listSchemes(): Promise<SchemeInsurance[]> {
    const rows = await this.prisma.schemeInsurance.findMany();
    return rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      providerType: r.providerType,
      stateScope: r.stateScope,
      description: r.description,
    }));
  }

  async findByCode(code: string): Promise<SchemeInsurance | null> {
    const r = await this.prisma.schemeInsurance.findUnique({ where: { code } });
    if (!r) return null;
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      providerType: r.providerType,
      stateScope: r.stateScope,
      description: r.description,
    };
  }

  async getFacilitySchemes(facilityId: string): Promise<FacilitySchemeRelation[]> {
    const rows = await this.prisma.facilityScheme.findMany({
      where: { facilityId, isArchived: false },
      include: { scheme: true, source: true },
    });
    return rows.map((r: any) => this.mapFacilityScheme(r));
  }

  async linkScheme(
    relationData: Omit<FacilitySchemeRelation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FacilitySchemeRelation> {
    const row = await this.prisma.facilityScheme.create({
      data: {
        facilityId: relationData.facilityId,
        schemeId: relationData.schemeId,
        empanelmentCategory: relationData.empanelmentCategory,
        helpdeskLocation: relationData.helpdeskLocation,
        effectiveFrom: relationData.effectiveFrom ? new Date(relationData.effectiveFrom) : null,
        effectiveTo: relationData.effectiveTo ? new Date(relationData.effectiveTo) : null,
        workflowStatus: relationData.workflowStatus,
        sourceId: relationData.sourceId,
        verificationState: relationData.verificationState,
        dataOrigin: relationData.dataOrigin,
        isArchived: false,
      },
    });
    return this.mapFacilityScheme(row);
  }

  async archiveSchemeLink(facilityId: string, schemeId: string): Promise<boolean> {
    await this.prisma.facilityScheme.update({
      where: { facilityId_schemeId: { facilityId, schemeId } },
      data: { isArchived: true, workflowStatus: 'ARCHIVED' },
    });
    return true;
  }

  // ---------------------------------------------------------------------------
  // Tariff Repository
  // ---------------------------------------------------------------------------

  async getFacilityTariffs(facilityId: string): Promise<TariffItem[]> {
    const rows = await this.prisma.tariffItem.findMany({
      where: { facilityId, isArchived: false },
    });
    return rows.map((r: any) => this.mapTariffItem(r));
  }

  async addTariffDraft(
    tariffData: Omit<TariffItem, 'id' | 'createdAt' | 'updatedAt' | 'workflowStatus'>
  ): Promise<TariffItem> {
    const row = await this.prisma.tariffItem.create({
      data: {
        facilityId: tariffData.facilityId,
        serviceId: tariffData.serviceId,
        amount: tariffData.amount,
        currency: tariffData.currency,
        unit: tariffData.unit,
        effectiveFrom: tariffData.effectiveFrom ? new Date(tariffData.effectiveFrom) : null,
        effectiveTo: tariffData.effectiveTo ? new Date(tariffData.effectiveTo) : null,
        notes: tariffData.notes,
        workflowStatus: 'DRAFT',
        sourceId: tariffData.sourceId,
        verificationState: tariffData.verificationState,
        dataOrigin: tariffData.dataOrigin,
        isArchived: false,
      },
    });
    return this.mapTariffItem(row);
  }

  async supersedeTariff(id: string, newTariffId: string): Promise<TariffItem> {
    const row = await this.prisma.tariffItem.update({
      where: { id },
      data: {
        isArchived: true,
        workflowStatus: 'ARCHIVED',
        notes: `Superseded by tariff ${newTariffId}`,
      },
    });
    return this.mapTariffItem(row);
  }

  async archiveTariff(id: string): Promise<TariffItem> {
    const row = await this.prisma.tariffItem.update({
      where: { id },
      data: { isArchived: true, workflowStatus: 'ARCHIVED' },
    });
    return this.mapTariffItem(row);
  }

  // ---------------------------------------------------------------------------
  // Availability Repository
  // ---------------------------------------------------------------------------

  async getLatest(facilityId: string, capabilityType: string): Promise<AvailabilityRecord | null> {
    const row = await this.prisma.availabilityRecord.findFirst({
      where: { facilityId, capabilityType },
      orderBy: { observedAt: 'desc' },
    });
    return row ? this.mapAvailabilityRecord(row) : null;
  }

  async recordAvailability(
    recordData: Omit<AvailabilityRecord, 'id' | 'createdAt'>
  ): Promise<AvailabilityRecord> {
    const row = await this.prisma.availabilityRecord.create({
      data: {
        facilityId: recordData.facilityId,
        capabilityType: recordData.capabilityType,
        status: recordData.status,
        observedAt: new Date(recordData.observedAt),
        expiresAt: recordData.expiresAt ? new Date(recordData.expiresAt) : null,
        sourceId: recordData.sourceId,
        verificationState: recordData.verificationState,
        requiresConfirmation: recordData.requiresConfirmation,
        contextNotes: recordData.contextNotes,
        dataOrigin: recordData.dataOrigin,
      },
    });
    return this.mapAvailabilityRecord(row);
  }

  async getHistory(facilityId: string, limit = 10): Promise<AvailabilityRecord[]> {
    const rows = await this.prisma.availabilityRecord.findMany({
      where: { facilityId },
      orderBy: { observedAt: 'desc' },
      take: limit,
    });
    return rows.map((r: any) => this.mapAvailabilityRecord(r));
  }

  // ---------------------------------------------------------------------------
  // Source Repository
  // ---------------------------------------------------------------------------

  async getSourceById(id: string): Promise<SourceProvenance | null> {
    const row = await this.prisma.sourceProvenance.findUnique({ where: { id } });
    return row ? this.mapSourceProvenance(row) : null;
  }

  async createSource(
    sourceData: Omit<SourceProvenance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SourceProvenance> {
    const row = await this.prisma.sourceProvenance.create({
      data: {
        sourceType: sourceData.sourceType,
        sourceOrganization: sourceData.sourceOrganization,
        sourceTitle: sourceData.sourceTitle,
        sourceUrl: sourceData.sourceUrl,
        publishedAt: sourceData.publishedAt ? new Date(sourceData.publishedAt) : null,
        collectedAt: new Date(sourceData.collectedAt),
        lastReviewedAt: sourceData.lastReviewedAt ? new Date(sourceData.lastReviewedAt) : null,
        collectedBy: sourceData.collectedBy,
        reviewedBy: sourceData.reviewedBy,
        verificationState: sourceData.verificationState,
        notes: sourceData.notes,
        dataOrigin: sourceData.dataOrigin,
      },
    });
    return this.mapSourceProvenance(row);
  }

  async updateVerificationState(
    id: string,
    state: VerificationState,
    reviewedBy: string
  ): Promise<SourceProvenance> {
    const row = await this.prisma.sourceProvenance.update({
      where: { id },
      data: {
        verificationState: state,
        reviewedBy,
        lastReviewedAt: new Date(),
      },
    });
    return this.mapSourceProvenance(row);
  }

  // ---------------------------------------------------------------------------
  // Revision Repository
  // ---------------------------------------------------------------------------

  async createRevision(
    revisionData: Omit<RecordRevision, 'id' | 'createdAt'>
  ): Promise<RecordRevision> {
    const row = await this.prisma.recordRevision.create({
      data: {
        entityType: revisionData.entityType,
        entityId: revisionData.entityId,
        revisionNumber: revisionData.revisionNumber,
        changeSummary: revisionData.changeSummary,
        previousData: revisionData.previousData as any,
        newData: revisionData.newData as any,
        createdBy: revisionData.createdBy,
        sourceId: revisionData.sourceId,
      },
    });
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      revisionNumber: row.revisionNumber,
      changeSummary: row.changeSummary,
      previousData: row.previousData as any,
      newData: row.newData as any,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      sourceId: row.sourceId,
    };
  }

  async getRevisionHistory(entityType: string, entityId: string): Promise<RecordRevision[]> {
    const rows = await this.prisma.recordRevision.findMany({
      where: { entityType, entityId },
      orderBy: { revisionNumber: 'desc' },
    });
    return rows.map((r: any) => ({
      id: r.id,
      entityType: r.entityType,
      entityId: r.entityId,
      revisionNumber: r.revisionNumber,
      changeSummary: r.changeSummary,
      previousData: r.previousData,
      newData: r.newData,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
      sourceId: r.sourceId,
    }));
  }

  // ---------------------------------------------------------------------------
  // Correction Repository
  // ---------------------------------------------------------------------------

  async submitCorrection(
    correctionData: Omit<CorrectionSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<CorrectionSubmission> {
    const row = await this.prisma.correctionSubmission.create({
      data: {
        targetEntityType: correctionData.targetEntityType,
        targetEntityId: correctionData.targetEntityId,
        targetField: correctionData.targetField,
        currentValue: correctionData.currentValue,
        proposedValue: correctionData.proposedValue,
        justification: correctionData.justification,
        sourceCitation: correctionData.sourceCitation,
        submitterContact: correctionData.submitterContact,
        status: 'SUBMITTED',
      },
    });
    return this.mapCorrection(row);
  }

  async getCorrectionsForRecord(
    targetEntityType: string,
    targetEntityId: string
  ): Promise<CorrectionSubmission[]> {
    const rows = await this.prisma.correctionSubmission.findMany({
      where: { targetEntityType, targetEntityId },
      orderBy: { submittedAt: 'desc' },
    });
    return rows.map((r: any) => this.mapCorrection(r));
  }

  async reviewCorrection(
    id: string,
    reviewerId: string,
    status: CorrectionSubmission['status'],
    resolutionNotes: string
  ): Promise<CorrectionSubmission> {
    const row = await this.prisma.correctionSubmission.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        resolutionNotes,
        resolvedAt: new Date(),
      },
    });
    return this.mapCorrection(row);
  }

  // ---------------------------------------------------------------------------
  // Audit Log Repository
  // ---------------------------------------------------------------------------

  async recordEntry(
    entryData: Omit<AuditLogEntry, 'id' | 'timestamp'>
  ): Promise<AuditLogEntry> {
    const row = await this.prisma.auditLog.create({
      data: {
        actorId: entryData.actorId,
        actorRole: entryData.actorRole,
        action: entryData.action,
        entityType: entryData.entityType,
        entityId: entryData.entityId,
        previousStateRef: entryData.previousStateRef,
        newStateRef: entryData.newStateRef,
        metadata: entryData.metadata as any,
      },
    });
    return {
      id: row.id,
      actorId: row.actorId,
      actorRole: row.actorRole,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      timestamp: row.timestamp.toISOString(),
      previousStateRef: row.previousStateRef,
      newStateRef: row.newStateRef,
      metadata: row.metadata,
    };
  }

  async getAuditTrail(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'desc' },
    });
    return rows.map((r: any) => ({
      id: r.id,
      actorId: r.actorId,
      actorRole: r.actorRole,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      timestamp: r.timestamp.toISOString(),
      previousStateRef: r.previousStateRef,
      newStateRef: r.newStateRef,
      metadata: r.metadata,
    }));
  }

  // ---------------------------------------------------------------------------
  // Entity Mappers
  // ---------------------------------------------------------------------------

  private mapFacility(r: any): Facility {
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      ownershipType: r.ownershipType,
      description: r.description,
      location: {
        address: r.address,
        locality: r.locality,
        city: r.city,
        district: r.district,
        state: r.state,
        country: r.country,
        postalCode: r.postalCode,
        latitude: r.latitude,
        longitude: r.longitude,
      },
      contact: {
        primaryPhone: r.primaryPhone,
        emergencyPhone: r.emergencyPhone,
        email: r.email,
        websiteUrl: r.websiteUrl,
      },
      operatingHours: r.operatingHours,
      workflowStatus: r.workflowStatus,
      currentRevisionId: r.currentRevisionId,
      sourceId: r.sourceId,
      verificationState: r.verificationState,
      dataOrigin: r.dataOrigin,
      isArchived: r.isArchived,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    };
  }

  private mapHospitalProfile(r: any): HospitalProfile {
    return {
      id: r.id,
      facilityId: r.facilityId,
      hospitalType: r.hospitalType,
      bedCapacityTotal: r.bedCapacityTotal,
      icuBedCapacity: r.icuBedCapacity,
      traumaCapability: r.traumaCapability,
      emergencyIntakeOperational: r.emergencyIntakeOperational,
      isMedicalCollege: r.isMedicalCollege,
      accreditationSummary: r.accreditationSummary,
      workflowStatus: r.workflowStatus,
      currentRevisionId: r.currentRevisionId,
      sourceId: r.sourceId,
      verificationState: r.verificationState,
      dataOrigin: r.dataOrigin,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    };
  }

  private mapFacilitySpecialty(r: any): FacilitySpecialtyRelation {
    return {
      id: r.id,
      facilityId: r.facilityId,
      specialtyId: r.specialtyId,
      opdAvailable: r.opdAvailable,
      inpatientAvailable: r.inpatientAvailable,
      workflowStatus: r.workflowStatus,
      sourceId: r.sourceId,
      verificationState: r.verificationState,
      dataOrigin: r.dataOrigin,
      isArchived: r.isArchived,
      lastReviewedAt: r.lastReviewedAt instanceof Date ? r.lastReviewedAt.toISOString() : r.lastReviewedAt,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    };
  }

  private mapFacilityService(r: any): FacilityServiceRelation {
    return {
      id: r.id,
      facilityId: r.facilityId,
      serviceId: r.serviceId,
      is24x7: r.is24x7,
      operationalNotes: r.operationalNotes,
      workflowStatus: r.workflowStatus,
      sourceId: r.sourceId,
      verificationState: r.verificationState,
      dataOrigin: r.dataOrigin,
      isArchived: r.isArchived,
      lastReviewedAt: r.lastReviewedAt instanceof Date ? r.lastReviewedAt.toISOString() : r.lastReviewedAt,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    };
  }

  private mapFacilityScheme(r: any): FacilitySchemeRelation {
    return {
      id: r.id,
      facilityId: r.facilityId,
      schemeId: r.schemeId,
      empanelmentCategory: r.empanelmentCategory,
      helpdeskLocation: r.helpdeskLocation,
      effectiveFrom: r.effectiveFrom instanceof Date ? r.effectiveFrom.toISOString() : r.effectiveFrom,
      effectiveTo: r.effectiveTo instanceof Date ? r.effectiveTo.toISOString() : r.effectiveTo,
      workflowStatus: r.workflowStatus,
      sourceId: r.sourceId,
      verificationState: r.verificationState,
      dataOrigin: r.dataOrigin,
      isArchived: r.isArchived,
      lastReviewedAt: r.lastReviewedAt instanceof Date ? r.lastReviewedAt.toISOString() : r.lastReviewedAt,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    };
  }

  private mapTariffItem(r: any): TariffItem {
    return {
      id: r.id,
      facilityId: r.facilityId,
      serviceId: r.serviceId,
      amount: r.amount,
      currency: r.currency,
      unit: r.unit,
      effectiveFrom: r.effectiveFrom instanceof Date ? r.effectiveFrom.toISOString() : r.effectiveFrom,
      effectiveTo: r.effectiveTo instanceof Date ? r.effectiveTo.toISOString() : r.effectiveTo,
      notes: r.notes,
      workflowStatus: r.workflowStatus,
      sourceId: r.sourceId,
      verificationState: r.verificationState,
      dataOrigin: r.dataOrigin,
      isArchived: r.isArchived,
      lastReviewedAt: r.lastReviewedAt instanceof Date ? r.lastReviewedAt.toISOString() : r.lastReviewedAt,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    };
  }

  private mapAvailabilityRecord(r: any): AvailabilityRecord {
    return {
      id: r.id,
      facilityId: r.facilityId,
      capabilityType: r.capabilityType,
      status: r.status,
      observedAt: r.observedAt instanceof Date ? r.observedAt.toISOString() : r.observedAt,
      expiresAt: r.expiresAt instanceof Date ? r.expiresAt.toISOString() : r.expiresAt,
      sourceId: r.sourceId,
      verificationState: r.verificationState,
      requiresConfirmation: r.requiresConfirmation,
      contextNotes: r.contextNotes,
      dataOrigin: r.dataOrigin,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    };
  }

  private mapSourceProvenance(r: any): SourceProvenance {
    return {
      id: r.id,
      sourceType: r.sourceType,
      sourceOrganization: r.sourceOrganization,
      sourceTitle: r.sourceTitle,
      sourceUrl: r.sourceUrl,
      publishedAt: r.publishedAt instanceof Date ? r.publishedAt.toISOString() : r.publishedAt,
      collectedAt: r.collectedAt instanceof Date ? r.collectedAt.toISOString() : r.collectedAt,
      lastReviewedAt: r.lastReviewedAt instanceof Date ? r.lastReviewedAt.toISOString() : r.lastReviewedAt,
      collectedBy: r.collectedBy,
      reviewedBy: r.reviewedBy,
      verificationState: r.verificationState,
      notes: r.notes,
      dataOrigin: r.dataOrigin,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    };
  }

  private mapCorrection(r: any): CorrectionSubmission {
    return {
      id: r.id,
      targetEntityType: r.targetEntityType,
      targetEntityId: r.targetEntityId,
      targetField: r.targetField,
      currentValue: r.currentValue,
      proposedValue: r.proposedValue,
      justification: r.justification,
      sourceCitation: r.sourceCitation,
      submitterContact: r.submitterContact,
      status: r.status,
      submittedAt: r.submittedAt instanceof Date ? r.submittedAt.toISOString() : r.submittedAt,
      reviewedBy: r.reviewedBy,
      resolutionNotes: r.resolutionNotes,
      resultingRevisionId: r.resultingRevisionId,
      resolvedAt: r.resolvedAt instanceof Date ? r.resolvedAt.toISOString() : r.resolvedAt,
    };
  }
}
