'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { DoctorProfile, Facility, Specialty } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  HospitalIcon,
  ClockIcon,
  ArrowForwardIcon,
} from '@/components/global/icons';

export interface DoctorCardProps {
  doctor: DoctorProfile;
  facility?: Facility;
  specialty?: Specialty;
  className?: string;
}

export function DoctorCard({
  doctor,
  facility,
  specialty,
  className,
}: DoctorCardProps) {
  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Synthetic Demo Header */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-[10px] font-bold border border-[var(--color-border-default)]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-tertiary)] shrink-0" />
            <span>DEMO RECORD · Illustrative Medical Professional</span>
          </div>
          <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] hidden sm:inline">
            Synthetic
          </span>
        </div>

        {/* Doctor Identity */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <StatusBadge verification={doctor.verificationState} size="sm" />
            {specialty && (
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-[11px] font-semibold">
                {specialty.name}
              </span>
            )}
          </div>

          <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors leading-snug">
            <Link href={`/doctors/${doctor.slug}`}>{doctor.name}</Link>
          </h3>

          <span className="text-xs font-semibold text-[var(--color-primary)]">{doctor.title}</span>
          <span className="text-xs text-[var(--color-on-surface-variant)]">{doctor.qualifications}</span>
        </div>

        {/* Primary Facility & OPD Timings */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-on-surface-variant)]">
          {facility && (
            <div className="flex items-center gap-2">
              <HospitalIcon size={14} className="text-[var(--color-primary)] shrink-0" />
              <Link
                href={`/facilities/${facility.slug}`}
                className="hover:text-[var(--color-primary)] hover:underline truncate"
              >
                {facility.name} ({facility.location.city})
              </Link>
            </div>
          )}

          {doctor.opdTimings && (
            <div className="flex items-center gap-2">
              <ClockIcon size={14} className="text-[var(--color-tertiary)] shrink-0" />
              <span className="truncate">{doctor.opdTimings}</span>
            </div>
          )}
        </div>

        {/* Registration Language (Approved Strict Wording) */}
        <div className="rounded-[var(--radius-sm)] p-2 bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] text-[11px] text-[var(--color-on-surface-variant)] leading-snug">
          <span className="font-semibold text-[var(--color-on-surface)] block text-[10px] uppercase tracking-wider mb-0.5">
            Public Professional Registration
          </span>
          {doctor.registrationReference ? (
            <span>Reference: {doctor.registrationReference}</span>
          ) : (
            <span>Public professional registration information, where available, with source, verification state, and freshness.</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
        <span className="text-[10px] text-[var(--color-outline)]">
          No ratings or commercial endorsements
        </span>
        <Link
          href={`/doctors/${doctor.slug}`}
          className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>View Profile</span>
          <ArrowForwardIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
