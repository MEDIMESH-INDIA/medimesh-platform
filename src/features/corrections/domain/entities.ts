/**
 * MEDIMESH INDIA 2.0 — Correction Domain Entities & DTOs
 *
 * Phase 07: Corrections + Trust
 *
 * Establishes clean domain models for:
 * 1. Raw submitter evidence (untrusted citation metadata).
 * 2. Append-only clarification evidence items (NEEDS_INFORMATION workflow).
 * 3. Correction submissions (with strict ownership, status lifecycle, snapshot data).
 * 4. Reviewer-verified source input and atomic review decision payloads.
 * 5. Target resolution DTOs for decoupled entity inspection.
 */

import type { SourceType, DataOrigin } from '../../data-architecture/domain/index.ts';
import type { CorrectionStatus, CorrectionTargetEntityType } from './types.ts';

/**
 * Raw submitter-provided evidence. Untrusted until reviewer evaluation.
 * Kept strictly separate from canonical SourceProvenance.
 */
export interface SubmissionEvidence {
  sourceCitation: string;
  sourceUrl?: string;
  submittedAt: string;
}

/**
 * Append-only clarification evidence item provided during NEEDS_INFORMATION workflow.
 */
export interface CorrectionEvidenceItem {
  id: string;
  correctionId: string;
  evidenceText: string;
  sourceUrl?: string;
  submittedBy: string; // Authenticated userId of the submitter
  submittedAt: string;
}

/**
 * Full domain entity representing a public information correction.
 * Belongs to exactly one authenticated User.
 */
export interface CorrectionSubmission {
  id: string;
  userId: string;
  targetEntityType: CorrectionTargetEntityType;
  targetEntityId: string;
  targetField: string;
  currentValue?: string;
  currentValueAtSubmission?: string;
  targetRevisionIdAtSubmission?: string;
  proposedValue: string;
  justification: string;
  sourceCitation: string;
  status: CorrectionStatus;
  submittedAt: string;
  reviewedBy?: string;
  resolutionNotes?: string;
  resultingRevisionId?: string;
  resolvedAt?: string;
  evidenceItems?: CorrectionEvidenceItem[];
}

/**
 * Authenticated submission request payload.
 * userId is strictly required and verified against the authenticated session.
 */
export interface CorrectionSubmissionRequest {
  userId: string;
  targetEntityType: CorrectionTargetEntityType;
  targetEntityId: string;
  targetField: string;
  proposedValue: string;
  justification: string;
  sourceCitation: string;
  sourceUrl?: string;
}

/**
 * Append clarification evidence request payload.
 */
export interface AppendEvidenceRequest {
  correctionId: string;
  userId: string;
  evidenceText: string;
  sourceUrl?: string;
}

/**
 * Reviewer-provided structured source information required upon ACCEPT.
 * Translates reviewer evaluation into canonical SourceProvenance.
 */
export interface VerifiedSourceInput {
  sourceType: SourceType;
  sourceOrganization: string;
  sourceTitle?: string;
  sourceUrl?: string;
  publishedAt?: string;
  verificationNotes?: string;
}

export type ReviewDecision =
  | 'ACCEPT'
  | 'REJECT'
  | 'NEEDS_INFORMATION'
  | 'UNABLE_TO_VERIFY';

/**
 * Reviewer decision payload.
 * If decision is ACCEPT, verifiedSource is required.
 */
export interface ReviewDecisionPayload {
  correctionId: string;
  reviewerId: string;
  decision: ReviewDecision;
  resolutionNotes: string;
  verifiedSource?: VerifiedSourceInput;
}

/**
 * Target entity resolution result returned by ICorrectionTargetResolver.
 */
export interface TargetResolutionResult {
  targetEntityType: CorrectionTargetEntityType;
  targetEntityId: string;
  targetTitle: string;
  targetField: string;
  fieldLabel: string;
  currentValue: string | null;
  currentRevisionId: string | null;
  dataOrigin: DataOrigin;
  exists: boolean;
  fieldEligible: boolean;
}
