'use client';

/**
 * MEDIMESH INDIA 2.0 — Saved Comparison Card
 *
 * Implements Section 17, 18, 19 of Phase 06 Specification:
 * - Side-by-side neutral comparison of strictly two facilities.
 * - Displays sourced operational attributes (beds, ICU, casualty intake, location).
 * - Symmetrical pair handling, individual comparison removal.
 * - Zero scores, zero winners, zero rankings, zero recommendations.
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { SavedComparisonResolved } from '../domain/index.ts';
import type { VerificationState } from '@/types';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  LocationIcon,
  CloseIcon,
  ArrowForwardIcon,
} from '@/components/global/icons';

export interface SavedComparisonCardProps {
  comparison: SavedComparisonResolved;
  onRemove?: (comparisonId: string) => void;
  className?: string;
}

export function SavedComparisonCard({ comparison, onRemove, className }: SavedComparisonCardProps) {
  const { comparison: comp, facilityA, facilityB } = comparison;

  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] flex flex-col gap-4',
        className
      )}
    >
      {/* Header with Remove Action */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-[11px] font-bold">
            2-Facility Side-by-Side Comparison
          </span>
          <span className="text-xs text-[var(--color-outline)]">
            Saved on {new Date(comp.createdAt).toLocaleDateString()}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove?.(comp.id)}
          aria-label="Remove comparison"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] p-1.5 rounded transition-colors cursor-pointer"
        >
          <CloseIcon size={15} />
          <span>Remove</span>
        </button>
      </div>

      {/* Side-by-side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-subtle)]">
        {/* Facility A */}
        <div className="flex flex-col justify-between gap-3 pt-3 md:pt-0 md:pr-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[var(--color-primary)]">Facility A</span>
              <StatusBadge verification={facilityA.verificationState as VerificationState} size="sm" />
            </div>

            <h4 className="font-heading text-base font-bold text-[var(--color-on-surface)] leading-snug">
              <Link href={facilityA.slug} className="hover:text-[var(--color-primary)] transition-colors">
                {facilityA.name}
              </Link>
            </h4>

            <p className="flex items-center gap-1 text-xs text-[var(--color-on-surface-variant)]">
              <LocationIcon size={13} className="text-[var(--color-primary)] shrink-0" />
              <span>{facilityA.city}, {facilityA.state}</span>
            </p>

            {/* Sourced Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-2 bg-[var(--color-surface-container-low)] p-2.5 rounded-[var(--radius-md)] text-xs">
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">Bed Capacity</span>
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {facilityA.bedCapacityTotal ? `${facilityA.bedCapacityTotal} Beds` : 'Not Reported'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">ICU Beds</span>
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {facilityA.icuBedCapacity ? `${facilityA.icuBedCapacity} ICU Beds` : 'Not Reported'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">Casualty Intake</span>
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {facilityA.emergencyOperational ? 'Operational' : 'Facility Sourced'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">Classification</span>
                <span className="font-semibold text-[var(--color-on-surface)] truncate block">
                  {facilityA.category}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href={facilityA.slug}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>View Facility A Profile</span>
              <ArrowForwardIcon size={13} />
            </Link>
          </div>
        </div>

        {/* Facility B */}
        <div className="flex flex-col justify-between gap-3 pt-4 md:pt-0 md:pl-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[var(--color-primary)]">Facility B</span>
              <StatusBadge verification={facilityB.verificationState as VerificationState} size="sm" />
            </div>

            <h4 className="font-heading text-base font-bold text-[var(--color-on-surface)] leading-snug">
              <Link href={facilityB.slug} className="hover:text-[var(--color-primary)] transition-colors">
                {facilityB.name}
              </Link>
            </h4>

            <p className="flex items-center gap-1 text-xs text-[var(--color-on-surface-variant)]">
              <LocationIcon size={13} className="text-[var(--color-primary)] shrink-0" />
              <span>{facilityB.city}, {facilityB.state}</span>
            </p>

            {/* Sourced Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-2 bg-[var(--color-surface-container-low)] p-2.5 rounded-[var(--radius-md)] text-xs">
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">Bed Capacity</span>
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {facilityB.bedCapacityTotal ? `${facilityB.bedCapacityTotal} Beds` : 'Not Reported'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">ICU Beds</span>
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {facilityB.icuBedCapacity ? `${facilityB.icuBedCapacity} ICU Beds` : 'Not Reported'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">Casualty Intake</span>
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {facilityB.emergencyOperational ? 'Operational' : 'Facility Sourced'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-outline)] block uppercase font-bold">Classification</span>
                <span className="font-semibold text-[var(--color-on-surface)] truncate block">
                  {facilityB.category}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href={facilityB.slug}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>View Facility B Profile</span>
              <ArrowForwardIcon size={13} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
