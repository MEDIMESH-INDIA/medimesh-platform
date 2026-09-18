'use client';

/**
 * MEDIMESH INDIA 2.0 — Recent Searches List
 *
 * Implements Section 20 & 21 of Phase 06 Specification:
 * - Displays discovery searches in newest-first order.
 * - Sourced discovery context: query, selected location, interpreted search intent.
 * - Non-diagnostic: never converts queries into medical diagnoses or patient conditions.
 * - Supports individual removal and clearing full history.
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RecentSearch } from '../domain/index.ts';
import {
  SearchIcon,
  LocationIcon,
  CloseIcon,
  ArrowForwardIcon,
  DeleteIcon,
} from '@/components/global/icons';


export interface RecentSearchesListProps {
  searches: RecentSearch[];
  onRemove?: (searchId: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function RecentSearchesList({
  searches,
  onRemove,
  onClearAll,
  className,
}: RecentSearchesListProps) {
  if (searches.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
        <SearchIcon size={32} className="mx-auto text-[var(--color-outline)] mb-2" />
        <h3 className="font-heading text-base font-bold text-[var(--color-on-surface)]">
          No recent searches
        </h3>
        <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 max-w-sm mx-auto">
          Discovery searches you make while signed in will appear here for quick access.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* List Header with Clear All Action */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
          Recent Discovery Queries ({searches.length})
        </span>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-[var(--color-error)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <DeleteIcon size={14} />
            <span>Clear Search History</span>
          </button>
        )}
      </div>

      {/* Search Items */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] divide-y divide-[var(--color-border-subtle)] overflow-hidden shadow-[var(--shadow-xs)]">
        {searches.map((s) => {
          const searchParams = new URLSearchParams();
          if (s.query) searchParams.set('q', s.query);
          if (s.selectedLocation) searchParams.set('location', s.selectedLocation);
          const searchUrl = `/search?${searchParams.toString()}`;

          return (
            <div
              key={s.id}
              className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-container-low)]/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <SearchIcon size={16} />
                </div>

                <div className="flex flex-col min-w-0">
                  <Link
                    href={searchUrl}
                    className="font-heading text-sm font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors truncate"
                  >
                    &ldquo;{s.query}&rdquo;
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] flex-wrap mt-0.5">
                    {s.selectedLocation && (
                      <span className="inline-flex items-center gap-1">
                        <LocationIcon size={12} className="text-[var(--color-primary)]" />
                        <span>{s.selectedLocation}</span>
                      </span>
                    )}

                    {s.interpretedIntent && (
                      <>
                        <span className="text-[var(--color-outline-variant)]">·</span>
                        <span className="text-[var(--color-outline)]">{s.interpretedIntent}</span>
                      </>
                    )}

                    <span className="text-[var(--color-outline-variant)]">·</span>
                    <span className="text-[11px] text-[var(--color-outline)]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={searchUrl}
                  className="px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container)] transition-colors inline-flex items-center gap-1 text-[var(--color-on-surface)]"
                  title="Search again"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowForwardIcon size={12} />
                </Link>

                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    aria-label={`Remove search "${s.query}"`}
                    className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    <CloseIcon size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
