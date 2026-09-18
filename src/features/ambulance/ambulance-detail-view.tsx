'use client';

import React from 'react';
import type { Facility, SourceProvenance } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  PhoneIcon,
  LocationIcon,
  ClockIcon,
  ShieldIcon,
  WarningIcon,
} from '@/components/global/icons';

export interface AmbulanceDetailViewProps {
  ambulance: Facility;
  source?: SourceProvenance | null;
}

export function AmbulanceDetailView({
  ambulance,
  source,
}: AmbulanceDetailViewProps) {
  const isALS =
    ambulance.description.includes('Advanced Life Support') ||
    ambulance.description.includes('ALS');

  return (
    <div className="flex flex-col gap-8">
      {/* Non-Dispatch Alert */}
      <div className="rounded-[var(--radius-xl)] p-5 md:p-6 bg-[var(--color-surface-container-high)] border border-[var(--color-border-default)] flex items-start gap-4">
        <WarningIcon size={22} className="text-[var(--color-tertiary)] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-xs md:text-sm text-[var(--color-on-surface-variant)]">
          <span className="font-bold text-[var(--color-on-surface)]">
            Informational Directory Listing — Not an Automated Dispatcher
          </span>
          <span>
            MEDIMESH provides verified provider directories and contact listings only.
            MEDIMESH does not dispatch ambulances or track live vehicle GPS locations.
            For critical government emergency ambulance dispatch, dial <strong>108</strong> or <strong>112</strong> immediately.
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge verification={ambulance.verificationState} size="md" />
              <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-bold">
                {isALS ? 'Advanced Life Support (ALS)' : 'Basic Life Support (BLS)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-medium">
                {ambulance.ownershipType || 'Private'} Operator
              </span>
            </div>

            <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
              {ambulance.name}
            </h1>

            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-3xl">
              {ambulance.description}
            </p>
          </div>

          {/* Quick Dispatch Box */}
          <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex flex-col gap-3 shrink-0 min-w-[240px]">
            <span className="text-[11px] uppercase font-semibold text-[var(--color-outline)] block">
              Reported Availability
            </span>
            <span className="font-headline-sm text-sm font-bold text-[var(--color-tertiary)] flex items-center gap-1.5">
              <ClockIcon size={16} />
              <span>Source-reported 24/7 Dispatch</span>
            </span>

            {ambulance.contact.emergencyPhone ? (
              <a
                href={`tel:${ambulance.contact.emergencyPhone.replace(/[^0-9+]/g, '')}`}
                className="w-full py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--color-error,#b91c1c)] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-center"
              >
                <PhoneIcon size={14} />
                <span>Call Provider Helpline</span>
              </a>
            ) : (
              <a
                href={`tel:${ambulance.contact.primaryPhone.replace(/[^0-9+]/g, '')}`}
                className="w-full py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-center"
              >
                <PhoneIcon size={14} />
                <span>Call Dispatch Office</span>
              </a>
            )}
          </div>
        </div>

        {/* Operating Base and Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-on-surface-variant)]">
          <div className="flex items-start gap-3">
            <LocationIcon size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm">Operating Base / Headquarters</span>
              <span>{ambulance.location.address}</span>
              {ambulance.location.locality && <span>Zone: {ambulance.location.locality}</span>}
              <span>
                {ambulance.location.city}, {ambulance.location.state} — {ambulance.location.postalCode}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldIcon size={18} className="text-[var(--color-outline)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm">Review & Sourcing</span>
              <span>Review Desk: {source?.reviewedBy || 'MEDIMESH Public Audit Desk'}</span>
              <span>Data Origin: SYNTHETIC_DEMO</span>
              <span>Last Reviewed: {ambulance.updatedAt.slice(0, 10)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
