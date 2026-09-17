'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type {
  SearchFilters,
  ClinicalSpecialty,
  FacilityType,
  HospitalService,
  GovernmentScheme,
} from '../types';
import type { VerificationState } from '@/types';
import { SearchFilterButton } from '@/components/discovery';
import { BottomSheet, BottomSheetFooter } from '@/design-system/primitives/bottom-sheet';
import { Button } from '@/design-system/primitives/button';
import { Checkbox } from '@/components/forms/checkbox';
import {
  FilterIcon,
  CheckIcon,
} from '@/components/global/icons';

export interface HospitalFiltersProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: SearchFilters) => void;
  onResetFilters: () => void;
  totalMatches: number;
  className?: string;
}

const AVAILABLE_SPECIALTIES: ClinicalSpecialty[] = [
  'Cardiology',
  'Orthopedics',
  'Neurology & Neurosurgery',
  'Oncology',
  'Nephrology & Urology',
  'Pediatrics',
  'General Medicine',
  'Emergency & Critical Care',
  'Gastroenterology',
];

const AVAILABLE_FACILITY_TYPES: FacilityType[] = [
  'Super Specialty Hospital',
  'Multi-Specialty Hospital',
  'Single Specialty Hospital',
  'Government Medical College Hospital',
  'Community Health Center',
];

const AVAILABLE_SERVICES: HospitalService[] = [
  '24/7 Emergency Casualty',
  'Dedicated Cardiac ICU',
  'Flat-Panel Cath Lab',
  '3T MRI Diagnostic',
  'Multi-Slice CT Scanner',
  'Hemodialysis Unit',
  'e-Raktkosh Blood Bank',
];

const AVAILABLE_SCHEMES: GovernmentScheme[] = [
  'Ayushman Bharat (PM-JAY)',
  'Central Govt Health Scheme (CGHS)',
  'Ex-Servicemen Contributory Health Scheme (ECHS)',
  'State Health Insurance Scheme',
  'TPA Cashless Desk',
];

const AVAILABLE_VERIFICATION_STATES: { state: VerificationState; label: string }[] = [
  { state: 'MEDIMESH_VERIFIED', label: 'MEDIMESH Verified' },
  { state: 'FACILITY_REPORTED', label: 'Facility Reported' },
  { state: 'PUBLIC_SOURCE', label: 'Public Source Record' },
  { state: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { state: 'NOT_CONFIRMED', label: 'Not Confirmed' },
];

export function HospitalFilters({
  filters,
  onFilterChange,
  onResetFilters,
  totalMatches,
  className,
}: HospitalFiltersProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const activeFilterCount =
    filters.specialties.length +
    filters.facilityTypes.length +
    filters.services.length +
    filters.schemes.length +
    filters.verificationStates.length +
    (filters.onlyActiveCasualty ? 1 : 0);

  const toggleSpecialty = (spec: ClinicalSpecialty) => {
    const next = filters.specialties.includes(spec)
      ? filters.specialties.filter((s) => s !== spec)
      : [...filters.specialties, spec];
    onFilterChange({ ...filters, specialties: next });
  };

  const toggleFacilityType = (type: FacilityType) => {
    const next = filters.facilityTypes.includes(type)
      ? filters.facilityTypes.filter((t) => t !== type)
      : [...filters.facilityTypes, type];
    onFilterChange({ ...filters, facilityTypes: next });
  };

  const toggleService = (svc: HospitalService) => {
    const next = filters.services.includes(svc)
      ? filters.services.filter((s) => s !== svc)
      : [...filters.services, svc];
    onFilterChange({ ...filters, services: next });
  };

  const toggleScheme = (sch: GovernmentScheme) => {
    const next = filters.schemes.includes(sch)
      ? filters.schemes.filter((s) => s !== sch)
      : [...filters.schemes, sch];
    onFilterChange({ ...filters, schemes: next });
  };

  const toggleVerificationState = (state: VerificationState) => {
    const next = filters.verificationStates.includes(state)
      ? filters.verificationStates.filter((v) => v !== state)
      : [...filters.verificationStates, state];
    onFilterChange({ ...filters, verificationStates: next });
  };

  return (
    <section
      aria-label="Refine facility results"
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-3.5 shadow-[var(--shadow-xs)] flex flex-col gap-3',
        className
      )}
    >
      {/* Top Refinement Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-label-sm text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
            Refine Facility Results
          </span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-[11px] font-bold">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-md)] bg-[var(--color-surface-container)] text-xs font-semibold text-[var(--color-on-surface)] cursor-pointer"
          >
            <FilterIcon size={14} />
            <span>Filters ({activeFilterCount})</span>
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Desktop Filter Pills Ribbon */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {/* Specialty Filter Dropdown */}
        <div className="relative">
          <SearchFilterButton
            label="Specialty"
            active={filters.specialties.length > 0}
            count={filters.specialties.length}
            hasDropdown
            onClick={() =>
              setActiveDropdown(activeDropdown === 'specialty' ? null : 'specialty')
            }
            onClear={() => onFilterChange({ ...filters, specialties: [] })}
          />
          {activeDropdown === 'specialty' && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-2.5 z-30 flex flex-col gap-1 max-h-64 overflow-y-auto">
              <span className="font-label-sm text-[11px] font-bold text-[var(--color-outline)] uppercase px-1 mb-1">
                Clinical Specialties
              </span>
              {AVAILABLE_SPECIALTIES.map((spec) => (
                <label
                  key={spec}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--color-surface-container-low)] rounded text-xs font-body text-[var(--color-on-surface)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.specialties.includes(spec)}
                    onChange={() => toggleSpecialty(spec)}
                    className="accent-[var(--color-primary)] w-4 h-4 rounded"
                  />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Facility Type Filter Dropdown */}
        <div className="relative">
          <SearchFilterButton
            label="Facility Type"
            active={filters.facilityTypes.length > 0}
            count={filters.facilityTypes.length}
            hasDropdown
            onClick={() =>
              setActiveDropdown(activeDropdown === 'facilityType' ? null : 'facilityType')
            }
            onClear={() => onFilterChange({ ...filters, facilityTypes: [] })}
          />
          {activeDropdown === 'facilityType' && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-2.5 z-30 flex flex-col gap-1">
              <span className="font-label-sm text-[11px] font-bold text-[var(--color-outline)] uppercase px-1 mb-1">
                Facility Classification
              </span>
              {AVAILABLE_FACILITY_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--color-surface-container-low)] rounded text-xs font-body text-[var(--color-on-surface)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.facilityTypes.includes(type)}
                    onChange={() => toggleFacilityType(type)}
                    className="accent-[var(--color-primary)] w-4 h-4 rounded"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Services & Capabilities Filter Dropdown */}
        <div className="relative">
          <SearchFilterButton
            label="Services"
            active={filters.services.length > 0}
            count={filters.services.length}
            hasDropdown
            onClick={() =>
              setActiveDropdown(activeDropdown === 'services' ? null : 'services')
            }
            onClear={() => onFilterChange({ ...filters, services: [] })}
          />
          {activeDropdown === 'services' && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-2.5 z-30 flex flex-col gap-1 max-h-64 overflow-y-auto">
              <span className="font-label-sm text-[11px] font-bold text-[var(--color-outline)] uppercase px-1 mb-1">
                Facilities &amp; Diagnostics
              </span>
              {AVAILABLE_SERVICES.map((svc) => (
                <label
                  key={svc}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--color-surface-container-low)] rounded text-xs font-body text-[var(--color-on-surface)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.services.includes(svc)}
                    onChange={() => toggleService(svc)}
                    className="accent-[var(--color-primary)] w-4 h-4 rounded"
                  />
                  <span>{svc}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Schemes & Cashless Filter Dropdown */}
        <div className="relative">
          <SearchFilterButton
            label="Govt Schemes"
            active={filters.schemes.length > 0}
            count={filters.schemes.length}
            hasDropdown
            onClick={() =>
              setActiveDropdown(activeDropdown === 'schemes' ? null : 'schemes')
            }
            onClear={() => onFilterChange({ ...filters, schemes: [] })}
          />
          {activeDropdown === 'schemes' && (
            <div className="absolute left-0 top-full mt-1.5 w-68 bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-2.5 z-30 flex flex-col gap-1">
              <span className="font-label-sm text-[11px] font-bold text-[var(--color-outline)] uppercase px-1 mb-1">
                Empaneled Healthcare Schemes
              </span>
              {AVAILABLE_SCHEMES.map((sch) => (
                <label
                  key={sch}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--color-surface-container-low)] rounded text-xs font-body text-[var(--color-on-surface)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.schemes.includes(sch)}
                    onChange={() => toggleScheme(sch)}
                    className="accent-[var(--color-secondary)] w-4 h-4 rounded"
                  />
                  <span>{sch}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Active Emergency Casualty Toggle */}
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              ...filters,
              onlyActiveCasualty: !filters.onlyActiveCasualty,
            })
          }
          className={cn(
            'px-3 py-1.5 rounded-[var(--radius-md)] text-xs md:text-sm font-semibold transition-all select-none cursor-pointer flex items-center gap-1.5',
            filters.onlyActiveCasualty
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm'
              : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'
          )}
        >
          {filters.onlyActiveCasualty && <CheckIcon size={14} />}
          <span>Active Casualty Only</span>
        </button>

        {/* Verification State Filter Dropdown */}
        <div className="relative">
          <SearchFilterButton
            label="Verification"
            active={filters.verificationStates.length > 0}
            count={filters.verificationStates.length}
            hasDropdown
            onClick={() =>
              setActiveDropdown(activeDropdown === 'verification' ? null : 'verification')
            }
            onClear={() => onFilterChange({ ...filters, verificationStates: [] })}
          />
          {activeDropdown === 'verification' && (
            <div className="absolute left-0 top-full mt-1.5 w-60 bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-2.5 z-30 flex flex-col gap-1">
              <span className="font-label-sm text-[11px] font-bold text-[var(--color-outline)] uppercase px-1 mb-1">
                Data Verification Standing
              </span>
              {AVAILABLE_VERIFICATION_STATES.map((v) => (
                <label
                  key={v.state}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--color-surface-container-low)] rounded text-xs font-body text-[var(--color-on-surface)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.verificationStates.includes(v.state)}
                    onChange={() => toggleVerificationState(v.state)}
                    className="accent-[var(--color-primary)] w-4 h-4 rounded"
                  />
                  <span>{v.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter BottomSheet */}
      <BottomSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        title="Refine Results"
        description="Filter matching healthcare facilities by specialty, services, and schemes."
      >
        <div className="flex flex-col gap-5 py-2 max-h-[60vh] overflow-y-auto">
          {/* Specialties */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
              Clinical Specialties
            </span>
            <div className="flex flex-col gap-1.5 pl-1">
              {AVAILABLE_SPECIALTIES.map((spec) => (
                <Checkbox
                  key={spec}
                  id={`mobile-spec-${spec}`}
                  label={spec}
                  checked={filters.specialties.includes(spec)}
                  onChange={() => toggleSpecialty(spec)}
                />
              ))}
            </div>
          </div>

          {/* Facility Types */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
              Facility Classification
            </span>
            <div className="flex flex-col gap-1.5 pl-1">
              {AVAILABLE_FACILITY_TYPES.map((type) => (
                <Checkbox
                  key={type}
                  id={`mobile-type-${type}`}
                  label={type}
                  checked={filters.facilityTypes.includes(type)}
                  onChange={() => toggleFacilityType(type)}
                />
              ))}
            </div>
          </div>

          {/* Schemes */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
              Government Schemes &amp; Cashless
            </span>
            <div className="flex flex-col gap-1.5 pl-1">
              {AVAILABLE_SCHEMES.map((sch) => (
                <Checkbox
                  key={sch}
                  id={`mobile-sch-${sch}`}
                  label={sch}
                  checked={filters.schemes.includes(sch)}
                  onChange={() => toggleScheme(sch)}
                />
              ))}
            </div>
          </div>
        </div>

        <BottomSheetFooter>
          <div className="flex items-center justify-between w-full gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={onResetFilters}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsMobileSheetOpen(false)}
              className="flex-1"
            >
              Show ({totalMatches}) Facilities
            </Button>
          </div>
        </BottomSheetFooter>
      </BottomSheet>
    </section>
  );
}
