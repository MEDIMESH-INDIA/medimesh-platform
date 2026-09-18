'use client';

import React from 'react';
import Link from 'next/link';
import type { DoctorProfile, Facility, Specialty, SourceProvenance } from '@/features/data-architecture/domain';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  HospitalIcon,
  ShieldIcon,
  InfoIcon,
  ArrowForwardIcon,
} from '@/components/global/icons';
import { CorrectionTrigger } from '@/features/corrections';

export interface DoctorProfileViewProps {
  doctor: DoctorProfile;
  facility?: Facility;
  specialty?: Specialty;
  source?: SourceProvenance | null;
}

export function DoctorProfileView({
  doctor,
  facility,
  specialty,
  source,
}: DoctorProfileViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Prominent Demo Notice */}
      <div className="rounded-[var(--radius-lg)] p-4 md:p-5 bg-[var(--color-surface-container-high)] border border-[var(--color-border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[var(--color-tertiary)] shrink-0 mt-1 sm:mt-0 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-bold text-[var(--color-on-surface)]">
              DEMO DATA RECORD — SYNTHETIC PROFESSIONAL PROFILE
            </span>
            <span className="font-body text-xs text-[var(--color-on-surface-variant)]">
              This doctor profile is populated strictly for demonstration of registry modeling.
              It does not represent a real practitioner or certified clinical schedule.
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] text-[11px] font-semibold tracking-wider uppercase shrink-0">
          Synthetic Demo
        </span>
      </div>

      {/* Main Profile Header */}
      <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge verification={doctor.verificationState} size="md" />
              {specialty && (
                <Link
                  href={`/specialties/${specialty.slug}`}
                  className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  {specialty.name}
                </Link>
              )}
            </div>

            <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
              {doctor.name}
            </h1>

            <span className="text-sm font-semibold text-[var(--color-primary)]">
              {doctor.title}
            </span>

            <span className="text-xs text-[var(--color-on-surface-variant)] font-medium">
              Qualifications: {doctor.qualifications}
            </span>
          </div>

          {/* OPD Summary Badge */}
          <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] flex flex-col gap-1.5 shrink-0 min-w-[220px]">
            <span className="text-[11px] uppercase font-semibold text-[var(--color-outline)]">
              Reported OPD Schedule
            </span>
            <span className="font-body text-xs font-semibold text-[var(--color-on-surface)]">
              {doctor.opdTimings || 'Consultation by appointment'}
            </span>
            <span className="text-[10px] text-[var(--color-outline)] mt-1">
              Source-reported schedule. Subject to hospital intake confirmation.
            </span>
          </div>
        </div>

        {/* Primary Hospital Affiliation */}
        {facility && (
          <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <HospitalIcon size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex flex-col">
                <span className="text-[11px] uppercase font-semibold text-[var(--color-outline)]">
                  Primary Facility Affiliation
                </span>
                <Link
                  href={`/facilities/${facility.slug}`}
                  className="font-headline-sm text-sm font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] hover:underline"
                >
                  {facility.name}
                </Link>
                <span className="text-xs text-[var(--color-on-surface-variant)]">
                  {facility.location.city}, {facility.location.state}
                </span>
              </div>
            </div>

            <Link
              href={`/facilities/${facility.slug}`}
              className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Facility Details</span>
              <ArrowForwardIcon size={14} />
            </Link>
          </div>
        )}

        {/* Mandatory Registration Reference Block */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[var(--color-border-subtle)]">
          <h2 className="font-headline-sm text-base font-bold text-[var(--color-on-surface)] flex items-center gap-2">
            <ShieldIcon size={18} className="text-[var(--color-primary)]" />
            <span>Public Professional Registration Information</span>
          </h2>

          <div className="rounded-[var(--radius-lg)] p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] flex flex-col gap-3">
            <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Public professional registration information, where available, with source, verification state, and freshness.
              MEDIMESH verification means provenance and documentation review only. It must never imply professional
              certification, regulatory endorsement, clinical quality, or suitability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-[var(--color-border-subtle)]">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">
                  Registration Ref
                </span>
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {doctor.registrationReference || 'Public Registry Record (Demo)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">
                  Verification State
                </span>
                <span className="font-semibold text-[var(--color-primary)]">
                  {doctor.verificationState}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] block">
                  Source Evidence
                </span>
                <span className="font-medium text-[var(--color-on-surface)]">
                  {source?.sourceOrganization || 'MEDIMESH Demo Review Desk'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Non-Endorsement Disclosure */}
        <div className="rounded-[var(--radius-md)] p-3.5 bg-[var(--color-surface-container-low)] border border-[var(--color-border-subtle)] flex items-start gap-2.5 text-xs text-[var(--color-on-surface-variant)]">
          <InfoIcon size={16} className="text-[var(--color-outline)] shrink-0 mt-0.5" />
          <span>
            <strong>Neutrality Invariant:</strong> MEDIMESH India 2.0 maintains a strict non-commercial, non-promotional policy.
            Practitioner listings do not include patient ratings, popularity metrics, or sponsored placements.
            All medical consultations must be arranged directly with the affiliated hospital or clinic.
          </span>
        </div>

        {/* Public Correction Action Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] gap-3 mt-2">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading font-semibold text-xs text-[var(--color-on-surface)]">
              Discrepancy in OPD timings or public registration details?
            </span>
            <span className="font-body text-[11px] text-[var(--color-on-surface-variant)]">
              Submit documented updates for editorial provenance review.
            </span>
          </div>
          <CorrectionTrigger
            targetEntityType="DOCTOR"
            targetEntityId={doctor.id}
            targetTitle={doctor.name}
            label="Report an information issue"
            variant="outline"
            size="sm"
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
