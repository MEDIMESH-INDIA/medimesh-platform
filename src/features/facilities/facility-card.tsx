'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Facility } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  LocationIcon,
  PhoneIcon,
  ClockIcon,
  ArrowForwardIcon,
} from '@/components/global/icons';

export interface FacilityCardProps {
  facility: Facility;
  className?: string;
}

export function FacilityCard({ facility, className }: FacilityCardProps) {
  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Synthetic Demo Flag */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-[10px] font-bold border border-[var(--color-border-default)]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-tertiary)] shrink-0" />
            <span>DEMO RECORD · Illustrative Healthcare Facility</span>
          </div>
          <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] hidden sm:inline">
            Synthetic
          </span>
        </div>

        {/* Title and Badges */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge verification={facility.verificationState} size="sm" />
            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] text-[11px] font-medium">
              {facility.category}
            </span>
            {facility.ownershipType && (
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-[11px] font-medium">
                {facility.ownershipType}
              </span>
            )}
          </div>

          <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors leading-snug">
            <Link href={`/facilities/${facility.slug}`}>{facility.name}</Link>
          </h3>

          <p className="font-body text-xs text-[var(--color-on-surface-variant)] line-clamp-2 mt-0.5 leading-relaxed">
            {facility.description}
          </p>
        </div>

        {/* Location & Hours */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-on-surface-variant)]">
          <div className="flex items-center gap-2">
            <LocationIcon size={14} className="text-[var(--color-primary)] shrink-0" />
            <span className="truncate">
              {facility.location.locality ? `${facility.location.locality}, ` : ''}
              {facility.location.city}, {facility.location.state}
            </span>
          </div>

          {facility.operatingHours && (
            <div className="flex items-center gap-2">
              <ClockIcon size={14} className="text-[var(--color-tertiary)] shrink-0" />
              <span className="truncate">{facility.operatingHours}</span>
            </div>
          )}

          {facility.contact.primaryPhone && (
            <div className="flex items-center gap-2">
              <PhoneIcon size={14} className="text-[var(--color-outline)] shrink-0" />
              <span className="truncate">{facility.contact.primaryPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
        <span className="text-[11px] text-[var(--color-outline)] font-medium">
          Source: Verified Public Record
        </span>
        <Link
          href={`/facilities/${facility.slug}`}
          className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>View Facility</span>
          <ArrowForwardIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
