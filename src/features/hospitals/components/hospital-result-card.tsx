'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Hospital } from '../types';
import { StatusBadge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { DistanceLabel } from '@/components/location';
import { SaveButton, CompareButton } from '@/components/comparison';
import {
  LocationIcon,
  InfoIcon,
  ArrowForwardIcon,
  HospitalIcon,
  MedicalServicesIcon,
  ShieldIcon,
  WarningIcon,
} from '@/components/global/icons';

export interface HospitalResultCardProps {
  hospital: Hospital;
  queryContext?: string;
  isSaved?: boolean;
  isComparing?: boolean;
  isCompareDisabled?: boolean;
  onToggleSave?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
  className?: string;
}

export function HospitalResultCard({
  hospital,
  queryContext,
  isSaved = false,
  isComparing = false,
  isCompareDisabled = false,
  onToggleSave,
  onToggleCompare,
  className,
}: HospitalResultCardProps) {
  const whyMatchesText = queryContext
    ? `Matches search criteria: ${queryContext} · ${hospital.city}`
    : `Matching healthcare facility in ${hospital.city}, ${hospital.state}`;

  return (
    <article
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col gap-4',
        className
      )}
    >
      {/* Prominent Demo Notice Banner */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-[11px] font-bold border border-[var(--color-border-default)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-tertiary)] shrink-0" />
          <span className="tracking-wide">DEMO DATA — Illustrative only, not a real hospital record</span>
        </div>
        <span className="text-[10px] uppercase font-semibold text-[var(--color-outline)] hidden sm:inline">
          Synthetic UI Preview
        </span>
      </div>

      {/* Top Row: Badges, Title, Address & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <StatusBadge verification={hospital.verificationState} size="sm" />

            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] font-label-sm text-[11px] font-medium">
              {hospital.facilityType}
            </span>

            {hospital.accreditations.length > 0 && (
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] font-label-sm text-[11px] font-semibold flex items-center gap-1">
                <ShieldIcon size={12} className="text-[var(--color-primary)]" />
                <span>{hospital.accreditations[0].body} (Illustrative Demo)</span>
              </span>
            )}
          </div>

          {/* Hospital Title */}
          <h2 className="font-heading text-lg md:text-xl font-bold text-[var(--color-on-surface)] tracking-tight">
            <Link
              href={`/hospitals/${hospital.slug}`}
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              {hospital.name}
            </Link>
          </h2>

          {/* Location & Approximate Distance */}
          <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)] font-body text-xs md:text-sm flex-wrap">
            <span className="inline-flex items-center gap-1">
              <LocationIcon size={15} className="text-[var(--color-primary)] shrink-0" />
              <span>{hospital.address}</span>
            </span>
            <span className="text-[var(--color-outline-variant)]">·</span>
            <DistanceLabel km={hospital.referenceDistanceKm} />
          </div>
        </div>

        {/* Primary Action & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start lg:self-center flex-wrap">
          <SaveButton
            isSaved={isSaved}
            onToggleSave={() => onToggleSave?.(hospital.id)}
            aria-label={`Save ${hospital.name}`}
          />
          <CompareButton
            isComparing={isComparing}
            disabled={!isComparing && isCompareDisabled}
            onToggleCompare={() => onToggleCompare?.(hospital.id)}
            aria-label={`Compare ${hospital.name}`}
          />
          <Link href={`/hospitals/${hospital.slug}`}>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowForwardIcon size={16} />}
              className="font-semibold"
            >
              View Hospital Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Why This Appears Notice */}
      <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low,#f2f3ff)] flex items-start gap-2">
        <InfoIcon size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <div className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
          <strong className="font-semibold text-[var(--color-on-surface)]">Why this appears: </strong>
          <span>{whyMatchesText}</span>
        </div>
      </div>

      {/* Structured 3-Column Metadata Grid (Neutralized Demo Attributes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[var(--color-surface-container)]/30 p-3.5 rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
        {/* Casualty Intake (Demo Schema) */}
        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-[11px] text-[var(--color-outline)] uppercase tracking-wider">
            Casualty Intake (Demo Schema)
          </span>
          <div className="flex items-center gap-1.5 font-body text-xs md:text-sm font-semibold text-[var(--color-on-surface)] mt-0.5">
            <span
              className={cn(
                'w-2 h-2 rounded-full inline-block shrink-0',
                hospital.casualtyIntake.status === 'ACTIVE_EMERGENCY'
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-tertiary)]'
              )}
            />
            <span>{hospital.casualtyIntake.label}</span>
          </div>
          <span className="font-body text-[11px] text-[var(--color-on-surface-variant)]">
            {hospital.casualtyIntake.subtext}
          </span>
        </div>

        {/* Data Architecture Record */}
        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-[11px] text-[var(--color-outline)] uppercase tracking-wider">
            Data Architecture Model
          </span>
          <span className="font-body text-xs md:text-sm text-[var(--color-on-surface)] font-medium mt-0.5">
            Synthetic Demo Record
          </span>
          <span className="font-body text-[11px] text-[var(--color-on-surface-variant)]">
            Illustrative demo attributes
          </span>
        </div>

        {/* Verification State (Data Architecture Test) */}
        <div className="flex flex-col gap-0.5">
          <span className="font-label-sm text-[11px] text-[var(--color-outline)] uppercase tracking-wider">
            Illustrative Demo Attributes
          </span>
          <div className="mt-0.5">
            <StatusBadge verification={hospital.verificationState} size="sm" />
          </div>
          <span className="font-body text-[11px] text-[var(--color-on-surface-variant)]">
            Demonstrates provenance schema
          </span>
        </div>
      </div>

      {/* Services, Schemes & Direct Confirmation Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[var(--color-border-default)]/60">
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-body">
          {hospital.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] flex items-center gap-1"
            >
              <MedicalServicesIcon size={13} className="text-[var(--color-primary)]" />
              <span>{service}</span>
            </span>
          ))}

          {hospital.schemes.slice(0, 2).map((scheme) => (
            <span
              key={scheme}
              className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-civic-blue-bg,#eff6ff)] text-[var(--color-civic-blue,#2563eb)] border border-[var(--color-civic-blue-border,#bfdbfe)] font-medium flex items-center gap-1"
            >
              <HospitalIcon size={13} />
              <span>{scheme} (Illustrative)</span>
            </span>
          ))}
        </div>

        <div className="font-label-sm text-[11px] text-[var(--color-on-surface-variant)] flex items-center gap-1 shrink-0">
          <WarningIcon size={13} className="text-[var(--color-tertiary)]" />
          <span>Fictional demo record for UI evaluation. Not a real facility.</span>
        </div>
      </div>
    </article>
  );
}
