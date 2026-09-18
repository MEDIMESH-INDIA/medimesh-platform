'use client';

import React, { useState, useMemo } from 'react';
import type { TariffRowData } from '@/features/tariffs';
import { TariffTable, TariffFilters, type TariffFiltersState } from '@/features/tariffs';

export function TariffsDirectory({
  initialTariffs,
}: {
  initialTariffs: TariffRowData[];
}) {
  const [filters, setFilters] = useState<TariffFiltersState>({
    search: '',
    city: 'All Cities',
    includeExpired: true,
  });

  const cities = useMemo(() => {
    const set = new Set<string>();
    initialTariffs.forEach(({ facility }) => {
      if (facility?.location.city) set.add(facility.location.city);
    });
    return ['All Cities', ...Array.from(set).sort()];
  }, [initialTariffs]);

  const filteredTariffs = useMemo(() => {
    const now = new Date();
    return initialTariffs.filter(({ tariff, facility, service }) => {
      // Expired filter
      const isExpired =
        tariff.isArchived ||
        tariff.workflowStatus === 'ARCHIVED' ||
        (tariff.effectiveTo && new Date(tariff.effectiveTo) < now);

      if (!filters.includeExpired && isExpired) {
        return false;
      }

      // City filter
      if (filters.city !== 'All Cities' && facility?.location.city !== filters.city) {
        return false;
      }

      // Search filter
      if (filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesService = service?.name.toLowerCase().includes(q) ?? false;
        const matchesNotes = tariff.notes?.toLowerCase().includes(q) ?? false;
        const matchesFac = facility?.name.toLowerCase().includes(q) ?? false;
        const matchesUnit = tariff.unit.toLowerCase().includes(q);
        if (!matchesService && !matchesNotes && !matchesFac && !matchesUnit) {
          return false;
        }
      }

      return true;
    });
  }, [initialTariffs, filters]);

  return (
    <div className="flex flex-col gap-6">
      <TariffFilters
        filters={filters}
        onChange={setFilters}
        availableCities={cities}
        totalCount={filteredTariffs.length}
      />

      {filteredTariffs.length > 0 ? (
        <TariffTable tariffs={filteredTariffs} />
      ) : (
        <div className="p-12 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-container-low)] flex flex-col items-center gap-3">
          <p className="font-headline-sm text-base font-bold text-[var(--color-on-surface)]">
            No tariff items match your current filters
          </p>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
            Try adjusting your search criteria or enabling historical schedules.
          </p>
        </div>
      )}
    </div>
  );
}
