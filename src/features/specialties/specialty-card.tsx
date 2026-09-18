'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Specialty } from '@/features/data-architecture/domain';
import { ArrowForwardIcon } from '@/components/global/icons';

export interface SpecialtyCardProps {
  specialty: Specialty;
  className?: string;
  facilityCount?: number;
}

export function SpecialtyCard({
  specialty,
  className,
  facilityCount,
}: SpecialtyCardProps) {
  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] text-[11px] font-semibold tracking-wide uppercase">
            {specialty.clinicalDomain}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-outline)] font-medium">
            {specialty.isPediatric && (
              <span className="px-1.5 py-0.2 rounded bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] text-[10px] font-semibold">
                Pediatric
              </span>
            )}
            {specialty.isAdult && !specialty.isPediatric && (
              <span className="px-1.5 py-0.2 rounded bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-[10px] font-medium">
                Adult Care
              </span>
            )}
          </div>
        </div>

        <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors leading-snug">
          <Link href={`/specialties/${specialty.slug}`}>{specialty.name}</Link>
        </h3>

        {specialty.description && (
          <p className="font-body text-xs text-[var(--color-on-surface-variant)] line-clamp-3 leading-relaxed">
            {specialty.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3 text-xs">
        <span className="text-[var(--color-outline)] font-medium">
          {facilityCount !== undefined
            ? `${facilityCount} listed ${facilityCount === 1 ? 'facility' : 'facilities'}`
            : 'Structured taxonomy'}
        </span>
        <Link
          href={`/specialties/${specialty.slug}`}
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
        >
          <span>Explore</span>
          <ArrowForwardIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
