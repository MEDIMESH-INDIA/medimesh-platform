'use client';

import React from 'react';
import type { Facility, SourceProvenance } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  LocationIcon,
  PhoneIcon,
  ShieldIcon,
  InfoIcon,
} from '@/components/global/icons';

export interface PharmacyDetailViewProps {
  pharmacy: Facility;
  source?: SourceProvenance | null;
}

export function PharmacyDetailView({
  pharmacy,
  source,
}: PharmacyDetailViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Disclaimer */}
      <div className="rounded-[var(--radius-xl)] p-5 md:p-6 bg-[var(--color-surface-container-high)] border border-[var(--color-border-default)] flex items-start gap-4">
        <InfoIcon size={22} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-xs md:text-sm text-[var(--color-on-surface-variant)]">
          <span className="font-bold text-[var(--color-on-surface)]">
            Retail Pharmacy Directory Disclosure
          </span>
          <span>
            MEDIMESH India is an informational directory service. MEDIMESH does not sell, order, deliver,
            or dispense pharmaceuticals. Medication purchases must be transacted directly at the licensed retail
            pharmacy counter in compliance with the Drugs and Cosmetics Act and local regulatory mandates.
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge verification={pharmacy.verificationState} size="md" />
              <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-medium">
                Licensed Retail Pharmacy
              </span>
            </div>

            <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
              {pharmacy.name}
            </h1>

            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-3xl">
              {pharmacy.description}
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] flex flex-col gap-1.5 shrink-0 min-w-[200px]">
            <span className="text-[11px] uppercase font-semibold text-[var(--color-outline)] block">
              Operating Hours
            </span>
            <span className="font-headline-sm text-sm font-bold text-[var(--color-on-surface)]">
              {pharmacy.operatingHours || 'Standard Business Hours'}
            </span>
            <span className="text-[10px] text-[var(--color-outline)] mt-1">
              Timing reported by public source. Subject to holiday and local restrictions.
            </span>
          </div>
        </div>

        {/* Location & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-on-surface-variant)]">
          <div className="flex items-start gap-3">
            <LocationIcon size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm">Store Location</span>
              <span>{pharmacy.location.address}</span>
              {pharmacy.location.locality && <span>Locality: {pharmacy.location.locality}</span>}
              <span>
                {pharmacy.location.city}, {pharmacy.location.state} &mdash; {pharmacy.location.postalCode}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PhoneIcon size={18} className="text-[var(--color-outline)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm">Pharmacy Counter Contact</span>
              <span>Primary: {pharmacy.contact.primaryPhone}</span>
              <span className="text-[11px] text-[var(--color-outline)] mt-1">
                Call store to verify specific medicine or cold-chain availability before travel.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldIcon size={18} className="text-[var(--color-outline)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm">Review & Sourcing</span>
              <span>Review Desk: {source?.reviewedBy || 'MEDIMESH Public Audit Desk'}</span>
              <span>Data Origin: SYNTHETIC_DEMO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
