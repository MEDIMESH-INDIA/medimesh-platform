'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Hospital } from '../types';
import { Breadcrumbs } from '@/components/global/navigation';
import { StatusBadge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/primitives/card';
import { SaveButton, CompareButton } from '@/components/comparison';
import { TrustPanel, ProvenanceRow, LastUpdated } from '@/components/trust';
import { DistanceLabel } from '@/components/location';
import { useToast } from '@/design-system/primitives/toast';
import {
  LocationIcon,
  ShieldIcon,
  PhoneIcon,
  HospitalIcon,
  MedicalServicesIcon,
  InfoIcon,
  ArrowBackIcon,
  WarningIcon,
} from '@/components/global/icons';

export interface HospitalProfileViewProps {
  hospital: Hospital;
}

export function HospitalProfileView({ hospital }: HospitalProfileViewProps) {
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const handleToggleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    showToast(next ? 'Saved to My MEDIMESH' : 'Removed from saved items', 'info');
  };

  const handleToggleCompare = () => {
    const next = !isComparing;
    setIsComparing(next);
    showToast(next ? 'Added to comparison' : 'Removed from comparison', 'success');
  };

  const handleDemoCall = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('This is an illustrative demo facility. Phone dialing is disabled.', 'info');
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1280px] mx-auto px-4 md:px-8 py-6">
      {/* Contextual Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Discovery', href: '/search' },
            { label: `${hospital.city} Hospitals`, href: `/search?location=${encodeURIComponent(hospital.city)}` },
            { label: hospital.name },
          ]}
        />
        <Link href="/search" className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline">
          <ArrowBackIcon size={14} />
          <span>Back to results</span>
        </Link>
      </div>

      {/* Prominent Demo Notice Banner */}
      <div className="bg-[var(--color-surface-container-high)] border-l-4 border-[var(--color-tertiary)] p-4 rounded-[var(--radius-md)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-body text-[var(--color-on-surface)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-[var(--color-tertiary)] text-white text-[11px] font-extrabold tracking-wider uppercase shrink-0">
            DEMO DATA
          </span>
          <span className="font-semibold">
            Illustrative only, not a real hospital record. All attributes, bed counts, and capabilities are synthetic examples.
          </span>
        </div>
        <span className="text-[var(--color-on-surface-variant)] text-[11px] shrink-0 font-medium">
          Fictional demonstration campus
        </span>
      </div>

      {/* Facility Hero Header Section */}
      <section className="bg-[var(--color-surface-container-lowest,#ffffff)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-6 md:p-8 shadow-[var(--shadow-sm)] flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex flex-col gap-2 flex-1">
            {/* Badges & Freshness row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-bold bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] border border-[var(--color-border-default)]">
                DEMO DATA — Illustrative only, not a real hospital record
              </span>
              <StatusBadge verification={hospital.verificationState} size="md" />
              <LastUpdated isoDate={hospital.lastProfileUpdate} prefix="Demo schema updated" />
            </div>

            {/* Hospital Title */}
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
              {hospital.name}
            </h1>

            {/* Classification, Address & Distance */}
            <div className="flex items-center gap-2 flex-wrap font-body text-xs md:text-sm text-[var(--color-on-surface-variant)]">
              <span className="font-semibold text-[var(--color-on-surface)]">
                {hospital.facilityType} (Demo Record)
              </span>
              <span className="text-[var(--color-outline-variant)]">·</span>
              <span className="inline-flex items-center gap-1">
                <LocationIcon size={15} className="text-[var(--color-primary)] shrink-0" />
                <span>{hospital.address}</span>
              </span>
              <span className="text-[var(--color-outline-variant)]">·</span>
              <DistanceLabel km={hospital.referenceDistanceKm} />
            </div>

            {/* Neutral Overview */}
            <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed pt-1">
              {hospital.overview}
            </p>
          </div>

          {/* Action Bar (Save, Compare, Call) */}
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center flex-wrap">
            <SaveButton
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              showText
            />
            <CompareButton
              isComparing={isComparing}
              onToggleCompare={handleToggleCompare}
              showText
            />
            <Button
              variant="outline"
              size="md"
              leftIcon={<PhoneIcon size={16} />}
              onClick={handleDemoCall}
              className="font-semibold"
            >
              Demo Phone
            </Button>
          </div>
        </div>

        {/* Informational Transparency Alert */}
        <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex items-start gap-2 text-xs font-body text-[var(--color-on-surface-variant)]">
          <InfoIcon size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <span>
            <strong>Demo Safety Notice: </strong>
            This record is strictly illustrative demo data and must never be taken as a claim about a real hospital. Scheme and accreditation names are used solely to demonstrate data architecture fields.
          </span>
        </div>
      </section>

      {/* Main Content Grid: Information Modules + Trust Sourcing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Facility Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section 1: Capacity & Key Infrastructure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HospitalIcon size={18} className="text-[var(--color-primary)]" />
                <span>Facility Infrastructure &amp; Capacity (Demo Model)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] text-center">
                <div className="flex flex-col">
                  <span className="font-numeric-data text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
                    {hospital.bedCapacityTotal}
                  </span>
                  <span className="font-label-sm text-xs text-[var(--color-outline)] uppercase mt-1">
                    Total Beds (Demo)
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-numeric-data text-xl md:text-2xl font-bold text-[var(--color-primary)]">
                    {hospital.icuBedCapacity}
                  </span>
                  <span className="font-label-sm text-xs text-[var(--color-outline)] uppercase mt-1">
                    ICU Beds (Demo)
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-numeric-data text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
                    {hospital.specialties.length}
                  </span>
                  <span className="font-label-sm text-xs text-[var(--color-outline)] uppercase mt-1">
                    Specialties (Demo)
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-numeric-data text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
                    {hospital.schemes.length}
                  </span>
                  <span className="font-label-sm text-xs text-[var(--color-outline)] uppercase mt-1">
                    Schemes (Demo)
                  </span>
                </div>
              </div>

              {/* Casualty Status Box */}
              <div className="mt-4 p-3.5 rounded-[var(--radius-md)] border border-[var(--color-border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-body">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-3 h-3 rounded-full shrink-0',
                      hospital.casualtyIntake.status === 'ACTIVE_EMERGENCY'
                        ? 'bg-[var(--color-primary)]'
                        : 'bg-[var(--color-tertiary)]'
                    )}
                  />
                  <div>
                    <strong className="text-[var(--color-on-surface)] block font-semibold">
                      Casualty Intake Field: {hospital.casualtyIntake.label}
                    </strong>
                    <span className="text-[var(--color-on-surface-variant)]">
                      {hospital.casualtyIntake.subtext}
                    </span>
                  </div>
                </div>
                <span className="text-[var(--color-outline)] shrink-0">
                  Illustrative demo attribute
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Clinical Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MedicalServicesIcon size={18} className="text-[var(--color-primary)]" />
                <span>Clinical Specialties (Illustrative Demo Examples)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">
                Specialties listed below demonstrate data architecture schema. This synthetic facility does not offer real medical care.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {hospital.specialties.map((spec) => (
                  <div
                    key={spec}
                    className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] flex items-center justify-between text-xs md:text-sm font-body"
                  >
                    <span className="font-semibold text-[var(--color-on-surface)]">{spec}</span>
                    <span className="text-[var(--color-outline)] text-[11px]">Illustrative field</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Diagnostic & Specialized Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon size={18} className="text-[var(--color-primary)]" />
                <span>Facilities &amp; Diagnostics (Illustrative Demo Model)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {hospital.services.map((svc) => (
                  <div
                    key={svc}
                    className="p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] flex items-center gap-2 text-xs md:text-sm font-body"
                  >
                    <div className="w-6 h-6 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                      ✓
                    </div>
                    <span className="text-[var(--color-on-surface)] font-medium">{svc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Government Healthcare Schemes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HospitalIcon size={18} className="text-[var(--color-secondary)]" />
                <span>Government Scheme Fields (Illustrative Demo Model)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">
                Real-world scheme names (e.g. PM-JAY, CGHS) are retained solely to demonstrate the data model. This fictional facility is not actually accredited or empaneled.
              </p>
              <div className="flex flex-col gap-2.5">
                {hospital.schemes.map((sch) => (
                  <div
                    key={sch}
                    className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-civic-blue-bg,#eff6ff)] border border-[var(--color-civic-blue-border,#bfdbfe)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 text-xs md:text-sm font-body font-semibold text-[var(--color-civic-blue,#2563eb)]">
                      <HospitalIcon size={16} />
                      <span>{sch} (Illustrative Example)</span>
                    </div>
                    <span className="text-[11px] font-body text-[var(--color-on-surface-variant)]">
                      Demonstration empanelment field
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Trust & Provenance Architecture */}
        <div className="flex flex-col gap-6">
          {/* Trust Panel */}
          <TrustPanel title="Data Model Provenance Architecture (Demo)" source={hospital.primarySource}>
            <p>
              This profile uses synthetic demonstration records to showcase MEDIMESH data architecture and provenance tracking. These fields illustrate how verified sources will be attributed in production, but do not represent real-world clinical credentials, government registrations, or healthcare facilities.
            </p>
          </TrustPanel>

          {/* Detailed Provenance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Illustrative Demo Attributes Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-[var(--color-border-default)]">
              <ProvenanceRow
                label="NABH Accreditation Model"
                value={
                  hospital.accreditations.length > 0
                    ? `${hospital.accreditations[0].level || 'Accredited'} (Demo Model)`
                    : 'Not Reported'
                }
                source={hospital.accreditations[0]?.source || hospital.primarySource}
              />
              <ProvenanceRow
                label="PM-JAY Scheme Model"
                value={
                  hospital.schemes.includes('Ayushman Bharat (PM-JAY)')
                    ? 'Illustrative Empaneled (Demo)'
                    : 'Not Empaneled'
                }
                source={hospital.primarySource}
              />
              <ProvenanceRow
                label="Casualty Intake Model"
                value={`${hospital.casualtyIntake.label} (Demo Schema)`}
                source={hospital.casualtyIntake.source}
              />
              <ProvenanceRow
                label="Bed Capacity Model"
                value={`${hospital.bedCapacityTotal} Beds (${hospital.icuBedCapacity} ICU) [Demo Values]`}
                source={hospital.primarySource}
              />
              <ProvenanceRow
                label="Specialty Registry Model"
                value={`${hospital.specialties.length} Specialties (Illustrative Schema)`}
                source={hospital.primarySource}
              />
            </CardContent>
          </Card>

          {/* Facility Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Illustrative Facility Contact</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 font-body text-xs text-[var(--color-on-surface-variant)]">
              <div className="flex items-start gap-2">
                <LocationIcon size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <span>{hospital.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon size={16} className="text-[var(--color-primary)] shrink-0" />
                <span className="font-semibold text-[var(--color-on-surface)]">
                  {hospital.phone}
                </span>
              </div>
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] text-[11px] text-[var(--color-outline)] italic flex items-center gap-1.5">
                <WarningIcon size={13} className="text-[var(--color-tertiary)] shrink-0" />
                <span>Fictional demonstration contact for UI architecture evaluation only.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
