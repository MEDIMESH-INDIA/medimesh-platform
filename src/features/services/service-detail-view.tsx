'use client';

import React from 'react';
import type { ServiceCapability, Facility } from '@/features/data-architecture/domain';
import { FacilityCard } from '@/features/facilities/facility-card';
import { ClockIcon } from '@/components/global/icons';

export interface ServiceDetailViewProps {
  service: ServiceCapability;
  facilities?: Facility[];
}

export function ServiceDetailView({
  service,
  facilities = [],
}: ServiceDetailViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Card */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
            {service.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] text-xs font-semibold">
            Source-reported 24/7 Capability
          </span>
        </div>

        <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
          {service.name}
        </h1>

        {service.description && (
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-3xl">
            {service.description}
          </p>
        )}

        {/* Temporal Availability Disclosure */}
        <div className="rounded-[var(--radius-md)] p-3.5 bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] flex items-start gap-2.5 text-xs text-[var(--color-on-surface-variant)] mt-2">
          <ClockIcon size={16} className="text-[var(--color-tertiary)] shrink-0 mt-0.5" />
          <span>
            <strong>Time-Sensitive Availability Notice:</strong> Listings indicating &quot;Source-reported 24/7&quot;
            are based on verified facility disclosures and public service schedules. Equipment maintenance, staff
            turnover, and emergency surges can temporarily alter operational status. Contact the facility directly
            prior to transit for non-trauma cases.
          </span>
        </div>
      </div>

      {/* Facilities Equipped with this Service */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
            Equipped Facilities
          </h2>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
            Hospitals, diagnostic centres, and specialized units with reported {service.name} capability.
          </p>
        </div>

        {facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((fac) => (
              <FacilityCard key={fac.id} facility={fac} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-container-low)] text-xs text-[var(--color-outline)]">
            No synthetic facilities currently indexed with this capability.
          </div>
        )}
      </section>
    </div>
  );
}
