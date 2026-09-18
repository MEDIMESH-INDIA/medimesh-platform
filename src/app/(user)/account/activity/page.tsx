'use client';

/**
 * MEDIMESH INDIA 2.0 — Account Correction Activity Page
 *
 * Route: /account/activity
 *
 * Phase 07: Corrections + Trust
 *
 * Displays the authenticated user's submitted information issues.
 * Enforces:
 * 1. Strict server-side/service-side user isolation (only current user's corrections).
 * 2. Real NEEDS_INFORMATION workflow allowing owners to append clarification evidence.
 * 3. Transparent lifecycle status and reviewer notes.
 * 4. Zero medical or clinical information.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/user/auth';
import {
  getCorrectionService,
  CorrectionStatusBadge,
  ProvideEvidenceModal,
  type CorrectionSubmission,
  type CorrectionTargetEntityType,
  getFieldLabel,
} from '@/features/corrections';
import {
  ShieldIcon,
  InfoIcon,
  RefreshIcon,
  ClockIcon,
  FlagIcon,
} from '@/components/global/icons';
import { Button } from '@/design-system/primitives/button';
import { EmptyState } from '@/components/system';
import { useToast } from '@/design-system/primitives/toast';
import { formatRelativeTime } from '@/lib/utils';

export default function AccountActivityPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [corrections, setCorrections] = useState<CorrectionSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(!user?.id ? false : true);
  const [selectedForEvidence, setSelectedForEvidence] = useState<CorrectionSubmission | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) return;

    const service = getCorrectionService();
    service
      .listUserCorrections(user.id)
      .then((list) => {
        if (isMounted) {
          setCorrections(list);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
          showToast('Failed to load correction activity', 'info');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshToken, showToast]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <EmptyState
          icon={<ShieldIcon size={32} className="text-[var(--color-outline)]" />}
          title="Sign in to view correction activity"
          description="Your MEDIMESH account tracks reported factual updates and allows providing clarification evidence."
          action={
            <Link href="/">
              <Button variant="primary" size="md">
                Return to Discovery
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleOpenEvidence = (correction: CorrectionSubmission) => {
    setSelectedForEvidence(correction);
    setIsEvidenceModalOpen(true);
  };

  const handleEvidenceSuccess = () => {
    showToast('Clarification submitted successfully', 'info');
    setRefreshToken((c) => c + 1);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShieldIcon size={22} className="text-[var(--color-primary)] shrink-0" />
            <h1 className="font-heading font-bold text-xl md:text-2xl text-[var(--color-on-surface)]">
              Information Issues &amp; Correction Activity
            </h1>
          </div>
          <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Track reported directory updates, reviewer inquiries, and documentary verification decisions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshToken((c) => c + 1)}
          disabled={isLoading}
          className="self-start sm:self-auto shrink-0"
        >
          <RefreshIcon size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Activity</span>
        </Button>
      </div>

      {/* Identity & Verification Boundary Disclaimer */}
      <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex items-start gap-3">
        <InfoIcon size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-xs font-body text-[var(--color-on-surface-variant)] leading-relaxed">
          <span className="font-semibold text-[var(--color-on-surface)]">
            Provenance Verification Standard:
          </span>
          <span>
            Sign-in identifies you as the submitter; reported information issues are evaluated separately against documentary records before any published entry is modified.
          </span>
        </div>
      </div>

      {/* Corrections List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] animate-pulse flex flex-col gap-3"
            >
              <div className="h-4 bg-[var(--color-surface-container-high)] rounded w-1/4" />
              <div className="h-3 bg-[var(--color-surface-container-high)] rounded w-1/2" />
              <div className="h-3 bg-[var(--color-surface-container-high)] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : corrections.length === 0 ? (
        <EmptyState
          icon={<FlagIcon size={32} className="text-[var(--color-outline)]" />}
          title="No reported information issues"
          description="When you notice a factual discrepancy in facility operating hours, contact numbers, or published tariffs, report it from the respective directory page."
          action={
            <Link href="/facilities">
              <Button variant="outline" size="md">
                Explore Healthcare Directory
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {corrections.map((item) => {
            const fieldLabel = getFieldLabel(item.targetEntityType as CorrectionTargetEntityType, item.targetField);

            return (
              <div
                key={item.id}
                className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-5 md:p-6 shadow-[var(--shadow-xs)] flex flex-col gap-4 transition-all"
              >
                {/* Header Row: Target Type, Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] text-[11px] font-semibold uppercase tracking-wider">
                      {item.targetEntityType}
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-on-surface)]">
                      Target ID: <code className="font-mono text-[11px] text-[var(--color-primary)]">{item.targetEntityId}</code>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-outline)] font-body">
                      <ClockIcon size={12} />
                      <span>{formatRelativeTime(item.submittedAt)}</span>
                    </div>
                    <CorrectionStatusBadge status={item.status} size="sm" />
                  </div>
                </div>

                {/* Main Body: Reported Field & Proposed vs Current */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body">
                  <div className="flex flex-col gap-1 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)]">
                    <span className="font-label-sm text-[11px] uppercase font-bold text-[var(--color-outline)]">
                      Reported Information Field
                    </span>
                    <span className="font-semibold text-[var(--color-on-surface)] text-sm">
                      {fieldLabel}
                    </span>
                    <span className="text-[11px] text-[var(--color-on-surface-variant)] font-mono">
                      {item.targetField}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)]">
                    <span className="font-label-sm text-[11px] uppercase font-bold text-[var(--color-primary)]">
                      Proposed Factual Value
                    </span>
                    <span className="font-semibold text-[var(--color-on-surface)] text-sm break-all">
                      {item.proposedValue}
                    </span>
                    {item.currentValue && (
                      <span className="text-[11px] text-[var(--color-outline)]">
                        Current at report: {item.currentValue}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submitter Justification & Citation */}
                <div className="flex flex-col gap-1 text-xs text-[var(--color-on-surface-variant)] font-body bg-[var(--color-surface-container-low)]/50 p-3 rounded-[var(--radius-md)]">
                  <div>
                    <strong className="text-[var(--color-on-surface)]">Justification: </strong>
                    {item.justification}
                  </div>
                  <div className="mt-1 text-[11px]">
                    <strong className="text-[var(--color-on-surface)]">Source Citation: </strong>
                    {item.sourceCitation}
                  </div>
                </div>

                {/* Clarification Evidence Items (if any appended) */}
                {item.evidenceItems && item.evidenceItems.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
                    <span className="font-label-sm text-[11px] font-bold text-[var(--color-on-surface)] uppercase">
                      Clarification Evidence History ({item.evidenceItems.length})
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {item.evidenceItems.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-on-surface-variant)] flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[var(--color-outline)]">
                            <span>Appended clarification</span>
                            <span>{formatRelativeTime(ev.submittedAt)}</span>
                          </div>
                          <p className="font-body text-[var(--color-on-surface)]">{ev.evidenceText}</p>
                          {ev.sourceUrl && (
                            <a
                              href={ev.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[var(--color-primary)] hover:underline truncate"
                            >
                              {ev.sourceUrl}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviewer Inquiry Action (NEEDS_INFORMATION state) */}
                {item.status === 'NEEDS_INFORMATION' && (
                  <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-audit-amber-bg,#fef3c7)] border border-[var(--color-audit-amber-border,#fde68a)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <InfoIcon size={18} className="text-[var(--color-audit-amber-text,#92400e)] shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold text-[var(--color-audit-amber-text,#92400e)]">
                          Reviewer Request for Information:
                        </span>
                        <p className="text-[var(--color-audit-amber-text,#92400e)] leading-relaxed">
                          {item.resolutionNotes || 'Please provide additional documentation or photographs confirming this change.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenEvidence(item)}
                      className="shrink-0 font-semibold self-start sm:self-auto bg-amber-700 hover:bg-amber-800 text-white border-amber-800"
                    >
                      Provide Additional Information
                    </Button>
                  </div>
                )}

                {/* Final Decision Notes (if resolved) */}
                {item.resolutionNotes && item.status !== 'NEEDS_INFORMATION' && (
                  <div className="text-xs font-body p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] flex items-start gap-2">
                    <InfoIcon size={15} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[var(--color-on-surface)]">Review Decision Notes:</span>
                      <span className="text-[var(--color-on-surface-variant)]">{item.resolutionNotes}</span>
                      {item.resultingRevisionId && (
                        <span className="text-[10px] text-[var(--color-outline)] font-mono">
                          Published Revision ID: {item.resultingRevisionId}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Provide Additional Evidence Modal */}
      <ProvideEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        correction={selectedForEvidence}
        onSuccess={handleEvidenceSuccess}
      />
    </div>
  );
}
