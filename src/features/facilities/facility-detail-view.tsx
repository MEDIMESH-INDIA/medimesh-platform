'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type {
  Facility,
  HospitalProfile,
  Specialty,
  ServiceCapability,
  DoctorProfile,
  TariffItem,
  SourceProvenance,
} from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  LocationIcon,
  PhoneIcon,
  ClockIcon,
  ShieldIcon,
} from '@/components/global/icons';

export interface FacilityDetailViewProps {
  facility: Facility;
  profile?: HospitalProfile | null;
  specialties?: Specialty[];
  services?: ServiceCapability[];
  doctors?: DoctorProfile[];
  tariffs?: TariffItem[];
  source?: SourceProvenance | null;
}

export function FacilityDetailView({
  facility,
  profile,
  specialties = [],
  services = [],
  doctors = [],
  tariffs = [],
  source,
}: FacilityDetailViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Prominent Demo Notice Banner */}
      <div className="rounded-[var(--radius-lg)] p-4 md:p-5 bg-[var(--color-surface-container-high)] border border-[var(--color-border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[var(--color-tertiary)] shrink-0 mt-1 sm:mt-0 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-bold text-[var(--color-on-surface)]">
              DEMO DATA RECORD — SYNTHETIC HEALTHCARE FACILITY
            </span>
            <span className="font-body text-xs text-[var(--color-on-surface-variant)]">
              This profile is populated strictly for system architecture demonstration and interface modeling.
              It is not a live or certified operational record.
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-[11px] font-semibold tracking-wider uppercase shrink-0">
          Synthetic Demo
        </span>
      </div>

      {/* Header Summary Card */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge verification={facility.verificationState} size="md" />
              <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] text-xs font-medium">
                {facility.category}
              </span>
              {facility.ownershipType && (
                <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-medium">
                  {facility.ownershipType} Sector
                </span>
              )}
              {profile?.hospitalType && (
                <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
                  {profile.hospitalType}
                </span>
              )}
            </div>

            <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
              {facility.name}
            </h1>

            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-3xl">
              {facility.description}
            </p>
          </div>

          {/* Quick Metrics (if hospital) */}
          {profile && (
            <div className="flex md:flex-col gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] shrink-0 min-w-[200px]">
              <div>
                <span className="text-[11px] uppercase font-semibold text-[var(--color-outline)] block">
                  Total Bed Capacity
                </span>
                <span className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
                  {profile.bedCapacityTotal} Beds
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-[var(--color-outline)] block">
                  ICU Beds
                </span>
                <span className="font-headline-sm text-lg font-bold text-[var(--color-primary)]">
                  {profile.icuBedCapacity} Beds
                </span>
              </div>
              {profile.traumaCapability && (
                <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-error,#b91c1c)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-error,#b91c1c)]" />
                    Trauma Centre Equipped
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-start gap-3">
            <LocationIcon size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs text-[var(--color-on-surface-variant)]">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm mb-0.5">Address</span>
              <span>{facility.location.address}</span>
              {facility.location.locality && <span>Locality: {facility.location.locality}</span>}
              <span>
                {facility.location.city}, {facility.location.state} — {facility.location.postalCode}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ClockIcon size={18} className="text-[var(--color-tertiary)] shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs text-[var(--color-on-surface-variant)]">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm mb-0.5">Operating Hours</span>
              <span>{facility.operatingHours || 'Schedule not disclosed'}</span>
              <span className="text-[10px] text-[var(--color-outline)] mt-1">
                Source-reported timing. Emergency availability subject to intake review.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PhoneIcon size={18} className="text-[var(--color-outline)] shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs text-[var(--color-on-surface-variant)]">
              <span className="font-semibold text-[var(--color-on-surface)] text-sm mb-0.5">Contact</span>
              <span>Primary: {facility.contact.primaryPhone}</span>
              {facility.contact.emergencyPhone && (
                <span className="text-[var(--color-error,#b91c1c)] font-medium">
                  Emergency: {facility.contact.emergencyPhone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specialties & Clinical Disciplines */}
      {specialties.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
                Specialties & Clinical Departments
              </h2>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
                Structured clinical domains reported or verified at this facility.
              </p>
            </div>
            <Link
              href="/specialties"
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              All specialties &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {specialties.map((spec) => (
              <Link
                key={spec.id}
                href={`/specialties/${spec.slug}`}
                className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-sm font-bold text-[var(--color-on-surface)]">
                    {spec.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)]">
                    {spec.clinicalDomain}
                  </span>
                </div>
                {spec.description && (
                  <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2">
                    {spec.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Services & Sourced Capabilities */}
      {services.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
              Services & Capabilities
            </h2>
            <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
              Operational capabilities disclosed for this facility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline-sm text-sm font-bold text-[var(--color-on-surface)]">
                    {svc.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-high)] text-[10px] font-medium text-[var(--color-on-surface-variant)]">
                    {svc.category}
                  </span>
                </div>
                {svc.description && (
                  <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2">
                    {svc.description}
                  </p>
                )}
                <div className="text-[11px] font-medium text-[var(--color-tertiary)] pt-1 border-t border-[var(--color-border-subtle)]">
                  Source-reported 24/7 Availability
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Affiliated Doctors */}
      {doctors.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
                Affiliated Healthcare Professionals
              </h2>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
                Public professional registration information, where available, with source, verification state, and freshness.
              </p>
            </div>
            <Link
              href="/doctors"
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              All doctors &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <Link
                key={doc.id}
                href={`/doctors/${doc.slug}`}
                className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)] transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge verification={doc.verificationState} size="sm" />
                    <span className="text-[10px] text-[var(--color-outline)] font-medium">Demo Profile</span>
                  </div>
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

      {/* Informational Tariffs */}
      {tariffs.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
              Informational Tariffs
            </h2>
            <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
              Non-promotional price disclosures from public schedule or facility submissions. Never a binding quotation.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-border-default)] font-semibold text-[var(--color-on-surface)]">
                  <th className="p-3">Service Code / Item</th>
                  <th className="p-3">Reported Amount</th>
                  <th className="p-3">Unit / Scope</th>
                  <th className="p-3">Effective Period</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {tariffs.map((t) => {
                  const isExpired = t.isArchived || (t.effectiveTo && new Date(t.effectiveTo) < new Date());
                  const isUnconfirmed = !t.effectiveFrom && !t.effectiveTo;
                  return (
                    <tr key={t.id} className={cn(isExpired && 'opacity-60 bg-[var(--color-surface-container-low)]')}>
                      <td className="p-3 font-medium text-[var(--color-on-surface)]">
                        {t.notes || t.id}
                      </td>
                      <td className="p-3 font-bold text-[var(--color-on-surface)]">
                        {t.currency} {t.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-[var(--color-on-surface-variant)]">{t.unit}</td>
                      <td className="p-3 text-[var(--color-on-surface-variant)]">
                        {isUnconfirmed ? (
                          <span className="text-[var(--color-tertiary)] font-medium">
                            Effective period not confirmed
                          </span>
                        ) : (
                          `${t.effectiveFrom?.slice(0, 10) || 'Unknown'} — ${t.effectiveTo?.slice(0, 10) || 'Current'}`
                        )}
                      </td>
                      <td className="p-3">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-outline)] font-semibold text-[10px]">
                            Historical / Expired Tariff
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-semibold text-[10px]">
                            Published Rate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Source Provenance & Verification Audit Card */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldIcon size={18} className="text-[var(--color-primary)]" />
            <h3 className="font-headline-sm text-base font-bold text-[var(--color-on-surface)]">
              Data Provenance & Review Citation
            </h3>
          </div>
          <span className="text-xs text-[var(--color-outline)]">
            MEDIMESH India Reference Model
          </span>
        </div>

        <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
          MEDIMESH verification represents provenance, public source documentation, and editorial review only.
          It must never be interpreted as an official accreditation, quality ranking, or clinical warranty.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-3 border-t border-[var(--color-border-subtle)]">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">Source Org</span>
            <span className="font-medium text-[var(--color-on-surface)]">
              {source?.sourceOrganization || 'MEDIMESH Synthetic Data Generator'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">Verification State</span>
            <span className="font-medium text-[var(--color-primary)]">
              {facility.verificationState}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">Last Reviewed</span>
            <span className="font-medium text-[var(--color-on-surface)]">
              {source?.lastReviewedAt?.slice(0, 10) || facility.updatedAt.slice(0, 10)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">Review Desk</span>
            <span className="font-medium text-[var(--color-on-surface)]">
              {source?.reviewedBy || 'MEDIMESH Public Audit Desk'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
