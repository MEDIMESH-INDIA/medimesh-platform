'use client';

import React from 'react';
import { SearchIcon, CloseIcon } from '@/components/global/icons';

export interface TariffFiltersState {
  search: string;
  city: string;
  includeExpired: boolean;
}

export interface TariffFiltersProps {
  filters: TariffFiltersState;
  onChange: (filters: TariffFiltersState) => void;
  availableCities?: string[];
  totalCount: number;
}

export function TariffFilters({
  filters,
  onChange,
  availableCities = ['All Cities', 'Bengaluru', 'Pune', 'Mumbai', 'New Delhi'],
  totalCount,
}: TariffFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, city: e.target.value });
  };

  const handleToggleExpired = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, includeExpired: e.target.checked });
  };

  const handleClear = () => {
    onChange({ search: '', city: 'All Cities', includeExpired: true });
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.city !== 'All Cities' ||
    !filters.includeExpired;

  return (
    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <label htmlFor="tariff-search" className="sr-only">
            Search tariffs
          </label>
          <div className="relative">
            <SearchIcon
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]"
            />
            <input
              id="tariff-search"
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Filter by procedure, service, or hospital name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] text-sm text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        {/* City Select */}
        <div className="md:col-span-3">
          <label htmlFor="tariff-city" className="sr-only">
            City
          </label>
          <select
            id="tariff-city"
            value={filters.city}
            onChange={handleCityChange}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer"
          >
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Expired Checkbox */}
        <div className="md:col-span-3 flex items-center gap-2 pl-2">
          <input
            id="include-expired"
            type="checkbox"
            checked={filters.includeExpired}
            onChange={handleToggleExpired}
            className="w-4 h-4 rounded border-[var(--color-border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
          />
          <label
            htmlFor="include-expired"
            className="text-xs font-medium text-[var(--color-on-surface)] cursor-pointer select-none"
          >
            Include historical schedules
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-on-surface-variant)] pt-1 border-t border-[var(--color-border-subtle)]">
        <span className="font-medium">
          Showing <strong className="text-[var(--color-on-surface)]">{totalCount}</strong> tariff entries
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-semibold cursor-pointer"
          >
            <CloseIcon size={14} />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
