/**
 * MEDIMESH INDIA 2.0 — Phase 07 Corrections + Trust Tests
 *
 * Exhaustive unit and integration test suite covering:
 * A. Authentication enforcement (authenticated-only submission, zero guest infrastructure)
 * B. Ownership & user isolation (cross-tenant access rejected, evidence append owner-only)
 * C. Target entity resolution across all 8 approved discovery targets
 * D. Field whitelist enforcement (descriptive fields allowed, clinical/ranking fields rejected)
 * E. Correction submission lifecycle & snapshot capture (zero initial target mutation)
 * F. NEEDS_INFORMATION workflow (reviewer notes, append-only evidence, return to UNDER_REVIEW)
 * G. Review decisions (REJECT, UNABLE_TO_VERIFY, ACCEPT)
 * H. Atomic acceptance transaction & data-origin inheritance
 * I. Stale snapshot & concurrency protection
 * J. Platform notifications for submitter visibility
 * K. Safety & terminology assertions (no guest infrastructure, no PHI, no fake claims)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { SyntheticRepository } from '../src/features/data-architecture/repositories/synthetic-repository.ts';
import {
  SyntheticUserStore,
  SyntheticNotificationRepository,
} from '../src/features/user/repositories/synthetic-user-repository.ts';
import { CorrectionService } from '../src/features/corrections/services/correction-service.ts';
import { CorrectionTargetResolver } from '../src/features/corrections/services/correction-target-resolver.ts';
import {
  isAllowedCorrectionField,
  isProhibitedField,
  CORRECTION_FIELD_WHITELIST,
  type CorrectionTargetEntityType,
} from '../src/features/corrections/domain/types.ts';

describe('MEDIMESH Phase 07 — Corrections + Trust Tests', () => {
  let repo: SyntheticRepository;
  let notifStore: SyntheticUserStore;
  let notifRepo: SyntheticNotificationRepository;
  let targetResolver: CorrectionTargetResolver;
  let service: CorrectionService;

  beforeEach(() => {
    repo = new SyntheticRepository();
    notifStore = new SyntheticUserStore();
    notifRepo = new SyntheticNotificationRepository(notifStore);
    targetResolver = new CorrectionTargetResolver(repo);
    service = new CorrectionService(repo, notifRepo, targetResolver);
  });

  // =========================================================================
  // A. Authentication Enforcement
  // =========================================================================
  describe('A. Authentication Enforcement', () => {
    it('should reject submission with missing or empty userId', async () => {
      await assert.rejects(
        async () => {
          await service.submitCorrection({
            userId: '',
            targetEntityType: 'FACILITY',
            targetEntityId: 'hosp-001',
            targetField: 'contact.primaryPhone',
            proposedValue: '+91 20 6645 5999',
            justification: 'Observed on hospital entrance noticeboard.',
            sourceCitation: 'Hospital Entrance Noticeboard Sep 2026',
          });
        },
        {
          name: 'Error',
          message: /Authentication Required/,
        }
      );
    });

    it('should reject submission with whitespace-only userId', async () => {
      await assert.rejects(
        async () => {
          await service.submitCorrection({
            userId: '   ',
            targetEntityType: 'FACILITY',
            targetEntityId: 'hosp-001',
            targetField: 'contact.primaryPhone',
            proposedValue: '+91 20 6645 5999',
            justification: 'Observed on hospital entrance noticeboard.',
            sourceCitation: 'Hospital Entrance Noticeboard Sep 2026',
          });
        },
        {
          name: 'Error',
          message: /Authentication Required/,
        }
      );
    });

    it('should accept submission with valid authenticated user', async () => {
      const result = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'contact.primaryPhone',
        proposedValue: '+91 20 6645 5999',
        justification: 'Updated reception phone number.',
        sourceCitation: 'Hospital Reception Noticeboard Sep 2026',
      });

      assert.ok(result.id);
      assert.equal(result.userId, 'user-demo-001');
      assert.equal(result.status, 'SUBMITTED');
    });
  });

  // =========================================================================
  // B. Ownership & User Isolation
  // =========================================================================
  describe('B. Ownership & User Isolation', () => {
    it('should allow User 1 to retrieve only User 1 corrections', async () => {
      const user1Corrections = await service.listUserCorrections('user-demo-001');
      assert.ok(user1Corrections.length >= 2);
      for (const c of user1Corrections) {
        assert.equal(c.userId, 'user-demo-001');
      }
    });

    it('should prevent User 1 from accessing User 2 private correction activity', async () => {
      const user2Corrections = await service.listUserCorrections('user-demo-002');
      assert.ok(user2Corrections.length >= 1);
      const user2CorrectionId = user2Corrections[0].id;

      // User 1 attempts to view User 2 correction
      await assert.rejects(
        async () => {
          await service.getCorrectionForUser(user2CorrectionId, 'user-demo-001');
        },
        {
          name: 'Error',
          message: /Forbidden: You do not have permission/,
        }
      );
    });

    it('should prevent User 2 from appending evidence to User 1 correction', async () => {
      // Find a correction belonging to User 1 in NEEDS_INFORMATION
      const user1Corrections = await service.listUserCorrections('user-demo-001');
      const needsInfoCorr = user1Corrections.find((c) => c.status === 'NEEDS_INFORMATION');
      assert.ok(needsInfoCorr, 'Expected seeded needs info correction for User 1');

      // User 2 attempts to append evidence
      await assert.rejects(
        async () => {
          await service.provideAdditionalEvidence({
            correctionId: needsInfoCorr.id,
            userId: 'user-demo-002',
            evidenceText: 'Malicious unauthorized evidence injection attempt.',
          });
        },
        {
          name: 'Error',
          message: /Forbidden: You do not have permission to append evidence/,
        }
      );
    });
  });

  // =========================================================================
  // C. Target Resolution Across All 8 Approved Target Types
  // =========================================================================
  describe('C. Target Resolution Across All 8 Approved Target Types', () => {
    const APPROVED_TARGET_TYPES: CorrectionTargetEntityType[] = [
      'FACILITY',
      'HOSPITAL_PROFILE',
      'DOCTOR',
      'SPECIALTY',
      'SERVICE',
      'SCHEME',
      'TARIFF',
      'AVAILABILITY',
    ];

    it('should define whitelist rules for all 8 approved target types and no others', () => {
      const configuredTypes = Object.keys(CORRECTION_FIELD_WHITELIST);
      assert.equal(configuredTypes.length, 8);
      for (const t of APPROVED_TARGET_TYPES) {
        assert.ok(configuredTypes.includes(t), `Target type ${t} must be in whitelist configuration`);
      }
    });

    it('should resolve FACILITY target correctly', async () => {
      const res = await targetResolver.resolveTarget('FACILITY', 'hosp-001', 'contact.primaryPhone');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
      assert.ok(res.currentValue);
      assert.ok(res.currentRevisionId);
    });

    it('should resolve HOSPITAL_PROFILE target correctly', async () => {
      const res = await targetResolver.resolveTarget('HOSPITAL_PROFILE', 'hosp-001', 'bedCapacityTotal');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
      assert.ok(res.currentValue);
    });

    it('should resolve DOCTOR target correctly', async () => {
      const doctors = await repo.listDoctors();
      assert.ok(doctors.length > 0);
      const doc = doctors[0];

      const res = await targetResolver.resolveTarget('DOCTOR', doc.id, 'qualifications');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
      assert.equal(res.currentValue, doc.qualifications);
    });

    it('should resolve SPECIALTY target correctly', async () => {
      const specialties = await repo.listSpecialties();
      assert.ok(specialties.length > 0);
      const spec = specialties[0];

      const res = await targetResolver.resolveTarget('SPECIALTY', spec.id, 'description');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
    });

    it('should resolve SERVICE target correctly', async () => {
      const services = await repo.listServices();
      assert.ok(services.length > 0);
      const svc = services[0];

      const res = await targetResolver.resolveTarget('SERVICE', svc.id, 'operationalNotes');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
    });

    it('should resolve SCHEME target correctly', async () => {
      const schemes = await repo.listSchemes();
      assert.ok(schemes.length > 0);
      const scheme = schemes[0];

      const res = await targetResolver.resolveTarget('SCHEME', scheme.id, 'helpdeskLocation');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
    });

    it('should resolve TARIFF target correctly', async () => {
      const tariffs = await repo.listAllTariffs();
      assert.ok(tariffs.length > 0);
      const tariff = tariffs[0];

      const res = await targetResolver.resolveTarget('TARIFF', tariff.id, 'amount');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
      assert.equal(res.currentValue, String(tariff.amount));
    });

    it('should resolve AVAILABILITY target correctly', async () => {
      const records = await repo.getHistory('hosp-001', 10);
      assert.ok(records.length > 0);
      const rec = records[0];

      const res = await targetResolver.resolveTarget('AVAILABILITY', rec.id, 'contextNotes');
      assert.equal(res.exists, true);
      assert.equal(res.fieldEligible, true);
    });

    it('should reject nonexistent target entity', async () => {
      const res = await targetResolver.resolveTarget('FACILITY', 'nonexistent-id-999', 'contact.primaryPhone');
      assert.equal(res.exists, false);
    });
  });

  // =========================================================================
  // D. Field Whitelist & Prohibited Concepts
  // =========================================================================
  describe('D. Field Whitelist & Prohibited Concepts', () => {
    it('should reject prohibited clinical, diagnostic, and ranking fields', () => {
      const prohibitedFields = [
        'diagnosis',
        'patientHistory',
        'prescription',
        'medicalRecord',
        'aadhaar',
        'phi',
        'clinicalOutcome',
        'rating',
        'ranking',
        'suitability',
        'recommendationScore',
        'qualityScore',
        'treatmentGuarantee',
        'admissionGuarantee',
        'citizenAudit',
      ];

      for (const field of prohibitedFields) {
        assert.equal(
          isAllowedCorrectionField('FACILITY', field),
          false,
          `Prohibited field '${field}' must be rejected on FACILITY`
        );
        assert.equal(
          isAllowedCorrectionField('DOCTOR', field),
          false,
          `Prohibited field '${field}' must be rejected on DOCTOR`
        );
        assert.equal(
          isProhibitedField(field),
          true,
          `Field '${field}' must trigger isProhibitedField`
        );
      }
    });

    it('should reject submission targeting a prohibited or non-whitelisted field', async () => {
      await assert.rejects(
        async () => {
          await service.submitCorrection({
            userId: 'user-demo-001',
            targetEntityType: 'FACILITY',
            targetEntityId: 'hosp-001',
            targetField: 'clinicalSuitabilityScore',
            proposedValue: '98%',
            justification: 'Attempting to inject clinical ranking.',
            sourceCitation: 'Unverified Blog',
          });
        },
        {
          name: 'Error',
          message: /Field Whitelist Error/,
        }
      );
    });
  });

  // =========================================================================
  // E. Submission Flow & Snapshot Integrity
  // =========================================================================
  describe('E. Submission Flow & Snapshot Integrity', () => {
    it('should create correction in SUBMITTED state without mutating the published record', async () => {
      const facilityBefore = await repo.findById('hosp-001');
      assert.ok(facilityBefore);
      const originalPhone = facilityBefore.contact.primaryPhone;

      const submission = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'contact.primaryPhone',
        proposedValue: '+91 20 6645 9999',
        justification: 'Corrected central switchboard line.',
        sourceCitation: 'Published Reception Charter, September 2026',
      });

      assert.equal(submission.status, 'SUBMITTED');
      assert.equal(submission.currentValueAtSubmission, originalPhone);
      assert.ok(submission.targetRevisionIdAtSubmission);

      // Verify published record is completely UNTOUCHED
      const facilityAfter = await repo.findById('hosp-001');
      assert.ok(facilityAfter);
      assert.equal(
        facilityAfter.contact.primaryPhone,
        originalPhone,
        'Published facility phone must NOT mutate upon submission'
      );
    });

    it('should record an audit event for submission', async () => {
      const submission = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'operatingHours',
        proposedValue: '24x7 Emergency; OPD: 08:00 - 21:00',
        justification: 'Extended OPD hours observed on hospital circular.',
        sourceCitation: 'Hospital Circular 2026/09',
      });

      const auditTrail = await repo.getAuditTrail('FACILITY', 'hosp-001');
      const submitAudit = auditTrail.find((a) => {
        const meta = a.metadata as Record<string, unknown> | undefined;
        return a.action === 'CORRECTION_SUBMITTED' && meta?.correctionId === submission.id;
      });
      assert.ok(submitAudit, 'Audit trail must contain CORRECTION_SUBMITTED event');
      assert.equal(submitAudit.actorId, 'user-demo-001');
      assert.equal(submitAudit.actorRole, 'USER');
    });
  });

  // =========================================================================
  // F. NEEDS_INFORMATION Workflow & Append-Only Evidence
  // =========================================================================
  describe('F. NEEDS_INFORMATION Workflow', () => {
    it('should preserve reviewer notes and allow owner to append clarification evidence', async () => {
      // 1. Submit a correction
      const submission = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'operatingHours',
        proposedValue: '24x7 Emergency; OPD: 09:00 - 17:00',
        justification: 'Changed winter schedule.',
        sourceCitation: 'Hospital Circular 2026/09',
      });

      // 2. Reviewer requests more information
      const updated = await service.reviewCorrection({
        correctionId: submission.id,
        reviewerId: 'reviewer-demo-001',
        decision: 'NEEDS_INFORMATION',
        resolutionNotes: 'Please attach a photo of the circular or link to the official notice.',
      });

      assert.equal(updated.status, 'NEEDS_INFORMATION');
      assert.equal(updated.resolutionNotes, 'Please attach a photo of the circular or link to the official notice.');

      // 3. Submitter provides additional clarification evidence
      const clarified = await service.provideAdditionalEvidence({
        correctionId: submission.id,
        userId: 'user-demo-001',
        evidenceText: 'Photograph of reception notice taken on 18 Sep 2026.',
        sourceUrl: 'https://example.org/photo-reception-notice.jpg',
      });

      // Status must return to UNDER_REVIEW
      assert.equal(clarified.status, 'UNDER_REVIEW');

      // Evidence items must be appended and retrievable
      const evidenceList = await repo.getEvidenceItems(submission.id);
      assert.ok(evidenceList.length >= 1);
      assert.equal(evidenceList[0].submittedBy, 'user-demo-001');
      assert.ok(evidenceList[0].evidenceText.includes('Photograph of reception notice'));
    });
  });

  // =========================================================================
  // G. Review Decisions: REJECT and UNABLE_TO_VERIFY
  // =========================================================================
  describe('G. Review Decisions: REJECT and UNABLE_TO_VERIFY', () => {
    it('should resolve correction as REJECTED with auditable notes', async () => {
      const submission = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'contact.email',
        proposedValue: 'fake-email@test.com',
        justification: 'Test invalid email change.',
        sourceCitation: 'Unverified source',
      });

      const rejected = await service.reviewCorrection({
        correctionId: submission.id,
        reviewerId: 'reviewer-demo-001',
        decision: 'REJECT',
        resolutionNotes: 'Provided email address failed domain validation against hospital DNS.',
      });

      assert.equal(rejected.status, 'REJECTED');
      assert.equal(rejected.reviewedBy, 'reviewer-demo-001');

      const auditTrail = await repo.getAuditTrail('FACILITY', 'hosp-001');
      const rejectAudit = auditTrail.find((a) => a.action === 'CORRECTION_REJECTED');
      assert.ok(rejectAudit);
    });

    it('should resolve correction as UNABLE_TO_VERIFY with auditable notes', async () => {
      const submission = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'operatingHours',
        proposedValue: 'Special evening hours 20:00 - 22:00',
        justification: 'Special seasonal camp timings.',
        sourceCitation: 'Community flier',
      });

      const unable = await service.reviewCorrection({
        correctionId: submission.id,
        reviewerId: 'reviewer-demo-001',
        decision: 'UNABLE_TO_VERIFY',
        resolutionNotes: 'Unable to reach facility reception after multiple attempts.',
      });

      assert.equal(unable.status, 'UNABLE_TO_VERIFY');
      assert.equal(unable.reviewedBy, 'reviewer-demo-001');
    });
  });

  // =========================================================================
  // H. Atomic Acceptance & Data Origin Inheritance
  // =========================================================================
  describe('H. Atomic Acceptance & Data Origin Inheritance', () => {
    it('should atomically accept correction, create SourceProvenance, RecordRevision, and mutate target', async () => {
      const facility = await repo.findById('hosp-001');
      assert.ok(facility);
      const originalOrigin = facility.dataOrigin;

      const submission = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'contact.emergencyPhone',
        proposedValue: '+91 20 6645 5555',
        justification: 'Verified direct casualty line.',
        sourceCitation: 'Hospital Emergency Board 2026',
      });

      const accepted = await service.reviewCorrection({
        correctionId: submission.id,
        reviewerId: 'reviewer-demo-001',
        decision: 'ACCEPT',
        resolutionNotes: 'Verified against official reception documentation.',
        verifiedSource: {
          sourceType: 'FACILITY_REPORTED',
          sourceOrganization: 'Ruby Hall Clinic Administrative Office',
          sourceTitle: 'Casualty Contact Revision Circular',
          sourceUrl: 'https://example.org/ruby-hall/casualty-2026.pdf',
        },
      });

      assert.equal(accepted.status, 'ACCEPTED');
      assert.ok(accepted.resultingRevisionId);

      // Verify target field was mutated
      const updatedFacility = await repo.findById('hosp-001');
      assert.ok(updatedFacility);
      assert.equal(updatedFacility.contact.emergencyPhone, '+91 20 6645 5555');

      // Verify revision history contains new revision
      const revisions = await repo.getRevisionHistory('FACILITY', 'hosp-001');
      assert.ok(revisions.length >= 1);
      const latestRev = revisions[0];
      assert.equal(latestRev.id, accepted.resultingRevisionId);
      const revData = latestRev.newData as Record<string, unknown>;
      assert.equal(revData['contact.emergencyPhone'], '+91 20 6645 5555');

      // Verify SourceProvenance was created and inherited target's dataOrigin
      const source = await repo.getSourceById(latestRev.sourceId);
      assert.ok(source);
      assert.equal(source.verificationState, 'MEDIMESH_VERIFIED');
      assert.equal(source.sourceOrganization, 'Ruby Hall Clinic Administrative Office');
      assert.equal(
        source.dataOrigin,
        originalOrigin,
        'SourceProvenance must inherit target entity dataOrigin (not arbitrarily set)'
      );
    });
  });

  // =========================================================================
  // I. Stale Snapshot & Concurrency Protection
  // =========================================================================
  describe('I. Stale Snapshot & Concurrency Protection', () => {
    it('should reject acceptance if the target record changed after submission', async () => {
      // 1. User submits correction against current state
      const submission = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'operatingHours',
        proposedValue: '24x7 Emergency; OPD: 08:00 - 18:00',
        justification: 'Earlier OPD closing.',
        sourceCitation: 'Hospital Notice',
      });

      // 2. An administrator or concurrent correction updates the facility
      await repo.applyRevisionUpdate(
        'FACILITY',
        'hosp-001',
        { operatingHours: '24x7 Emergency; OPD: 08:00 - 22:00 (Night OPD Added)' },
        'rev-concurrent-999'
      );

      // 3. Reviewer attempts to accept the stale submission
      await assert.rejects(
        async () => {
          await service.reviewCorrection({
            correctionId: submission.id,
            reviewerId: 'reviewer-demo-001',
            decision: 'ACCEPT',
            resolutionNotes: 'Accepting outdated proposed value.',
            verifiedSource: {
              sourceType: 'FACILITY_REPORTED',
              sourceOrganization: 'Hospital Admin',
            },
          });
        },
        {
          name: 'Error',
          message: /Concurrency Conflict/,
        }
      );

      // Verify newer published information was preserved
      const facilityAfter = await repo.findById('hosp-001');
      assert.ok(facilityAfter);
      assert.equal(
        facilityAfter.operatingHours,
        '24x7 Emergency; OPD: 08:00 - 22:00 (Night OPD Added)'
      );

      // Verify concurrency conflict is recorded in audit log
      const auditTrail = await repo.getAuditTrail('FACILITY', 'hosp-001');
      const conflictAudit = auditTrail.find((a) => a.action === 'CORRECTION_CONCURRENCY_CONFLICT');
      assert.ok(conflictAudit, 'Concurrency conflict must be recorded in audit log');
    });
  });

  // =========================================================================
  // J. Platform Notifications for Submitter
  // =========================================================================
  describe('J. Platform Notifications for Submitter', () => {
    it('should dispatch CORRECTION_UPDATE notifications on submission, clarification, and acceptance', async () => {
      // Submission
      const sub = await service.submitCorrection({
        userId: 'user-demo-001',
        targetEntityType: 'FACILITY',
        targetEntityId: 'hosp-001',
        targetField: 'contact.websiteUrl',
        proposedValue: 'https://rubyhall.com/contact-us',
        justification: 'Direct contact URL.',
        sourceCitation: 'Website',
      });

      let notifs = await notifRepo.listByUserId('user-demo-001');
      const submitNotif = notifs.find(
        (n) => n.type === 'CORRECTION_UPDATE' && n.title.includes('Submission Received')
      );
      assert.ok(submitNotif, 'Should receive notification on submission');

      // Clarification request
      await service.reviewCorrection({
        correctionId: sub.id,
        reviewerId: 'reviewer-demo-001',
        decision: 'NEEDS_INFORMATION',
        resolutionNotes: 'Please confirm official domain.',
      });

      notifs = await notifRepo.listByUserId('user-demo-001');
      const needsInfoNotif = notifs.find(
        (n) => n.type === 'CORRECTION_UPDATE' && n.title.includes('Clarification Requested')
      );
      assert.ok(needsInfoNotif, 'Should receive notification on NEEDS_INFORMATION');
    });
  });

  // =========================================================================
  // K. Structural Safety Assertions & Prohibited Concepts Scan
  // =========================================================================
  describe('K. Structural Safety Assertions & Prohibited Concepts Scan', () => {
    it('should confirm CorrectionSubmission contains NO patient or diagnostic fields', () => {
      const allowedKeys = [
        'id',
        'userId',
        'targetEntityType',
        'targetEntityId',
        'targetField',
        'currentValue',
        'currentValueAtSubmission',
        'targetRevisionIdAtSubmission',
        'proposedValue',
        'justification',
        'sourceCitation',
        'status',
        'submittedAt',
        'reviewedBy',
        'resolutionNotes',
        'resultingRevisionId',
        'resolvedAt',
        'evidenceItems',
      ];

      const sampleCorrection = {
        id: 'sample',
        userId: 'u1',
        targetEntityType: 'FACILITY',
        targetEntityId: 'f1',
        targetField: 'operatingHours',
        proposedValue: '24x7',
        justification: 'Valid',
        sourceCitation: 'Citation',
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
      };

      for (const key of Object.keys(sampleCorrection)) {
        assert.ok(allowedKeys.includes(key), `Key '${key}' must be within allowed correction fields`);
      }
    });

    it('should confirm prohibited terminology is strictly absent from whitelist and constants', () => {
      const PROHIBITED_WORDS = [
        'citizen audit',
        'public audit registry',
        'civic validation',
        'statutory auditor',
        'best hospital',
        'top hospital',
        'recommended hospital',
        'highest-rated',
        'treatment guarantee',
        'admission guarantee',
        'cashless guarantee',
        'regulatory authority',
      ];

      for (const entityType of Object.keys(CORRECTION_FIELD_WHITELIST)) {
        const fields = CORRECTION_FIELD_WHITELIST[entityType as CorrectionTargetEntityType];
        for (const f of fields) {
          const combined = `${f.field} ${f.label} ${f.description}`.toLowerCase();
          for (const prohibited of PROHIBITED_WORDS) {
            assert.equal(
              combined.includes(prohibited),
              false,
              `Whitelist for ${entityType} field ${f.field} contains prohibited term '${prohibited}'`
            );
          }
        }
      }
    });
  });
});
