'use client';

import React, { useState, useMemo } from 'react';
import type { Facility } from '@/features/data-architecture/domain';
import { FacilityCard, FacilityFilters, type FacilityFiltersState } from '@/features/facilities';

export function FacilitiesDirectory({ initialFacilities }: { initialFacilities: Facility[] }) {
  const [filters, setFilters] = useState<FacilityFiltersState>({
    search: '',
    category: 'All Categories',
    city: 'All Cities',
  });

  const filteredFacilities = useMemo(() => {
    return initialFacilities.filter((f) => {
      // Search text
      if (filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesLocality = f.location.locality?.toLowerCase().includes(q) ?? false;
        const matchesCity = f.location.city.toLowerCase().includes(q);
        const matchesDesc = f.description.toLowerCase().includes(q);
        if (!matchesName && !matchesLocality && !matchesCity && !matchesDesc) {
          return false;
        }
      }

      // Category
      if (filters.category !== 'All Categories' && f.category !== filters.category) {
        return false;
      }

      // City
      if (filters.city !== 'All Cities' && f.location.city !== filters.city) {
        return false;
      }

      return true;
    });
  }, [initialFacilities, filters]);

  return (
    <div className="flex flex-col gap-6">
      <FacilityFilters
        filters={filters}
        onChange={setFilters}
        totalCount={filteredFacilities.length}
      />

      {filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFacilities.map((fac) => (
            <FacilityCard key={fac.id} facility={fac} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-container-low)] flex flex-col items-center gap-3">
          <p className="font-headline-sm text-base font-bold text-[var(--color-on-surface)]">
            No facilities match your search criteria
          </p>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)] max-w-md">
            Try adjusting your search query, selecting a different city, or resetting your filters.
          </p>
          <button
            type="button"
            onClick={() => setFilters({ search: '', category: 'All Categories', city: 'All Cities' })}
            className="mt-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
