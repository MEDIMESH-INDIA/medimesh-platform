'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Facility, HospitalProfile, AvailabilityRecord } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  EmergencyIcon,
  PhoneIcon,
  LocationIcon,
  ArrowForwardIcon,
} from '@/components/global/icons';

export interface EmergencyFacilityItem {
  facility: Facility;
  profile?: HospitalProfile | null;
  availability?: AvailabilityRecord | null;
}

export interface EmergencyDirectoryViewProps {
  facilities: EmergencyFacilityItem[];
  className?: string;
}

export function EmergencyDirectoryView({
  facilities,
  className,
}: EmergencyDirectoryViewProps) {
  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Critical Emergency Banner (Call 112 / 108) */}
      <div className="rounded-[var(--radius-xl)] p-6 md:p-8 bg-[var(--color-error-container,#fee2e2)] border-2 border-[var(--color-error,#b91c1c)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[var(--shadow-md)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-error,#b91c1c)] text-white flex items-center justify-center shrink-0">
            <EmergencyIcon size={26} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-headline-sm text-xl font-bold text-[var(--color-on-error-container,#7f1d1d)]">
              Immediate Medical Emergency? Call 112 or 108
            </span>
            <p className="font-body text-xs md:text-sm text-[var(--color-on-error-container,#7f1d1d)] max-w-2xl leading-relaxed">
              If a patient has severe chest pain, breathing distress, uncontrolled bleeding, acute stroke symptoms, or severe trauma,
              call National Emergency Helpline <strong>112</strong> or Ambulance <strong>108</strong> immediately.
              MEDIMESH is an informational reference directory only and does not dispatch emergency services or guarantee intake availability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:112"
            className="px-5 py-3 rounded-[var(--radius-lg)] bg-[var(--color-error,#b91c1c)] text-white font-headline-sm font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
          >
            <PhoneIcon size={16} />
            <span>Call 112</span>
          </a>
          <a
            href="tel:108"
            className="px-5 py-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-error,#b91c1c)] border-2 border-[var(--color-error,#b91c1c)] font-headline-sm font-bold text-sm hover:bg-white/80 transition-colors flex items-center gap-2"
          >
            <PhoneIcon size={16} />
            <span>Call 108</span>
          </a>
        </div>
      </div>

      {/* Directory Section */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
            Emergency & Critical Care Facilities
          </h2>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
            Verified casualty intake units, trauma centers, and tertiary hospitals equipped with intensive care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map(({ facility, profile, availability }) => {
            const isTrauma = profile?.traumaCapability;
            const isIntakeOperational = profile?.emergencyIntakeOperational;

            return (
              <article
                key={facility.id}
                className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <StatusBadge verification={facility.verificationState} size="sm" />
                      {isTrauma && (
                        <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-error-container,#fee2e2)] text-[var(--color-error,#b91c1c)] text-[11px] font-bold">
                          Trauma Center
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--color-tertiary)] bg-[var(--color-surface-container-high)] px-2 py-0.5 rounded">
                      Source-reported 24/7 Casualty
                    </span>
                  </div>

                  {/* Facility Name & Location */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors">
                      <Link href={`/facilities/${facility.slug}`}>{facility.name}</Link>
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-on-surface-variant)]">
                      <LocationIcon size={14} className="text-[var(--color-primary)] shrink-0" />
                      <span>
                        {facility.location.locality ? `${facility.location.locality}, ` : ''}
                        {facility.location.city}, {facility.location.state}
                      </span>
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">
                        Casualty Intake
                      </span>
                      <span className={cn('font-bold', isIntakeOperational ? 'text-[var(--color-primary)]' : 'text-[var(--color-tertiary)]')}>
                        {isIntakeOperational ? 'Active Intake' : 'Limited Intake'}
                      </span>
                    </div>

                    {profile && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">
                          ICU Capacity
                        </span>
                        <span className="font-bold text-[var(--color-on-surface)]">
                          {profile.icuBedCapacity} ICU Beds
                        </span>
                      </div>
                    )}

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">
                        Freshness
                      </span>
                      <span className="font-medium text-[var(--color-outline)]">
                        {availability?.observedAt
                          ? `Reported ${availability.observedAt.slice(0, 10)}`
                          : 'Public Schedule'}
                      </span>
                    </div>
                  </div>

                  {/* Direct Contact Phone */}
                  <div className="flex flex-col gap-1 text-xs">
                    {facility.contact.emergencyPhone && (
                      <div className="flex items-center gap-2 text-[var(--color-error,#b91c1c)] font-bold">
                        <PhoneIcon size={14} className="shrink-0" />
                        <span>Emergency Line: {facility.contact.emergencyPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)]">
                      <PhoneIcon size={14} className="shrink-0 text-[var(--color-outline)]" />
                      <span>Board: {facility.contact.primaryPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-[10px] text-[var(--color-outline)]">
                    Illustrative demo record
                  </span>
                  <Link
                    href={`/facilities/${facility.slug}`}
                    className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Full Facility Profile</span>
                    <ArrowForwardIcon size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
