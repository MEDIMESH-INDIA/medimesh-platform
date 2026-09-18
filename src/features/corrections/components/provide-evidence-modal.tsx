'use client';

/**
 * MEDIMESH INDIA 2.0 — Provide Additional Evidence Modal
 *
 * Phase 07: Corrections + Trust
 *
 * Presented in /account/activity when a correction is in NEEDS_INFORMATION status.
 * Allows the authenticated owner to append clarification evidence and return
 * the correction to the UNDER_REVIEW queue.
 */

import React, { useState } from 'react';
import { Dialog, DialogFooter } from '@/design-system/primitives/dialog';
import { Button } from '@/design-system/primitives/button';
import { InfoIcon } from '@/components/global/icons';
import { useAuth } from '@/features/user';
import type { CorrectionSubmission } from '../domain/index.ts';
import { getCorrectionService } from '../services/correction-service.ts';

export interface ProvideEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  correction: CorrectionSubmission | null;
  onSuccess?: () => void;
}

export function ProvideEvidenceModal({
  isOpen,
  onClose,
  correction,
  onSuccess,
}: ProvideEvidenceModalProps) {
  const { user } = useAuth();
  const [evidenceText, setEvidenceText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!correction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user?.id) {
      setErrorMessage('You must be signed in to submit clarification evidence.');
      return;
    }

    if (evidenceText.trim().length < 5) {
      setErrorMessage('Clarification evidence must contain at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const service = getCorrectionService();
      await service.provideAdditionalEvidence({
        correctionId: correction.id,
        userId: user.id,
        evidenceText: evidenceText.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
      });

      setEvidenceText('');
      setSourceUrl('');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit additional information.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Provide Additional Information"
      description={`Clarification requested for report on ${correction.targetField}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Reviewer Inquiry Note */}
        {correction.resolutionNotes && (
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-audit-amber-bg,#fef3c7)] border border-[var(--color-audit-amber-border,#fde68a)] flex items-start gap-2.5">
            <InfoIcon size={18} className="text-[var(--color-audit-amber-text,#92400e)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-[var(--color-audit-amber-text,#92400e)]">
                Reviewer Request:
              </span>
              <p className="text-[var(--color-audit-amber-text,#92400e)] leading-relaxed">
                {correction.resolutionNotes}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-[var(--radius-md)] bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="evidence-text" className="font-label-sm text-xs font-bold text-[var(--color-on-surface)]">
            Additional Clarification Evidence <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="evidence-text"
            rows={3}
            value={evidenceText}
            onChange={(e) => setEvidenceText(e.target.value)}
            placeholder="Provide additional details, counter observations, or describe attached documents..."
            disabled={isSubmitting}
            required
            className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="evidence-url" className="font-label-sm text-xs font-medium text-[var(--color-on-surface-variant)]">
            Documentation URL <span className="text-[var(--color-outline)]">(optional)</span>
          </label>
          <input
            id="evidence-url"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.org/circular.pdf"
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2 -mx-4 -mb-4 md:-mx-6 md:-mb-6">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="font-semibold"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Clarification'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
