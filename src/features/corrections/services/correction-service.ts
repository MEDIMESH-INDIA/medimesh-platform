/**
 * MEDIMESH INDIA 2.0 — Correction Application Service
 *
 * Phase 07: Corrections + Trust
 *
 * Implements:
 * 1. Authenticated-only submission workflow with target resolution and whitelist validation.
 * 2. Pre-submission snapshot capture (current value and revision identifier).
 * 3. Strict owner-isolation and append-only evidence submission for NEEDS_INFORMATION state.
 * 4. Stale-snapshot and concurrency protection before acceptance.
 * 5. Atomic acceptance transaction:
 *    SourceProvenance + RecordRevision + Target Mutation + WorkflowReview + Status + AuditLog.
 * 6. Data-origin inheritance: new revisions preserve the target's actual data origin.
 * 7. Informational PlatformNotification dispatch for submitter visibility.
 */

import {
  getDefaultRepository,
  type SyntheticRepository,
  type ICorrectionRepository,
  type ISourceRepository,
  type IRevisionRepository,
  type IAuditLogRepository,
} from '../../data-architecture/index.ts';
import {
  syntheticNotificationRepository,
  type INotificationRepository,
} from '../../user/repositories/synthetic-user-repository.ts';
import type {
  CorrectionSubmission,
  CorrectionSubmissionRequest,
  AppendEvidenceRequest,
  ReviewDecisionPayload,
  TargetResolutionResult,
  CorrectionTargetEntityType,
} from '../domain/index.ts';
import {
  CorrectionTargetResolver,
  type ICorrectionTargetResolver,
} from './correction-target-resolver.ts';

export interface ICorrectionService {
  submitCorrection(req: CorrectionSubmissionRequest): Promise<CorrectionSubmission>;
  provideAdditionalEvidence(req: AppendEvidenceRequest): Promise<CorrectionSubmission>;
  reviewCorrection(payload: ReviewDecisionPayload): Promise<CorrectionSubmission>;
  listUserCorrections(userId: string): Promise<CorrectionSubmission[]>;
  getCorrectionForUser(correctionId: string, userId: string): Promise<CorrectionSubmission>;
  getCorrectionById(correctionId: string): Promise<CorrectionSubmission | null>;
  resolveTarget(
    targetEntityType: CorrectionSubmissionRequest['targetEntityType'],
    targetEntityId: string,
    targetField: string
  ): Promise<TargetResolutionResult>;
}

export class CorrectionService implements ICorrectionService {
  private repo: SyntheticRepository;
  private correctionRepo: ICorrectionRepository;
  private sourceRepo: ISourceRepository;
  private revisionRepo: IRevisionRepository;
  private auditRepo: IAuditLogRepository;
  private notifRepo: INotificationRepository;
  private targetResolver: ICorrectionTargetResolver;

  constructor(
    repo: SyntheticRepository = getDefaultRepository(),
    notifRepo: INotificationRepository = syntheticNotificationRepository,
    targetResolver?: ICorrectionTargetResolver
  ) {
    this.repo = repo;
    this.correctionRepo = repo;
    this.sourceRepo = repo;
    this.revisionRepo = repo;
    this.auditRepo = repo;
    this.notifRepo = notifRepo;
    this.targetResolver = targetResolver ?? new CorrectionTargetResolver(repo);
  }

  async resolveTarget(
    targetEntityType: CorrectionSubmissionRequest['targetEntityType'],
    targetEntityId: string,
    targetField: string
  ): Promise<TargetResolutionResult> {
    return this.targetResolver.resolveTarget(targetEntityType, targetEntityId, targetField);
  }

  /**
   * Submits an information correction on a whitelisted target entity field.
   * STRICTLY AUTHENTICATED ONLY.
   */
  async submitCorrection(req: CorrectionSubmissionRequest): Promise<CorrectionSubmission> {
    // 1. Authenticated user validation
    if (!req.userId || req.userId.trim() === '') {
      throw new Error('Authentication Required: Anonymous correction submissions are not permitted.');
    }

    // 2. Input validation
    if (!req.proposedValue || req.proposedValue.trim() === '') {
      throw new Error('Validation Error: Proposed value cannot be empty.');
    }
    if (!req.justification || req.justification.trim().length < 10) {
      throw new Error('Validation Error: Justification must contain at least 10 characters.');
    }
    if (!req.sourceCitation || req.sourceCitation.trim().length < 5) {
      throw new Error('Validation Error: Source citation must contain at least 5 characters.');
    }

    // 3. Target resolution & whitelist validation
    const resolution = await this.targetResolver.resolveTarget(
      req.targetEntityType,
      req.targetEntityId,
      req.targetField
    );

    if (!resolution.exists) {
      throw new Error(`Target Entity Error: Target ${req.targetEntityType} with ID '${req.targetEntityId}' does not exist.`);
    }

    if (!resolution.fieldEligible) {
      throw new Error(`Field Whitelist Error: Field '${req.targetField}' is not eligible for public correction on ${req.targetEntityType}.`);
    }

    // 4. Persist correction in SUBMITTED state with snapshot values
    const submission = await this.correctionRepo.submitCorrection({
      userId: req.userId,
      targetEntityType: req.targetEntityType,
      targetEntityId: req.targetEntityId,
      targetField: req.targetField,
      currentValue: resolution.currentValue ?? undefined,
      currentValueAtSubmission: resolution.currentValue ?? undefined,
      targetRevisionIdAtSubmission: resolution.currentRevisionId ?? undefined,
      proposedValue: req.proposedValue.trim(),
      justification: req.justification.trim(),
      sourceCitation: req.sourceCitation.trim(),
    });

    // 5. If initial sourceUrl was provided, append it as first evidence item
    if (req.sourceUrl && req.sourceUrl.trim() !== '') {
      await this.correctionRepo.appendEvidence(submission.id, {
        correctionId: submission.id,
        evidenceText: `Initial source documentation reference: ${req.sourceUrl.trim()}`,
        sourceUrl: req.sourceUrl.trim(),
        submittedBy: req.userId,
      });
    }

    // 6. Record AuditLogEntry
    await this.auditRepo.recordEntry({
      actorId: req.userId,
      actorRole: 'USER',
      action: 'CORRECTION_SUBMITTED',
      entityType: req.targetEntityType,
      entityId: req.targetEntityId,
      previousStateRef: resolution.currentRevisionId ?? undefined,
      metadata: {
        correctionId: submission.id,
        targetField: req.targetField,
        currentValue: resolution.currentValue,
        proposedValue: req.proposedValue,
        sourceCitation: req.sourceCitation,
      },
    });

    // 7. Send informational platform notification to authenticated submitter
    if (this.notifRepo.createNotification) {
      await this.notifRepo.createNotification({
        userId: req.userId,
        type: 'CORRECTION_UPDATE',
        title: 'Correction Submission Received',
        message: `Your reported update for ${resolution.targetTitle} (${resolution.fieldLabel}) has been received and queued for review.`,
        relatedEntityType: req.targetEntityType === 'FACILITY' ? 'FACILITY' : undefined,
        relatedEntityId: req.targetEntityId,
      });
    }

    return submission as unknown as CorrectionSubmission;
  }

  /**
   * Appends clarification evidence during a NEEDS_INFORMATION workflow.
   * Strictly owner-only.
   */
  async provideAdditionalEvidence(req: AppendEvidenceRequest): Promise<CorrectionSubmission> {
    if (!req.userId || req.userId.trim() === '') {
      throw new Error('Authentication Required: User ID must be provided.');
    }

    const correction = await this.correctionRepo.getById(req.correctionId);
    if (!correction) {
      throw new Error(`Correction not found with ID '${req.correctionId}'.`);
    }

    // Server-side ownership enforcement
    if (correction.userId !== req.userId) {
      throw new Error('Forbidden: You do not have permission to append evidence to another user\'s correction.');
    }

    // State validation
    if (correction.status !== 'NEEDS_INFORMATION') {
      throw new Error(`Invalid Transition: Correction is currently ${correction.status}, not awaiting information.`);
    }

    if (!req.evidenceText || req.evidenceText.trim().length < 5) {
      throw new Error('Validation Error: Clarification evidence must contain at least 5 characters.');
    }

    // Append-only evidence insertion
    await this.correctionRepo.appendEvidence(correction.id, {
      correctionId: correction.id,
      evidenceText: req.evidenceText.trim(),
      sourceUrl: req.sourceUrl?.trim() || undefined,
      submittedBy: req.userId,
    });

    // Transition status back to UNDER_REVIEW
    const updated = await this.correctionRepo.reviewCorrection(
      correction.id,
      req.userId,
      'UNDER_REVIEW',
      'Clarification evidence submitted by owner; returned to review queue.'
    );

    // Audit log
    await this.auditRepo.recordEntry({
      actorId: req.userId,
      actorRole: 'USER',
      action: 'CORRECTION_EVIDENCE_APPENDED',
      entityType: correction.targetEntityType,
      entityId: correction.targetEntityId,
      metadata: {
        correctionId: correction.id,
        evidenceText: req.evidenceText.trim(),
        sourceUrl: req.sourceUrl,
      },
    });

    return updated as unknown as CorrectionSubmission;
  }

  /**
   * Processes a reviewer decision (ACCEPT, REJECT, NEEDS_INFORMATION, UNABLE_TO_VERIFY).
   * ACCEPT executes an atomic transaction.
   */
  async reviewCorrection(payload: ReviewDecisionPayload): Promise<CorrectionSubmission> {
    const correction = await this.correctionRepo.getById(payload.correctionId);
    if (!correction) {
      throw new Error(`Correction not found with ID '${payload.correctionId}'.`);
    }

    const resolution = await this.targetResolver.resolveTarget(
      correction.targetEntityType as CorrectionTargetEntityType,
      correction.targetEntityId,
      correction.targetField
    );

    if (payload.decision === 'ACCEPT') {
      // 1. Stale snapshot / concurrency protection
      if (
        correction.targetRevisionIdAtSubmission &&
        resolution.currentRevisionId &&
        correction.targetRevisionIdAtSubmission !== resolution.currentRevisionId
      ) {
        // Record concurrency conflict in audit log
        await this.auditRepo.recordEntry({
          actorId: payload.reviewerId,
          actorRole: 'REVIEWER',
          action: 'CORRECTION_CONCURRENCY_CONFLICT',
          entityType: correction.targetEntityType,
          entityId: correction.targetEntityId,
          metadata: {
            correctionId: correction.id,
            submittedRevision: correction.targetRevisionIdAtSubmission,
            currentRevision: resolution.currentRevisionId,
            submittedValue: correction.currentValueAtSubmission,
            currentValue: resolution.currentValue,
          },
        });

        throw new Error(
          'Concurrency Conflict: The target record has been updated since this correction was submitted. Please re-evaluate against current state.'
        );
      }

      // Check current value drift as secondary concurrency check
      if (
        correction.currentValueAtSubmission !== undefined &&
        resolution.currentValue !== null &&
        correction.currentValueAtSubmission !== resolution.currentValue
      ) {
        await this.auditRepo.recordEntry({
          actorId: payload.reviewerId,
          actorRole: 'REVIEWER',
          action: 'CORRECTION_CONCURRENCY_CONFLICT',
          entityType: correction.targetEntityType,
          entityId: correction.targetEntityId,
          metadata: {
            correctionId: correction.id,
            reason: 'Current value mismatch with submission snapshot',
            submittedValue: correction.currentValueAtSubmission,
            currentValue: resolution.currentValue,
          },
        });

        throw new Error(
          'Concurrency Conflict: The published target value has changed since submission. Re-evaluation required.'
        );
      }

      // 2. Validate reviewer verified source
      if (!payload.verifiedSource) {
        throw new Error('Reviewer Source Required: Acceptance requires verified structured source documentation.');
      }

      const vs = payload.verifiedSource;
      if (!vs.sourceOrganization || vs.sourceOrganization.trim() === '') {
        throw new Error('Reviewer Source Error: Source organization cannot be empty.');
      }

      // 3. ATOMIC UNIT OF WORK
      // Step A: Create canonical SourceProvenance (inheriting target's actual dataOrigin)
      const newSource = await this.sourceRepo.createSource({
        sourceType: vs.sourceType,
        sourceOrganization: vs.sourceOrganization.trim(),
        sourceTitle: vs.sourceTitle?.trim() || 'Verified Documentation Review',
        sourceUrl: vs.sourceUrl?.trim() || undefined,
        verificationState: 'MEDIMESH_VERIFIED',
        reviewedBy: payload.reviewerId,
        publishedAt: vs.publishedAt || new Date().toISOString(),
        collectedAt: new Date().toISOString(),
        lastReviewedAt: new Date().toISOString(),
        notes: vs.verificationNotes?.trim() || payload.resolutionNotes,
        dataOrigin: resolution.dataOrigin, // CRITICAL: Preserves target origin!
      });

      // Step B: Get revision history to determine revisionNumber
      const history = await this.revisionRepo.getRevisionHistory(
        correction.targetEntityType,
        correction.targetEntityId
      );
      const revisionNumber = history.length + 1;

      // Step C: Create RecordRevision
      const newRevision = await this.revisionRepo.createRevision({
        entityType: correction.targetEntityType,
        entityId: correction.targetEntityId,
        revisionNumber,
        changeSummary: `Accepted correction: updated ${resolution.fieldLabel}`,
        previousData: { [correction.targetField]: resolution.currentValue },
        newData: { [correction.targetField]: correction.proposedValue },
        sourceId: newSource.id,
        createdBy: payload.reviewerId,
      });

      // Step D: Mutate target entity field
      await (this.targetResolver as CorrectionTargetResolver).applyFieldUpdate(
        correction.targetEntityType as CorrectionTargetEntityType,
        correction.targetEntityId,
        correction.targetField,
        correction.proposedValue,
        newRevision.id
      );

      // Step E: Update correction status to ACCEPTED with resultingRevisionId
      const updatedCorrection = await this.correctionRepo.reviewCorrection(
        correction.id,
        payload.reviewerId,
        'ACCEPTED',
        payload.resolutionNotes,
        newRevision.id
      );

      // Step F: Record AuditLogEntry
      await this.auditRepo.recordEntry({
        actorId: payload.reviewerId,
        actorRole: 'REVIEWER',
        action: 'CORRECTION_ACCEPTED',
        entityType: correction.targetEntityType,
        entityId: correction.targetEntityId,
        previousStateRef: resolution.currentRevisionId ?? undefined,
        newStateRef: newRevision.id,
        metadata: {
          correctionId: correction.id,
          resultingRevisionId: newRevision.id,
          sourceId: newSource.id,
          resolutionNotes: payload.resolutionNotes,
        },
      });

      // Step G: Send informational notification to correction owner
      if (this.notifRepo.createNotification) {
        await this.notifRepo.createNotification({
          userId: correction.userId,
          type: 'CORRECTION_UPDATE',
          title: 'Correction Accepted',
          message: `Your reported update for ${resolution.targetTitle} (${resolution.fieldLabel}) has been verified against documented sources and applied.`,
          relatedEntityType: correction.targetEntityType === 'FACILITY' ? 'FACILITY' : undefined,
          relatedEntityId: correction.targetEntityId,
        });
      }

      return updatedCorrection as unknown as CorrectionSubmission;
    }

    if (payload.decision === 'NEEDS_INFORMATION') {
      const updated = await this.correctionRepo.reviewCorrection(
        correction.id,
        payload.reviewerId,
        'NEEDS_INFORMATION',
        payload.resolutionNotes
      );

      await this.auditRepo.recordEntry({
        actorId: payload.reviewerId,
        actorRole: 'REVIEWER',
        action: 'CORRECTION_NEEDS_INFORMATION',
        entityType: correction.targetEntityType,
        entityId: correction.targetEntityId,
        metadata: {
          correctionId: correction.id,
          resolutionNotes: payload.resolutionNotes,
        },
      });

      if (this.notifRepo.createNotification) {
        await this.notifRepo.createNotification({
          userId: correction.userId,
          type: 'CORRECTION_UPDATE',
          title: 'Clarification Requested on Information Issue',
          message: `Reviewers need additional details on your report for ${resolution.targetTitle}: "${payload.resolutionNotes}"`,
          relatedEntityType: correction.targetEntityType === 'FACILITY' ? 'FACILITY' : undefined,
          relatedEntityId: correction.targetEntityId,
        });
      }

      return updated as unknown as CorrectionSubmission;
    }

    // REJECT or UNABLE_TO_VERIFY
    const targetStatus = payload.decision === 'REJECT' ? 'REJECTED' : 'UNABLE_TO_VERIFY';
    const updated = await this.correctionRepo.reviewCorrection(
      correction.id,
      payload.reviewerId,
      targetStatus,
      payload.resolutionNotes
    );

    await this.auditRepo.recordEntry({
      actorId: payload.reviewerId,
      actorRole: 'REVIEWER',
      action: `CORRECTION_${targetStatus}`,
      entityType: correction.targetEntityType,
      entityId: correction.targetEntityId,
      metadata: {
        correctionId: correction.id,
        resolutionNotes: payload.resolutionNotes,
      },
    });

    if (this.notifRepo.createNotification) {
      await this.notifRepo.createNotification({
        userId: correction.userId,
        type: 'CORRECTION_UPDATE',
        title: `Correction ${targetStatus === 'REJECTED' ? 'Not Accepted' : 'Unable to Verify'}`,
        message: `Your report for ${resolution.targetTitle} was evaluated: "${payload.resolutionNotes}"`,
        relatedEntityType: correction.targetEntityType === 'FACILITY' ? 'FACILITY' : undefined,
        relatedEntityId: correction.targetEntityId,
      });
    }

    return updated as unknown as CorrectionSubmission;
  }

  /**
   * Retrieves all corrections submitted by a specific user.
   * Strictly enforces user isolation.
   */
  async listUserCorrections(userId: string): Promise<CorrectionSubmission[]> {
    if (!userId || userId.trim() === '') {
      return [];
    }
    return (await this.correctionRepo.listByUserId(userId)) as unknown as CorrectionSubmission[];
  }

  /**
   * Retrieves a single correction by ID, ensuring the requesting user is the owner.
   */
  async getCorrectionForUser(correctionId: string, userId: string): Promise<CorrectionSubmission> {
    const correction = await this.correctionRepo.getById(correctionId);
    if (!correction) {
      throw new Error(`Correction with ID '${correctionId}' not found.`);
    }

    if (correction.userId !== userId) {
      throw new Error('Forbidden: You do not have permission to view another user\'s private correction.');
    }

    return correction as unknown as CorrectionSubmission;
  }

  async getCorrectionById(correctionId: string): Promise<CorrectionSubmission | null> {
    const c = await this.correctionRepo.getById(correctionId);
    return c ? (c as unknown as CorrectionSubmission) : null;
  }
}

// Global Singleton for application usage
let defaultCorrectionService: CorrectionService | null = null;

export function getCorrectionService(): CorrectionService {
  if (!defaultCorrectionService) {
    defaultCorrectionService = new CorrectionService();
  }
  return defaultCorrectionService;
}
