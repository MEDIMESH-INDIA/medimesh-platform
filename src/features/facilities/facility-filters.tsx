'use client';

import React from 'react';
import { SearchIcon, CloseIcon } from '@/components/global/icons';

export interface FacilityFiltersState {
  search: string;
  category: string;
  city: string;
}

export interface FacilityFiltersProps {
  filters: FacilityFiltersState;
  onChange: (filters: FacilityFiltersState) => void;
  availableCities?: string[];
  availableCategories?: string[];
  totalCount: number;
}

export function FacilityFilters({
  filters,
  onChange,
  availableCities = ['All Cities', 'Bengaluru', 'Pune', 'Mumbai', 'New Delhi'],
  availableCategories = [
    'All Categories',
    'Hospital',
    'Clinic',
    'Diagnostic/Laboratory',
    'Pharmacy',
    'Home Healthcare',
    'Emergency/Critical Care',
  ],
  totalCount,
}: FacilityFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, category: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, city: e.target.value });
  };

  const handleClear = () => {
    onChange({ search: '', category: 'All Categories', city: 'All Cities' });
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'All Categories' ||
    filters.city !== 'All Cities';

  return (
    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Field */}
        <div className="md:col-span-6 relative">
          <label htmlFor="facility-search" className="sr-only">
            Search facilities
          </label>
          <div className="relative">
            <SearchIcon
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]"
            />
            <input
              id="facility-search"
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by facility name, locality, or services..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] text-sm text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        {/* Category Select */}
        <div className="md:col-span-3">
          <label htmlFor="facility-category" className="sr-only">
            Category
          </label>
          <select
            id="facility-category"
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer"
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* City Select */}
        <div className="md:col-span-3">
          <label htmlFor="facility-city" className="sr-only">
            City
          </label>
          <select
            id="facility-city"
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
      </div>

      {/* Filter Summary and Clear */}
      <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-on-surface-variant)] pt-1 border-t border-[var(--color-border-subtle)]">
        <span className="font-medium">
          Showing <strong className="text-[var(--color-on-surface)]">{totalCount}</strong> facilities
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
