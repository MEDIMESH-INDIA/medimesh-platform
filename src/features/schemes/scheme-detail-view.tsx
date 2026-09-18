'use client';

import React from 'react';
import Link from 'next/link';
import type { SchemeInsurance, Facility, FacilitySchemeRelation } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import { ShieldIcon, WarningIcon, ArrowForwardIcon } from '@/components/global/icons';

export interface SchemeDetailViewProps {
  scheme: SchemeInsurance;
  facilityRelations: Array<{
    relation: FacilitySchemeRelation;
    facility: Facility;
  }>;
}

export function SchemeDetailView({
  scheme,
  facilityRelations = [],
}: SchemeDetailViewProps) {
  // Tri-part separation:
  // 1. Scheme Info (Header)
  // 2. Source-Reviewed Participation
  const sourceReviewed = facilityRelations.filter(
    (r) =>
      r.relation.verificationState === 'MEDIMESH_VERIFIED' ||
      r.relation.verificationState === 'PUBLIC_SOURCE'
  );

  // 3. Facility-Reported Participation
  const facilityReported = facilityRelations.filter(
    (r) => r.relation.verificationState === 'FACILITY_REPORTED'
  );

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Scheme Info Section */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-bold">
            {scheme.code}
          </span>
          <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] text-xs font-medium">
            {scheme.providerType}
          </span>
          <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-medium">
            Scope: {scheme.stateScope || 'All India'}
          </span>
        </div>

        <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
          {scheme.name}
        </h1>

        {scheme.description && (
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-3xl">
            {scheme.description}
          </p>
        )}

        {/* Non-Guarantee Alert */}
        <div className="rounded-[var(--radius-lg)] p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-audit-amber-border,#fde68a)] flex items-start gap-3 text-xs text-[var(--color-on-surface)] mt-2">
          <WarningIcon size={18} className="text-[var(--color-tertiary)] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">Important Empanelment & Eligibility Notice</span>
            <span className="text-[var(--color-on-surface-variant)] leading-relaxed">
              MEDIMESH displays documented facility empanelment records only. MEDIMESH does not verify,
              adjudicate, or guarantee individual patient eligibility, package rates, cashless admission,
              or insurance reimbursement. Patients must confirm current coverage directly with the hospital helpdesk.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Source-Reviewed Network Facilities */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldIcon size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
                Source-Reviewed Participation
              </h2>
            </div>
            <p className="font-body text-xs text-[var(--color-on-surface-variant)] mt-0.5">
              Facilities with empanelment corroborated through public registry notices, gazette publications, or verified hospital disclosures.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
            {sourceReviewed.length} Verified {sourceReviewed.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {sourceReviewed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sourceReviewed.map(({ relation, facility }) => (
              <div
                key={relation.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest,#ffffff)] p-5 shadow-[var(--shadow-sm)] flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge verification={relation.verificationState} size="sm" />
                    <span className="text-[10px] text-[var(--color-outline)] font-medium">Corroborated</span>
                  </div>
                  <h3 className="font-headline-sm text-base font-bold text-[var(--color-on-surface)]">
                    <Link href={`/facilities/${facility.slug}`} className="hover:text-[var(--color-primary)] hover:underline">
                      {facility.name}
                    </Link>
                  </h3>
                  <span className="text-xs text-[var(--color-on-surface-variant)]">
                    {facility.location.city}, {facility.location.state}
                  </span>
                  {relation.empanelmentCategory && (
                    <div className="text-xs font-medium text-[var(--color-primary)]">
                      Tier: {relation.empanelmentCategory}
                    </div>
                  )}
                  {relation.helpdeskLocation && (
                    <div className="text-[11px] text-[var(--color-outline)]">
                      Helpdesk: {relation.helpdeskLocation}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--color-outline)]">
                    Effective: {relation.effectiveFrom?.slice(0, 10) || 'Current'}
                  </span>
                  <Link
                    href={`/facilities/${facility.slug}`}
                    className="font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowForwardIcon size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-container-low)] text-xs text-[var(--color-outline)]">
            No source-reviewed empanelments currently documented for this program.
          </div>
        )}
      </section>

      {/* 3. Facility-Reported Participation */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-tertiary)]" />
              <h2 className="font-headline-sm text-xl font-bold text-[var(--color-on-surface)]">
                Facility-Reported Participation
              </h2>
            </div>
            <p className="font-body text-xs text-[var(--color-on-surface-variant)] mt-0.5">
              Empanelments reported by facilities awaiting comprehensive external corroboration.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]">
            {facilityReported.length} Self-Reported
          </span>
        </div>

        {facilityReported.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilityReported.map(({ relation, facility }) => (
              <div
                key={relation.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-low)] p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge verification="FACILITY_REPORTED" size="sm" label="Self-Reported" />
                    <span className="text-[10px] text-[var(--color-outline)] font-medium">Uncorroborated</span>
                  </div>
                  <h3 className="font-headline-sm text-base font-bold text-[var(--color-on-surface)]">
                    <Link href={`/facilities/${facility.slug}`} className="hover:text-[var(--color-primary)] hover:underline">
                      {facility.name}
                    </Link>
                  </h3>
                  <span className="text-xs text-[var(--color-on-surface-variant)]">
                    {facility.location.city}, {facility.location.state}
                  </span>
                  {relation.empanelmentCategory && (
                    <div className="text-xs text-[var(--color-on-surface-variant)]">
                      Reported Category: {relation.empanelmentCategory}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--color-outline)]">
                    Reported by Facility Intake
                  </span>
                  <Link
                    href={`/facilities/${facility.slug}`}
                    className="font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowForwardIcon size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-container-low)] text-xs text-[var(--color-outline)]">
            No self-reported empanelment claims under review for this program.
          </div>
        )}
      </section>
    </div>
  );
}
