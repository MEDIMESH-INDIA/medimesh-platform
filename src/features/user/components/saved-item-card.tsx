'use client';

/**
 * MEDIMESH INDIA 2.0 — Saved Item Card
 *
 * Implements Section 16, 46, 47, 48, 49, 50 of Phase 06 Specification:
 * - Displays public metadata (title, category, location, verification, provenance, freshness).
 * - Tariff temporal status: highlights HISTORICAL / EXPIRED where applicable.
 * - Doctor/Hospital non-endorsement: neutral public discovery record representation.
 * - Unsave button with neutral confirmation.
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { SavedItemResolved } from '../domain/index.ts';
import type { VerificationState } from '@/types';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  BookmarkFilledIcon,
  LocationIcon,
  ClockIcon,
  ArrowForwardIcon,
  WarningIcon,
} from '@/components/global/icons';

export interface SavedItemCardProps {
  item: SavedItemResolved;
  onUnsave?: (entityType: SavedItemResolved['savedItem']['entityType'], entityId: string) => void;
  className?: string;
}

export function SavedItemCard({ item, onUnsave, className }: SavedItemCardProps) {
  const { savedItem, title, categoryLabel, locationText, verificationState, sourceOrganization, lastReviewedAt, slug, isDemo, isAvailable, tariffDetails } = item;

  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Top Header: Demo Flag & Unsave Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-[11px] font-bold">
              {categoryLabel}
            </span>
            <StatusBadge verification={verificationState as VerificationState} size="sm" />
            {isDemo && (
              <span className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-outline)] text-[10px] font-semibold uppercase tracking-wider">
                Synthetic Demo
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onUnsave?.(savedItem.entityType, savedItem.entityId)}
            aria-label={`Remove ${title} from saved items`}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-primary)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer"
            title="Remove from saved items"
          >
            <BookmarkFilledIcon size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base md:text-lg font-bold text-[var(--color-on-surface)] leading-snug">
            {slug ? (
              <Link href={slug} className="hover:text-[var(--color-primary)] transition-colors">
                {title}
              </Link>
            ) : (
              <span>{title}</span>
            )}
          </h3>

          {locationText && (
            <p className="flex items-center gap-1 text-xs text-[var(--color-on-surface-variant)]">
              <LocationIcon size={13} className="text-[var(--color-primary)] shrink-0" />
              <span>{locationText}</span>
            </p>
          )}
        </div>

        {/* Tariff Specific Temporal Banner */}
        {tariffDetails && (
          <div className={cn(
            'p-2.5 rounded-[var(--radius-md)] text-xs flex items-start gap-2 border',
            tariffDetails.isExpired
              ? 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]'
              : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border-[var(--color-border-default)]'
          )}>
            <ClockIcon size={15} className="shrink-0 mt-0.5 text-[var(--color-tertiary)]" />
            <div>
              <strong>Price Schedule: </strong>
              <span>{tariffDetails.currency} {tariffDetails.amount} ({tariffDetails.unit})</span>
              {tariffDetails.isExpired ? (
                <span className="block text-[11px] text-[var(--color-error)] font-bold mt-0.5">
                  HISTORICAL / EXPIRED · Rate schedule has ended. Does not imply current pricing.
                </span>
              ) : tariffDetails.effectiveTo ? (
                <span className="block text-[11px] text-[var(--color-outline)] mt-0.5">
                  Effective until {new Date(tariffDetails.effectiveTo).toLocaleDateString()}
                </span>
              ) : (
                <span className="block text-[11px] text-[var(--color-outline)] mt-0.5">
                  Effective period not confirmed directly by facility.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Unavailable notice */}
        {!isAvailable && (
          <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-xs flex items-center gap-2 border border-[var(--color-border-default)]">
            <WarningIcon size={15} className="text-[var(--color-tertiary)] shrink-0" />
            <span>Saved information is no longer available in the active directory.</span>
          </div>
        )}
      </div>

      {/* Footer: Provenance & Action Link */}
      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3 text-xs">
        <div className="text-[11px] text-[var(--color-outline)] truncate max-w-[200px] sm:max-w-none">
          {sourceOrganization && <span>Source: {sourceOrganization}</span>}
          {lastReviewedAt && <span className="hidden sm:inline"> · Reviewed {new Date(lastReviewedAt).toLocaleDateString()}</span>}
        </div>

        {slug && (
          <Link
            href={slug}
            className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors inline-flex items-center gap-1 shrink-0"
          >
            <span>View Details</span>
            <ArrowForwardIcon size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}
