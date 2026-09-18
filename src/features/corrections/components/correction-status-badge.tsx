'use client';

/**
 * MEDIMESH INDIA 2.0 — Correction Status Badge
 *
 * Phase 07: Corrections + Trust
 *
 * Visual indicator communicating the lifecycle status of a correction:
 * SUBMITTED, UNDER_REVIEW, NEEDS_INFORMATION, ACCEPTED, REJECTED, UNABLE_TO_VERIFY.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { CorrectionStatus } from '../domain/index.ts';

export interface CorrectionStatusBadgeProps {
  status: CorrectionStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  CorrectionStatus,
  { label: string; dotClass: string; containerClass: string }
> = {
  SUBMITTED: {
    label: 'Submitted',
    dotClass: 'bg-[var(--color-primary)]',
    containerClass:
      'bg-[var(--color-surface-container)] text-[var(--color-primary)] border-[var(--color-border-default)]',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    dotClass: 'bg-blue-600',
    containerClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  NEEDS_INFORMATION: {
    label: 'Needs Information',
    dotClass: 'bg-amber-600 animate-pulse',
    containerClass:
      'bg-[var(--color-audit-amber-bg,#fef3c7)] text-[var(--color-audit-amber-text,#92400e)] border-[var(--color-audit-amber-border,#fde68a)]',
  },
  ACCEPTED: {
    label: 'Verified & Published',
    dotClass: 'bg-teal-600',
    containerClass: 'bg-teal-50 text-teal-900 border-teal-200',
  },
  REJECTED: {
    label: 'Not Accepted',
    dotClass: 'bg-slate-400',
    containerClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  UNABLE_TO_VERIFY: {
    label: 'Unable to Verify',
    dotClass: 'bg-amber-500',
    containerClass: 'bg-amber-50/80 text-amber-800 border-amber-200',
  },
};

export function CorrectionStatusBadge({
  status,
  className,
  size = 'md',
}: CorrectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.SUBMITTED;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-label-md font-semibold border select-none transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.containerClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)} />
      <span>{config.label}</span>
    </span>
  );
}
