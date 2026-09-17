'use client';

import React, { useState } from 'react';
import { cn, formatDistance } from '@/lib/utils';
import type { UserLocation, LocationMode } from '@/types';
import { LocationIcon, MyLocationIcon, InfoIcon } from '@/components/global/icons';
import { Dialog } from '@/design-system/primitives/dialog';

export interface DistanceLabelProps {
  km: number;
  className?: string;
}

export function DistanceLabel({ km, className }: DistanceLabelProps) {
  return (
    <span
      className={cn(
        'font-numeric-data text-xs md:text-sm text-[var(--color-on-surface)] font-semibold whitespace-nowrap',
        className
      )}
      title="Estimated approximate distance based on selected reference location"
    >
      {formatDistance(km)}
    </span>
  );
}

export interface LocationIndicatorProps {
  location: UserLocation;
  onChangeClick?: () => void;
  showAccuracyNote?: boolean;
  className?: string;
}

export function LocationIndicator({
  location,
  onChangeClick,
  showAccuracyNote = true,
  className,
}: LocationIndicatorProps) {
  const getModeLabel = (mode: LocationMode) => {
    switch (mode) {
      case 'SELECTED':
        return 'Selected location';
      case 'APPROXIMATE':
        return 'Approximate area';
      case 'ACTUAL':
        return 'Device location';
      case 'NONE':
      default:
        return 'No location selected';
    }
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1.5 text-xs md:text-sm font-body">
        <LocationIcon size={16} className="text-[var(--color-primary)] shrink-0" />
        <span className="text-[var(--color-on-surface-variant)]">
          {getModeLabel(location.mode)}:
        </span>
        <span className="font-semibold text-[var(--color-on-surface)]">
          {location.displayName || 'All India'}
        </span>
        {onChangeClick && (
          <button
            type="button"
            onClick={onChangeClick}
            className="text-[var(--color-primary)] font-semibold hover:underline ml-1 cursor-pointer focus-visible:outline-none"
          >
            Change
          </button>
        )}
      </div>

      {showAccuracyNote && (
        <div className="flex items-center gap-1 text-[11px] font-body text-[var(--color-outline)]">
          <InfoIcon size={12} className="shrink-0" />
          <span>Approximate location used. Distances are estimates.</span>
        </div>
      )}
    </div>
  );
}

export interface LocationSelectorProps {
  currentLocation: UserLocation;
  onSelectLocation: (location: UserLocation) => void;
  isOpen: boolean;
  onClose: () => void;
  availableCities?: string[];
}

const DEFAULT_INDIAN_CITIES = [
  'Bengaluru, Karnataka',
  'Mumbai, Maharashtra',
  'Delhi NCR',
  'Chennai, Tamil Nadu',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh',
];

export function LocationSelector({
  currentLocation,
  onSelectLocation,
  isOpen,
  onClose,
  availableCities = DEFAULT_INDIAN_CITIES,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = availableCities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCity = (cityName: string) => {
    onSelectLocation({
      mode: 'SELECTED',
      displayName: cityName,
      city: cityName.split(',')[0],
      state: cityName.split(',')[1]?.trim(),
    });
    onClose();
  };

  const handleUseApproximate = () => {
    onSelectLocation({
      mode: 'APPROXIMATE',
      displayName: 'Bengaluru (Approximate)',
      city: 'Bengaluru',
      state: 'KA',
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Location"
      description="Distances and facility discovery are calculated relative to your selected reference point."
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Approximate option button */}
        <button
          type="button"
          onClick={handleUseApproximate}
          className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-container-low)] transition-colors text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <MyLocationIcon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
              Use approximate device location
            </span>
            <span className="font-body text-xs text-[var(--color-on-surface-variant)]">
              Estimated region only · Does not store precise GPS coordinates
            </span>
          </div>
        </button>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, district, or PIN code..."
            className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-input)] rounded-[var(--radius-md)] py-2 px-3 text-sm font-body text-[var(--color-on-surface)] placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>

        {/* City list */}
        <div className="flex flex-col divide-y divide-[var(--color-border-default)] max-h-56 overflow-y-auto">
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelectCity(city)}
              className={cn(
                'flex items-center justify-between py-2.5 px-2 text-left text-sm font-body hover:bg-[var(--color-surface-container-low)] rounded transition-colors cursor-pointer',
                currentLocation.displayName === city
                  ? 'text-[var(--color-primary)] font-semibold bg-[var(--color-surface-container-low)]'
                  : 'text-[var(--color-on-surface)]'
              )}
            >
              <span>{city}</span>
              {currentLocation.displayName === city && (
                <span className="text-xs font-label-sm text-[var(--color-primary)]">
                  Active
                </span>
              )}
            </button>
          ))}
          {filteredCities.length === 0 && (
            <p className="py-4 text-center text-xs text-[var(--color-on-surface-variant)]">
              No matching cities found. Try entering a state or district name.
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
