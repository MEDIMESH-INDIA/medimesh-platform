import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  SyntheticRepository,
  PrismaRepository,
  type PrismaClientLike,
} from '../src/features/data-architecture/index.ts';
import { generateSyntheticSeedDataset } from '../database/seeds/synthetic-seed.ts';

describe('MEDIMESH Phase 04 — Data Architecture Tests', () => {
  let repo: SyntheticRepository;

  beforeEach(() => {
    repo = new SyntheticRepository();
  });

  // ---------------------------------------------------------------------------
  // 1. Facility Identity Constraints & Required Fields
  // ---------------------------------------------------------------------------
  describe('1. Facility Identity Constraints', () => {
    it('should retrieve a facility by ID with all required identity fields', async () => {
      const facility = await repo.findById('hosp-001');
      assert.ok(facility, 'Facility hosp-001 must exist');
      assert.equal(facility.id, 'hosp-001');
      assert.equal(facility.name, 'MEDIMESH Specialty Heart Center — Bengaluru');
      assert.equal(facility.category, 'Hospital');
      assert.ok(facility.location.city, 'City is required');
      assert.ok(facility.location.state, 'State is required');
      assert.ok(facility.location.postalCode, 'Postal code is required');
      assert.ok(facility.contact.primaryPhone, 'Primary phone is required');
      assert.ok(facility.sourceId, 'Source provenance reference is required');
      assert.equal(facility.workflowStatus, 'PUBLISHED');
      assert.equal(facility.isArchived, false);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Unique Slugs
  // ---------------------------------------------------------------------------
  describe('2. Unique Slug Enforcement', () => {
    it('should find facility by slug and verify all synthetic slugs are distinct', async () => {
      const facility = await repo.findBySlug('medimesh-cardiac-specialty-bengaluru');
      assert.ok(facility, 'Facility must be found by unique slug');
      assert.equal(facility.id, 'hosp-001');

      const allFacilities = await repo.findMany();
      const slugs = allFacilities.map((f) => f.slug);
      const uniqueSlugs = new Set(slugs);
      assert.equal(slugs.length, uniqueSlugs.size, 'All facility slugs must be strictly unique');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Facility-Specialty Relationships
  // ---------------------------------------------------------------------------
  describe('3. Facility-Specialty Relationships', () => {
    it('should retrieve confirmed specialties for a facility and support linking new specialties', async () => {
      const specialties = await repo.getFacilitySpecialties('hosp-001');
      assert.ok(specialties.length > 0, 'Facility should have specialties');

      // Verify relational attributes
      for (const rel of specialties) {
        assert.equal(rel.facilityId, 'hosp-001');
        assert.ok(rel.specialtyId, 'Specialty ID must be present');
        assert.ok(rel.sourceId, 'Each specialty link must have source provenance');
        assert.equal(rel.isArchived, false);
      }

      // Link new specialty
      const newRel = await repo.linkSpecialty({
        facilityId: 'hosp-001',
        specialtyId: 'spec-004',
        opdAvailable: true,
        inpatientAvailable: false,
        workflowStatus: 'PUBLISHED',
        sourceId: 'src-demo-master',
        verificationState: 'MEDIMESH_VERIFIED',
        dataOrigin: 'SYNTHETIC_DEMO',
        isArchived: false,
      });

      assert.ok(newRel.id);
      const updatedList = await repo.getFacilitySpecialties('hosp-001');
      assert.ok(updatedList.some((r) => r.specialtyId === 'spec-004'));
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Facility-Service Relationships
  // ---------------------------------------------------------------------------
  describe('4. Facility-Service Relationships', () => {
    it('should retrieve services and capabilities linked to a facility', async () => {
      const services = await repo.getFacilityServices('hosp-001');
      assert.ok(services.length > 0, 'Facility must have services');

      for (const rel of services) {
        assert.equal(rel.facilityId, 'hosp-001');
        assert.ok(rel.serviceId);
        assert.ok(rel.sourceId, 'Each service capability must link to a source provenance record');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Source / Provenance Attachment
  // ---------------------------------------------------------------------------
  describe('5. Source / Provenance Attachment', () => {
    it('should ensure every facility and relational attribute references a valid SourceProvenance', async () => {
      const facility = await repo.findById('hosp-001');
      assert.ok(facility);

      const source = await repo.getSourceById(facility.sourceId);
      assert.ok(source, 'Source provenance record must exist in repository');
      assert.ok(source.sourceOrganization, 'Source organization is required');
      assert.ok(source.collectedAt, 'CollectedAt timestamp is required');
      assert.ok(source.verificationState, 'Verification state is required');
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Verification States
  // ---------------------------------------------------------------------------
  describe('6. Canonical Verification States', () => {
    it('should strictly accept the 6 canonical verification states', async () => {
      const ALLOWED_STATES = new Set([
        'PUBLIC_SOURCE',
        'FACILITY_REPORTED',
        'MEDIMESH_VERIFIED',
        'PENDING_VERIFICATION',
        'NOT_CONFIRMED',
        'UNABLE_TO_VERIFY',
      ]);

      const source = await repo.createSource({
        sourceType: 'FACILITY_REPORTED',
        sourceOrganization: 'Hospital Operations Desk',
        collectedAt: new Date().toISOString(),
        verificationState: 'PENDING_VERIFICATION',
        dataOrigin: 'SYNTHETIC_DEMO',
      });

      assert.ok(ALLOWED_STATES.has(source.verificationState));

      // Update verification state
      const updated = await repo.updateVerificationState(source.id, 'MEDIMESH_VERIFIED', 'Reviewer-42');
      assert.equal(updated.verificationState, 'MEDIMESH_VERIFIED');
      assert.equal(updated.reviewedBy, 'Reviewer-42');
      assert.ok(updated.lastReviewedAt);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Research -> Review -> Publication Workflow
  // ---------------------------------------------------------------------------
  describe('7. Publication Workflow Rules', () => {
    it('should create new records as DRAFT and restrict direct mutation of published records', async () => {
      // 1. Create draft facility
      const draft = await repo.createDraft({
        slug: 'new-research-hospital',
        name: 'Staged Research Hospital',
        category: 'Hospital',
        description: 'Hospital entered by research team',
        location: {
          address: '42 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
          postalCode: '560001',
        },
        contact: {
          primaryPhone: '+91 80 0000 0000',
        },
        sourceId: 'src-demo-master',
        verificationState: 'PENDING_VERIFICATION',
        dataOrigin: 'STAGED_RESEARCH',
        isArchived: false,
      });

      assert.equal(draft.workflowStatus, 'DRAFT');

      // 2. Can update while in DRAFT
      const updatedDraft = await repo.updateDraft(draft.id, { name: 'Updated Research Hospital' });
      assert.equal(updatedDraft.name, 'Updated Research Hospital');

      // 3. Published records reject direct mutation without revision
      const published = await repo.findById('hosp-001');
      assert.ok(published);
      assert.equal(published.workflowStatus, 'PUBLISHED');

      await assert.rejects(
        async () => {
          await repo.updateDraft(published.id, { name: 'Direct Mutation Attempt' });
        },
        /Cannot directly update published/
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Correction Workflow Rules
  // ---------------------------------------------------------------------------
  describe('8. Correction Workflow Rules', () => {
    it('should submit a correction without mutating the target published record', async () => {
      const facility = await repo.findById('hosp-001');
      assert.ok(facility);
      const originalName = facility.name;

      // Submit public correction
      const correction = await repo.submitCorrection({
        targetEntityType: 'Facility',
        targetEntityId: facility.id,
        targetField: 'contact.primaryPhone',
        currentValue: facility.contact.primaryPhone,
        proposedValue: '+91 80 9999 9999',
        justification: 'Hospital reported new main desk line',
        sourceCitation: 'Public Gazette Notice 2026',
        submitterContact: 'researcher@medimesh.in',
      });

      assert.equal(correction.status, 'SUBMITTED');
      assert.ok(correction.submittedAt);

      // Verify target record remains unchanged during review
      const unchangedFacility = await repo.findById('hosp-001');
      assert.equal(unchangedFacility?.name, originalName);

      // Review and accept correction
      const reviewed = await repo.reviewCorrection(
        correction.id,
        'Senior-Reviewer-01',
        'ACCEPTED',
        'Verified against municipal notification'
      );
      assert.equal(reviewed.status, 'ACCEPTED');
      assert.equal(reviewed.reviewedBy, 'Senior-Reviewer-01');
      assert.ok(reviewed.resolvedAt);
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Historical Versioning & Revision Tracking
  // ---------------------------------------------------------------------------
  describe('9. Historical Revision Tracking', () => {
    it('should record revisions and preserve previous data states', async () => {
      const revision = await repo.createRevision({
        entityType: 'HospitalProfile',
        entityId: 'hosp-001',
        revisionNumber: 2,
        changeSummary: 'ICU capacity updated from 30 to 32 beds',
        previousData: { icuBedCapacity: 30 },
        newData: { icuBedCapacity: 32 },
        createdBy: 'Research-Team-03',
        sourceId: 'src-demo-master',
      });

      assert.equal(revision.revisionNumber, 2);
      assert.equal(revision.changeSummary, 'ICU capacity updated from 30 to 32 beds');

      const history = await repo.getRevisionHistory('HospitalProfile', 'hosp-001');
      assert.ok(history.length > 0);
      assert.equal(history[0].revisionNumber, 2);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Demo Data Isolation
  // ---------------------------------------------------------------------------
  describe('10. Demo Data Isolation', () => {
    it('should enforce dataOrigin = SYNTHETIC_DEMO for all demo records with zero fake URLs', async () => {
      const seed = generateSyntheticSeedDataset();

      for (const facility of seed.facilities) {
        assert.equal(facility.dataOrigin, 'SYNTHETIC_DEMO');
        assert.equal(facility.contact.websiteUrl, undefined, 'Demo records must not have fake external URLs');
        assert.ok(facility.contact.primaryPhone.includes('Demo'), 'Demo records must denote demo phone');
      }

      for (const profile of seed.hospitalProfiles) {
        assert.equal(profile.dataOrigin, 'SYNTHETIC_DEMO');
      }

      for (const source of seed.sources) {
        assert.equal(source.dataOrigin, 'SYNTHETIC_DEMO');
        assert.equal(source.sourceType, 'SYNTHETIC_DEMO');
        assert.ok(source.sourceOrganization.includes('Demo'));
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Availability Freshness & Non-Guarantee Semantics
  // ---------------------------------------------------------------------------
  describe('11. Availability Freshness & Non-Guarantee Semantics', () => {
    it('should track observed availability timestamps and enforce confirmation requirement', async () => {
      const record = await repo.recordAvailability({
        facilityId: 'hosp-001',
        capabilityType: 'CASUALTY',
        status: 'ACTIVE',
        observedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        sourceId: 'src-demo-master',
        verificationState: 'FACILITY_REPORTED',
        requiresConfirmation: true,
        contextNotes: 'Intake operational. Subject to clinical intake capacity.',
        dataOrigin: 'SYNTHETIC_DEMO',
      });

      assert.equal(record.requiresConfirmation, true, 'Availability must always require confirmation');
      assert.ok(record.observedAt);
      assert.ok(record.expiresAt);

      const latest = await repo.getLatest('hosp-001', 'CASUALTY');
      assert.ok(latest);
      assert.equal(latest.status, 'ACTIVE');
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Tariff Effective-Period & Neutrality
  // ---------------------------------------------------------------------------
  describe('12. Tariff Effective-Period & Neutrality', () => {
    it('should record informational tariffs with effective windows and non-promotional fields', async () => {
      const tariff = await repo.addTariffDraft({
        facilityId: 'hosp-001',
        serviceId: 'svc-001',
        amount: 8500,
        currency: 'INR',
        unit: 'per procedure',
        effectiveFrom: '2026-01-01T00:00:00.000Z',
        effectiveTo: '2026-12-31T23:59:59.000Z',
        notes: 'Informational tariff reported in hospital schedule',
        sourceId: 'src-demo-master',
        verificationState: 'PUBLIC_SOURCE',
        dataOrigin: 'SYNTHETIC_DEMO',
        isArchived: false,
      });

      assert.equal(tariff.amount, 8500);
      assert.equal(tariff.currency, 'INR');
      assert.ok(tariff.effectiveFrom);
      assert.ok(tariff.effectiveTo);
      assert.equal(tariff.isArchived, false);

      // Non-destructive supersede
      const superseded = await repo.supersedeTariff(tariff.id, 'tar-new-2027');
      assert.equal(superseded.isArchived, true);
      assert.equal(superseded.workflowStatus, 'ARCHIVED');
      assert.ok(superseded.notes?.includes('Superseded by tariff tar-new-2027'));
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Repository Boundary Abstraction & Non-Destructive Deletion Enforcement
  // ---------------------------------------------------------------------------
  describe('13. Repository Boundary & Non-Destructive Lifecycle', () => {
    it('should strictly prohibit hard delete on published facilities and enforce archive() instead', async () => {
      const published = await repo.findById('hosp-001');
      assert.ok(published);

      // Attempting to hard delete a published record MUST fail
      await assert.rejects(
        async () => {
          await repo.hardDeleteDraft(published.id);
        },
        /Non-destructive rule violation/
      );

      // Archiving must succeed and record audit trail
      const archived = await repo.archive(published.id, 'Facility closed down permanently');
      assert.equal(archived.isArchived, true);
      assert.equal(archived.workflowStatus, 'ARCHIVED');

      // Audit trail must be recorded
      const audit = await repo.getAuditTrail('Facility', published.id);
      assert.ok(audit.length > 0);
      assert.equal(audit[0].action, 'ARCHIVE_FACILITY');
    });

    it('should allow hard delete ONLY on unreviewed DRAFT records', async () => {
      const draft = await repo.createDraft({
        slug: 'temporary-erroneous-draft',
        name: 'Mistyped Draft Facility',
        category: 'Clinic',
        description: 'Accidental entry',
        location: {
          address: 'None',
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '411001',
        },
        contact: {
          primaryPhone: '+91 20 0000 0000',
        },
        sourceId: 'src-demo-master',
        verificationState: 'PENDING_VERIFICATION',
        dataOrigin: 'SYNTHETIC_DEMO',
        isArchived: false,
      });

      assert.equal(draft.workflowStatus, 'DRAFT');
      const deleted = await repo.hardDeleteDraft(draft.id);
      assert.equal(deleted, true);

      const check = await repo.findById(draft.id);
      assert.equal(check, null);
    });

    it('should verify PrismaRepository conforms to the same domain interface contract', () => {
      // Mock Prisma client to verify type-compatibility and interface conformance
      const mockPrismaClient = {
        facility: { findUnique: async () => null, findMany: async () => [] },
        hospitalProfile: { findUnique: async () => null },
        specialty: { findMany: async () => [] },
        facilitySpecialty: { findMany: async () => [] },
        serviceCapability: { findMany: async () => [] },
        facilityService: { findMany: async () => [] },
        schemeInsurance: { findMany: async () => [] },
        facilityScheme: { findMany: async () => [] },
        tariffItem: { findMany: async () => [] },
        availabilityRecord: { findFirst: async () => null },
        sourceProvenance: { findUnique: async () => null },
        recordRevision: { findMany: async () => [] },
        workflowReview: {},
        correctionSubmission: { findMany: async () => [] },
        auditLog: { findMany: async () => [] },
      };

      const prismaRepo = new PrismaRepository(mockPrismaClient as unknown as PrismaClientLike);
      assert.ok(typeof prismaRepo.findById === 'function');
      assert.ok(typeof prismaRepo.findBySlug === 'function');
      assert.ok(typeof prismaRepo.createDraft === 'function');
      assert.ok(typeof prismaRepo.archive === 'function');
      assert.ok(typeof prismaRepo.hardDeleteDraft === 'function');
      assert.ok(typeof prismaRepo.getProfileByFacilityId === 'function');
      assert.ok(typeof prismaRepo.submitCorrection === 'function');
      assert.ok(typeof prismaRepo.recordEntry === 'function');
    });
  });
});
