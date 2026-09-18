'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { SchemeInsurance } from '@/features/data-architecture/domain';
import { ArrowForwardIcon } from '@/components/global/icons';

export interface SchemeCardProps {
  scheme: SchemeInsurance;
  facilityCount?: number;
  className?: string;
}

export function SchemeCard({
  scheme,
  facilityCount,
  className,
}: SchemeCardProps) {
  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-[11px] font-bold">
            {scheme.code}
          </span>
          <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] text-[11px] font-medium">
            {scheme.stateScope === 'ALL_INDIA' ? 'National Scope' : scheme.stateScope || 'Public Scheme'}
          </span>
        </div>

        <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors leading-snug">
          <Link href={`/schemes/${scheme.slug}`}>{scheme.name}</Link>
        </h3>

        {scheme.description && (
          <p className="font-body text-xs text-[var(--color-on-surface-variant)] line-clamp-3 leading-relaxed">
            {scheme.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3 text-xs">
        <span className="text-[var(--color-outline)] font-medium">
          {facilityCount !== undefined
            ? `${facilityCount} empaneled ${facilityCount === 1 ? 'facility' : 'facilities'}`
            : 'Public Health Program'}
        </span>
        <Link
          href={`/schemes/${scheme.slug}`}
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
        >
          <span>View empanelments</span>
          <ArrowForwardIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
