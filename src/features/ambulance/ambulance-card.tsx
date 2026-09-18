'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Facility } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import { PhoneIcon, LocationIcon, ArrowForwardIcon } from '@/components/global/icons';

export interface AmbulanceCardProps {
  ambulance: Facility;
  className?: string;
}

export function AmbulanceCard({ ambulance, className }: AmbulanceCardProps) {
  const isALS = ambulance.description.includes('Advanced Life Support') || ambulance.description.includes('ALS');
  const serviceLevel = isALS ? 'Advanced Life Support (ALS)' : 'Basic Life Support (BLS)';

  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Status badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <StatusBadge verification={ambulance.verificationState} size="sm" />
            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-[11px] font-bold">
              {serviceLevel}
            </span>
          </div>
          <span className="text-[10px] uppercase font-semibold text-[var(--color-tertiary)] bg-[var(--color-surface-container-high)] px-2 py-0.5 rounded">
            Source-reported 24/7 Dispatch
          </span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors">
            <Link href={`/ambulances/${ambulance.slug}`}>{ambulance.name}</Link>
          </h3>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)] line-clamp-2 leading-relaxed">
            {ambulance.description}
          </p>
        </div>

        {/* Service Region & Contact */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-on-surface-variant)]">
          <div className="flex items-center gap-2">
            <LocationIcon size={14} className="text-[var(--color-primary)] shrink-0" />
            <span>
              Operating Zone: {ambulance.location.locality ? `${ambulance.location.locality}, ` : ''}
              {ambulance.location.city}
            </span>
          </div>

          {ambulance.contact.emergencyPhone && (
            <div className="flex items-center gap-2 font-bold text-[var(--color-error,#b91c1c)]">
              <PhoneIcon size={14} className="shrink-0" />
              <span>Direct Line: {ambulance.contact.emergencyPhone}</span>
            </div>
          )}

          {ambulance.contact.primaryPhone && !ambulance.contact.emergencyPhone && (
            <div className="flex items-center gap-2">
              <PhoneIcon size={14} className="shrink-0 text-[var(--color-outline)]" />
              <span>Contact: {ambulance.contact.primaryPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
        <span className="text-[10px] text-[var(--color-outline)]">
          Informational directory listing
        </span>
        <Link
          href={`/ambulances/${ambulance.slug}`}
          className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>Provider Profile</span>
          <ArrowForwardIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
