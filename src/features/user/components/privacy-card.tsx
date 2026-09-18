'use client';

/**
 * MEDIMESH INDIA 2.0 — Privacy Boundary Card
 *
 * Implements Section 27 of Phase 06 Specification:
 * - Factual, non-promotional platform privacy disclosure.
 * - Explicitly communicates that MEDIMESH accounts personalize public discovery only.
 * - Confirms zero collection of patient medical records, prescriptions, or clinical notes.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldIcon, CheckIcon, CloseIcon } from '@/components/global/icons';

export function PrivacyCard({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col gap-4 shadow-[var(--shadow-xs)]',
        className
      )}
    >
      <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border-subtle)]">
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
          <ShieldIcon size={18} />
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
            Platform Privacy &amp; Personalization Boundary
          </h3>
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            How MEDIMESH handles account personalization and public healthcare discovery.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] text-xs md:text-sm text-[var(--color-on-surface)] leading-relaxed">
        <strong>Factual Statement: </strong>
        <span>
          Your MEDIMESH account stores your discovery preferences, saved public healthcare information, saved facility comparisons, and recent searches. It does NOT store patient medical records, clinical history, prescriptions, diagnoses, or symptoms.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* What MEDIMESH Stores */}
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border-default)] flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
            <CheckIcon size={16} />
            <span>Stored for Discovery Personalization</span>
          </div>
          <ul className="text-xs text-[var(--color-on-surface-variant)] space-y-1.5 pl-1">
            <li>• Public healthcare items you choose to save</li>
            <li>• Two-facility comparisons you create</li>
            <li>• Recent search terms and location filters</li>
            <li>• Coarse location mode and city/state preference</li>
            <li>• Interface accessibility settings (motion, text size, contrast)</li>
          </ul>
        </div>

        {/* What MEDIMESH Does NOT Store */}
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border-default)] flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-error)] uppercase tracking-wider">
            <CloseIcon size={16} />
            <span>Never Stored or Inferred</span>
          </div>
          <ul className="text-xs text-[var(--color-on-surface-variant)] space-y-1.5 pl-1">
            <li>• Patient medical records, charts, or clinical files</li>
            <li>• Medical conditions, diagnoses, or clinical inferences</li>
            <li>• Doctor prescriptions or dispensed medications</li>
            <li>• Patient emergency status or clinical consultations</li>
            <li>• Precise device GPS coordinates or Aadhaar numbers</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
