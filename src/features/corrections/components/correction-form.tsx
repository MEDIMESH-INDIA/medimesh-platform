'use client';

/**
 * MEDIMESH INDIA 2.0 — Public Correction Submission Form
 *
 * Phase 07: Corrections + Trust
 *
 * Authenticated-only information issue reporting form.
 * Adheres strictly to:
 * 1. Field whitelist per entity type.
 * 2. Current published value snapshot preview.
 * 3. Required justification and evidence citation.
 * 4. Explicit non-authority identity disclaimer:
 *    "Sign-in identifies you as the submitter; the information issue is reviewed separately before any published information is changed."
 */

import React, { useState, useEffect, useId } from 'react';
import { Button } from '@/design-system/primitives/button';
import { ShieldIcon, CheckCircleIcon } from '@/components/global/icons';
import { useAuth } from '@/features/user';
import type { CorrectionTargetEntityType } from '../domain/types.ts';
import { getAllowedFieldsForTarget } from '../domain/types.ts';
import { getCorrectionService } from '../services/correction-service.ts';

export interface CorrectionFormProps {
  targetEntityType: CorrectionTargetEntityType;
  targetEntityId: string;
  targetTitle: string;
  initialField?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CorrectionForm({
  targetEntityType,
  targetEntityId,
  targetTitle,
  initialField,
  onSuccess,
  onCancel,
}: CorrectionFormProps) {
  const { user } = useAuth();
  const allowedFields = getAllowedFieldsForTarget(targetEntityType);

  const [selectedField, setSelectedField] = useState(
    initialField || allowedFields[0]?.field || ''
  );
  const [currentValue, setCurrentValue] = useState<string | null>(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [proposedValue, setProposedValue] = useState('');
  const [justification, setJustification] = useState('');
  const [sourceCitation, setSourceCitation] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fieldSelectId = useId();
  const proposedValId = useId();
  const justificationId = useId();
  const citationId = useId();
  const urlId = useId();

  // Resolve current value when field selection changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedField) return;

    const service = getCorrectionService();

    service
      .resolveTarget(targetEntityType, targetEntityId, selectedField)
      .then((res) => {
        if (isMounted) {
          setCurrentValue(res.currentValue);
          setIsLoadingCurrent(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCurrentValue(null);
          setIsLoadingCurrent(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetEntityType, targetEntityId, selectedField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user?.id) {
      setErrorMessage('You must be signed in to submit an information issue report.');
      return;
    }

    if (!proposedValue.trim()) {
      setErrorMessage('Please enter the proposed corrected value.');
      return;
    }

    if (justification.trim().length < 10) {
      setErrorMessage('Please provide a justification of at least 10 characters.');
      return;
    }

    if (sourceCitation.trim().length < 5) {
      setErrorMessage('Please provide a source citation of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const service = getCorrectionService();
      await service.submitCorrection({
        userId: user.id,
        targetEntityType,
        targetEntityId,
        targetField: selectedField,
        proposedValue: proposedValue.trim(),
        justification: justification.trim(),
        sourceCitation: sourceCitation.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
      });

      setIsSubmitted(true);
      if (onSuccess) {
        setTimeout(onSuccess, 1800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your correction.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
          <CheckCircleIcon size={28} />
        </div>
        <h4 className="font-heading font-bold text-base md:text-lg text-[var(--color-on-surface)]">
          Report Submitted for Documentation Review
        </h4>
        <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] max-w-md leading-relaxed">
          Your reported update for <span className="font-semibold text-[var(--color-on-surface)]">{targetTitle}</span> has been queued. Sign-in identifies you as the submitter; our team reviews documentary provenance before published records are modified.
        </p>
        <div className="pt-3">
          <Button variant="primary" size="md" onClick={onCancel || onSuccess}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Identity & Review Disclaimer Callout */}
      <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex items-start gap-2.5">
        <ShieldIcon size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
          <strong className="text-[var(--color-on-surface)]">Account Verification Boundary:</strong> Sign-in identifies you as the submitter; the information issue is reviewed separately against documented sources before any published information is changed.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-[var(--radius-md)] bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Target Entity Banner */}
      <div className="text-xs font-body text-[var(--color-on-surface-variant)]">
        Reporting issue for:{' '}
        <span className="font-semibold text-[var(--color-on-surface)]">{targetTitle}</span>
      </div>

      {/* Field Selector */}
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldSelectId} className="font-label-sm text-xs font-bold text-[var(--color-on-surface)]">
          Reported Information Field <span className="text-rose-500">*</span>
        </label>
        <select
          id={fieldSelectId}
          value={selectedField}
          onChange={(e) => {
            setSelectedField(e.target.value);
            setIsLoadingCurrent(true);
          }}
          disabled={isSubmitting}
          className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          {allowedFields.map((f) => (
            <option key={f.field} value={f.field}>
              {f.label} ({f.description})
            </option>
          ))}
        </select>
      </div>

      {/* Current Published Value (Read-Only Preview) */}
      <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-container)] border border-[var(--color-border-default)] flex flex-col gap-1">
        <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-[var(--color-on-surface-variant)]">
          Current Published Value
        </span>
        <span className="font-body text-xs md:text-sm text-[var(--color-on-surface)] font-medium break-all">
          {isLoadingCurrent ? (
            <span className="text-[var(--color-outline)] animate-pulse">Loading current record...</span>
          ) : currentValue !== null && currentValue !== '' ? (
            currentValue
          ) : (
            <span className="italic text-[var(--color-outline)]">Not currently published or blank</span>
          )}
        </span>
      </div>

      {/* Proposed Value */}
      <div className="flex flex-col gap-1">
        <label htmlFor={proposedValId} className="font-label-sm text-xs font-bold text-[var(--color-on-surface)]">
          Proposed Factual Value <span className="text-rose-500">*</span>
        </label>
        <input
          id={proposedValId}
          type="text"
          value={proposedValue}
          onChange={(e) => setProposedValue(e.target.value)}
          placeholder="e.g. +91 20 6645 5150 or 24x7 Emergency"
          disabled={isSubmitting}
          required
          className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Justification */}
      <div className="flex flex-col gap-1">
        <label htmlFor={justificationId} className="font-label-sm text-xs font-bold text-[var(--color-on-surface)]">
          Justification / Observation Context <span className="text-rose-500">*</span>
        </label>
        <textarea
          id={justificationId}
          rows={3}
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Explain why this change is accurate and where you observed this discrepancy (min. 10 characters)..."
          disabled={isSubmitting}
          required
          className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
        />
      </div>

      {/* Source Citation */}
      <div className="flex flex-col gap-1">
        <label htmlFor={citationId} className="font-label-sm text-xs font-bold text-[var(--color-on-surface)]">
          Documentary Source / Citation <span className="text-rose-500">*</span>
        </label>
        <input
          id={citationId}
          type="text"
          value={sourceCitation}
          onChange={(e) => setSourceCitation(e.target.value)}
          placeholder="e.g. Facility Reception Noticeboard, Tariff Card Sep 2026, Official Hospital Website"
          disabled={isSubmitting}
          required
          className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Optional Source URL */}
      <div className="flex flex-col gap-1">
        <label htmlFor={urlId} className="font-label-sm text-xs font-medium text-[var(--color-on-surface-variant)]">
          Source Documentation URL <span className="text-[var(--color-outline)]">(optional)</span>
        </label>
        <input
          id={urlId}
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.org/circulars/timings"
          disabled={isSubmitting}
          className="w-full px-3 py-2 text-xs md:text-sm rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-default)]">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="font-semibold"
        >
          {isSubmitting ? 'Submitting Report...' : 'Submit Information Issue'}
        </Button>
      </div>
    </form>
  );
}
