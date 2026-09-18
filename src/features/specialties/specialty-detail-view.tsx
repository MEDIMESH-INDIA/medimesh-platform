'use client';

import React from 'react';
import Link from 'next/link';
import type { Specialty, Facility, DoctorProfile } from '@/features/data-architecture/domain';
import { FacilityCard } from '@/features/facilities/facility-card';
import { InfoIcon } from '@/components/global/icons';

export interface SpecialtyDetailViewProps {
  specialty: Specialty;
  facilities?: Facility[];
  doctors?: DoctorProfile[];
}

export function SpecialtyDetailView({
  specialty,
  facilities = [],
  doctors = [],
}: SpecialtyDetailViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Card */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
            {specialty.clinicalDomain}
          </span>
          {specialty.isPediatric && (
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] text-xs font-semibold">
              Pediatric Care
            </span>
          )}
          {specialty.isAdult && (
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-medium">
              Adult Care
            </span>
          )}
        </div>

        <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
          {specialty.name}
        </h1>

        {specialty.description && (
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-3xl">
            {specialty.description}
          </p>
        )}

        {/* Discovery taxonomy safety disclaimer */}
        <div className="rounded-[var(--radius-md)] p-3.5 bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] flex items-start gap-2.5 text-xs text-[var(--color-on-surface-variant)] mt-2">
          <InfoIcon size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <span>
            <strong>Discovery Taxonomy Notice:</strong> This clinical specialty category is indexed for navigation
            and facility directory organization only. MEDIMESH does not provide diagnostic triage, clinical advice,
            or recommend specific medical procedures.
          </span>
        </div>
      </div>

      {/* Facilities Offering this Specialty */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
            Facilities Offering {specialty.name}
          </h2>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
            Verified and reported facilities with active clinical departments in this specialty.
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
            No synthetic facilities currently indexed under this specialty.
          </div>
        )}
      </section>

      {/* Affiliated Doctors */}
      {doctors.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
              Specialist Practitioners
            </h2>
            <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
              Public professional registration information, where available, with source, verification state, and freshness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <Link
                key={doc.id}
                href={`/doctors/${doc.slug}`}
                className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[var(--color-outline)] font-medium">Demo Profile</span>
                  <h3 className="font-headline-sm text-base font-bold text-[var(--color-on-surface)]">
                    {doc.name}
                  </h3>
                  <span className="text-xs font-medium text-[var(--color-primary)]">{doc.title}</span>
                  <span className="text-xs text-[var(--color-on-surface-variant)]">{doc.qualifications}</span>
                </div>

                <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-outline)]">
                  {doc.opdTimings || 'OPD hours by appointment'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
