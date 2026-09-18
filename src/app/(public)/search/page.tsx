'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { SearchInput } from '@/components/forms/search-input';
import { LocationSelector } from '@/components/location';
import { SearchInterpretation } from '@/components/discovery';
import { PageLoadingState, EmptyState } from '@/components/system';
import { Button } from '@/design-system/primitives/button';
import { ComparisonLimitNotice } from '@/components/comparison';
import { useToast } from '@/design-system/primitives/toast';
import {
  HospitalResultCard,
  HospitalFilters,
} from '@/features/hospitals/components';
import { searchHospitals } from '@/features/hospitals/lib/search-engine';
import type {
  SearchFilters,
  ResultSortOrder,
  ClinicalSpecialty,
  FacilityType,
  GovernmentScheme,
  HospitalService,
} from '@/features/hospitals/types';
import type { UserLocation } from '@/types';
import { RefreshIcon } from '@/components/global/icons';
import { useAuth } from '@/features/user/auth';
import { defaultUserService } from '@/features/user/services';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isAuthenticated, openAuthPrompt } = useAuth();

  const rawQuery = searchParams.get('q') || '';
  const paramLocation = searchParams.get('location') || '';
  const paramSpecialty = searchParams.get('specialty') as ClinicalSpecialty | null;
  const paramFacilityType = searchParams.get('facilityType') as FacilityType | null;
  const paramScheme = searchParams.get('scheme') as GovernmentScheme | null;
  const paramService = searchParams.get('service') as HospitalService | null;

  // Local interactive query input
  const [searchInputVal, setSearchInputVal] = useState(rawQuery);

  // Active user reference location
  const [currentLocation, setCurrentLocation] = useState<UserLocation>({
    mode: 'SELECTED',
    displayName: paramLocation ? `${paramLocation}` : 'Bengaluru, Karnataka',
    city: paramLocation || 'Bengaluru',
    state: 'Karnataka',
  });
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  // Active filters state
  const [filters, setFilters] = useState<SearchFilters>({
    location: paramLocation || undefined,
    specialties: paramSpecialty ? [paramSpecialty] : [],
    facilityTypes: paramFacilityType ? [paramFacilityType] : [],
    services: paramService ? [paramService] : [],
    schemes: paramScheme ? [paramScheme] : [],
    verificationStates: [],
    onlyActiveCasualty: false,
  });

  // Sort order state
  const [sortOrder, setSortOrder] = useState<ResultSortOrder>('proximity');

  // Client-side save and comparison state
  const [savedHospitalIds, setSavedHospitalIds] = useState<string[]>([]);
  const [comparedHospitalIds, setComparedHospitalIds] = useState<string[]>([]);

  // Load saved items if user is authenticated
  useEffect(() => {
    if (user?.id) {
      defaultUserService.listSavedItemsResolved(user.id, 'FACILITY').then((items) => {
        setSavedHospitalIds(items.map((i) => i.savedItem.entityId));
      });
    }
  }, [user?.id]);

  // Execute deterministic search engine
  const searchResult = useMemo(() => {
    return searchHospitals(rawQuery, currentLocation, filters, sortOrder);
  }, [rawQuery, currentLocation, filters, sortOrder]);

  // Record non-diagnostic recent search if user is authenticated
  useEffect(() => {
    if (user?.id && rawQuery.trim()) {
      defaultUserService.recordSearch(
        user.id,
        rawQuery,
        currentLocation.city,
        searchResult.interpretation.interpretedSpecialty
          ? `Specialty: ${searchResult.interpretation.interpretedSpecialty}`
          : undefined
      );
    }
  }, [user?.id, rawQuery, currentLocation.city, searchResult.interpretation.interpretedSpecialty]);

  const handleQuerySubmit = (newQuery?: string) => {
    const q = (newQuery !== undefined ? newQuery : searchInputVal).trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (currentLocation.city) params.set('location', currentLocation.city);
    router.push(`/search?${params.toString()}`);
  };

  const handleToggleSave = async (id: string) => {
    if (!isAuthenticated || !user) {
      openAuthPrompt({ entityType: 'FACILITY', entityId: id });
      return;
    }

    if (savedHospitalIds.includes(id)) {
      setSavedHospitalIds((prev) => prev.filter((item) => item !== id));
      try {
        await defaultUserService.unsaveItem(user.id, 'FACILITY', id);
        showToast('Removed from saved items', 'info');
      } catch {
        showToast('Failed to update saved item', 'info');
      }
    } else {
      setSavedHospitalIds((prev) => [...prev, id]);
      try {
        await defaultUserService.saveItem(user.id, 'FACILITY', id);
        showToast('Saved to your MEDIMESH account.', 'success');
      } catch {
        showToast('Failed to save to account', 'info');
      }
    }
  };

  const handleToggleCompare = async (id: string) => {
    if (comparedHospitalIds.includes(id)) {
      setComparedHospitalIds((prev) => prev.filter((item) => item !== id));
      showToast('Removed from comparison', 'info');
    } else {
      if (comparedHospitalIds.length >= 2) {
        showToast('Maximum 2 facilities can be compared at a time.', 'info');
        return;
      }
      const nextCompared = [...comparedHospitalIds, id];
      setComparedHospitalIds(nextCompared);
      if (nextCompared.length === 2 && user?.id) {
        try {
          await defaultUserService.saveComparison(user.id, nextCompared[0], nextCompared[1]);
        } catch {
          // ignore
        }
      }
      showToast('Added to comparison (max 2)', 'success');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      location: undefined,
      specialties: [],
      facilityTypes: [],
      services: [],
      schemes: [],
      verificationStates: [],
      onlyActiveCasualty: false,
    });
    showToast('Filters reset to default', 'info');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Global Header */}
      <Header
        currentLocation={currentLocation}
        onLocationChange={(loc) => {
          setCurrentLocation(loc);
          showToast(`Location set to ${loc.displayName}`);
        }}
        onSearchClick={() => {
          const el = document.getElementById('search-results-input');
          el?.focus();
        }}
      />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-6">
        {/* Top Visible DEMO DATA Notice */}
        <div className="bg-[var(--color-surface-container-high)] border-l-4 border-[var(--color-tertiary)] p-3 rounded-[var(--radius-md)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-body text-[var(--color-on-surface)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[var(--color-tertiary)] text-white text-[10px] font-extrabold tracking-wider uppercase shrink-0">
              DEMO DATA
            </span>
            <span className="font-semibold">
              Illustrative only, not a real hospital record. All facilities and attributes shown are synthetic examples for UI evaluation.
            </span>
          </div>
          <span className="text-[11px] text-[var(--color-outline)] font-medium shrink-0">
            Phase 03 Synthetic Dataset
          </span>
        </div>

        {/* Top Search Input Bar */}
        <div className="bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-2 shadow-[var(--shadow-sm)]">
          <SearchInput
            id="search-results-input"
            value={searchInputVal}
            onChange={(e) => setSearchInputVal(e.target.value)}
            onClear={() => setSearchInputVal('')}
            onSubmitSearch={() => handleQuerySubmit()}
            placeholder="Search by symptom, specialty, procedure, or hospital name..."
          />
        </div>

        {/* Natural Language Query Interpretation & Context */}
        <SearchInterpretation
          query={searchResult.interpretation.rawQuery}
          specialty={searchResult.interpretation.interpretedSpecialty}
          location={searchResult.interpretation.interpretedLocation || currentLocation.displayName}
          facilityType={searchResult.interpretation.interpretedFacilityType}
          onLocationChange={() => setIsLocationSelectorOpen(true)}
          onEditSearch={() => {
            const el = document.getElementById('search-results-input');
            el?.focus();
          }}
        />

        {/* Structured Refinement Filters */}
        <HospitalFilters
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          totalMatches={searchResult.totalMatches}
        />

        {/* Comparison Limit Notice (when comparing) */}
        {comparedHospitalIds.length >= 2 && (
          <ComparisonLimitNotice />
        )}

        {/* Match Header & Sorting Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-[var(--color-border-default)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-lg md:text-xl font-bold text-[var(--color-on-surface)]">
              Showing {searchResult.totalMatches} demonstration {searchResult.totalMatches === 1 ? 'facility' : 'facilities'}
            </span>
            <span className="text-xs md:text-sm text-[var(--color-on-surface-variant)]">
              in {searchResult.interpretation.interpretedLocation || currentLocation.displayName} (Synthetic Data)
            </span>
          </div>

          {/* Deterministic Order Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="results-order-select"
              className="font-label-sm text-xs font-semibold text-[var(--color-outline)] uppercase tracking-wider shrink-0"
            >
              Order:
            </label>
            <select
              id="results-order-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as ResultSortOrder)}
              className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-input)] text-[var(--color-on-surface)] text-xs md:text-sm font-medium py-1.5 px-2.5 rounded-[var(--radius-md)] cursor-pointer focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="proximity">Approximate distance (closest first)</option>
              <option value="freshness">Recent casualty &amp; bed updates</option>
              <option value="scheme">PM-JAY Scheme Empanelment First</option>
              <option value="alphabetical">Facility Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Result Cards List */}
        {searchResult.totalMatches > 0 ? (
          <div className="flex flex-col gap-4">
            {searchResult.hospitals.map((hospital) => (
              <HospitalResultCard
                key={hospital.id}
                hospital={hospital}
                queryContext={
                  searchResult.interpretation.interpretedSpecialty ||
                  searchResult.interpretation.rawQuery
                }
                isSaved={savedHospitalIds.includes(hospital.id)}
                isComparing={comparedHospitalIds.includes(hospital.id)}
                isCompareDisabled={comparedHospitalIds.length >= 2}
                onToggleSave={handleToggleSave}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        ) : (
          /* Empty / No Matches State */
          <EmptyState
            title="No demonstration facilities matched this search"
            description="We could not find matching synthetic records with your current search query and active filters. Try broadening your location, removing filters, or searching for a clinical specialty like Cardiology."
            action={
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleResetFilters}
                  leftIcon={<RefreshIcon size={16} />}
                >
                  Reset filters
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSearchInputVal('');
                    handleQuerySubmit('');
                  }}
                >
                  Clear search
                </Button>
              </div>
            }
          />
        )}

        {/* Mandatory Information Disclosure Banner */}
        <section className="bg-[var(--color-surface-container)]/50 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-4 flex items-start gap-3 text-xs font-body text-[var(--color-on-surface-variant)] mt-4">
          <span className="font-bold text-sm text-[var(--color-primary)]">ℹ</span>
          <div className="flex flex-col gap-1">
            <strong className="text-[var(--color-on-surface)] font-semibold">
              Healthcare Information Disclosure &amp; Demonstration Notice
            </strong>
            <p className="leading-relaxed">
              MEDIMESH is currently displaying illustrative demonstration records for user interface modeling and architectural evaluation. These records do not represent real-world clinical facilities, certifications, or emergency availability. MEDIMESH does not rank providers or provide medical diagnosis.
            </p>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          showToast(`Location set to ${loc.displayName}`);
        }}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageLoadingState message="Loading discovery results..." />}>
      <SearchResultsContent />
    </Suspense>
  );
}
