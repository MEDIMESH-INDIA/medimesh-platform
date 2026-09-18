'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Facility } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import { PhoneIcon, LocationIcon, ClockIcon, ArrowForwardIcon } from '@/components/global/icons';

export interface PharmacyCardProps {
  pharmacy: Facility;
  className?: string;
}

export function PharmacyCard({ pharmacy, className }: PharmacyCardProps) {
  const is24x7 = pharmacy.operatingHours?.includes('24/7') || pharmacy.operatingHours?.includes('24 Hours');

  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <StatusBadge verification={pharmacy.verificationState} size="sm" />
          {is24x7 && (
            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] text-[10px] font-semibold">
              Source-reported 24/7
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors">
            <Link href={`/pharmacies/${pharmacy.slug}`}>{pharmacy.name}</Link>
          </h3>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)] line-clamp-2 leading-relaxed">
            {pharmacy.description}
          </p>
        </div>

        {/* Location & Contact */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-on-surface-variant)]">
          <div className="flex items-center gap-2">
            <LocationIcon size={14} className="text-[var(--color-primary)] shrink-0" />
            <span className="truncate">
              {pharmacy.location.locality ? `${pharmacy.location.locality}, ` : ''}
              {pharmacy.location.city}
            </span>
          </div>

          {pharmacy.operatingHours && (
            <div className="flex items-center gap-2">
              <ClockIcon size={14} className="text-[var(--color-tertiary)] shrink-0" />
              <span className="truncate">{pharmacy.operatingHours}</span>
            </div>
          )}

          {pharmacy.contact.primaryPhone && (
            <div className="flex items-center gap-2">
              <PhoneIcon size={14} className="text-[var(--color-outline)] shrink-0" />
              <span className="truncate">{pharmacy.contact.primaryPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
        <span className="text-[10px] text-[var(--color-outline)]">
          No online drug sales
        </span>
        <Link
          href={`/pharmacies/${pharmacy.slug}`}
          className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>Pharmacy Details</span>
          <ArrowForwardIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
