'use client';

import React, { useState, useMemo } from 'react';
import type { DoctorProfile, Facility, Specialty } from '@/features/data-architecture/domain';
import { DoctorCard } from '@/features/doctors';
import { SearchIcon, CloseIcon } from '@/components/global/icons';

export interface DoctorWithRelations {
  doctor: DoctorProfile;
  facility?: Facility;
  specialty?: Specialty;
}

export function DoctorsDirectory({
  initialDoctors,
}: {
  initialDoctors: DoctorWithRelations[];
}) {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const specialties = useMemo(() => {
    const set = new Set<string>();
    initialDoctors.forEach((d) => {
      if (d.specialty?.name) set.add(d.specialty.name);
    });
    return ['All Specialties', ...Array.from(set).sort()];
  }, [initialDoctors]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    initialDoctors.forEach((d) => {
      if (d.facility?.location.city) set.add(d.facility.location.city);
    });
    return ['All Cities', ...Array.from(set).sort()];
  }, [initialDoctors]);

  const filteredDoctors = useMemo(() => {
    return initialDoctors.filter(({ doctor, facility, specialty }) => {
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        const matchesName = doctor.name.toLowerCase().includes(q);
        const matchesTitle = doctor.title.toLowerCase().includes(q);
        const matchesQual = doctor.qualifications.toLowerCase().includes(q);
        const matchesFac = facility?.name.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesTitle && !matchesQual && !matchesFac) {
          return false;
        }
      }

      if (selectedSpecialty !== 'All Specialties' && specialty?.name !== selectedSpecialty) {
        return false;
      }

      if (selectedCity !== 'All Cities' && facility?.location.city !== selectedCity) {
        return false;
      }

      return true;
    });
  }, [initialDoctors, search, selectedSpecialty, selectedCity]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedSpecialty !== 'All Specialties' ||
    selectedCity !== 'All Cities';

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Bar */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <label htmlFor="doctor-search" className="sr-only">
              Search doctors
            </label>
            <div className="relative">
              <SearchIcon
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]"
              />
              <input
                id="doctor-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name, qualification, or hospital..."
                className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] text-sm text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="doctor-specialty" className="sr-only">
              Specialty
            </label>
            <select
              id="doctor-specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer"
            >
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="doctor-city" className="sr-only">
              City
            </label>
            <select
              id="doctor-city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-on-surface-variant)] pt-1 border-t border-[var(--color-border-subtle)]">
          <span className="font-medium">
            Showing <strong className="text-[var(--color-on-surface)]">{filteredDoctors.length}</strong> medical practitioners
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedSpecialty('All Specialties');
                setSelectedCity('All Cities');
              }}
              className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-semibold cursor-pointer"
            >
              <CloseIcon size={14} />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map(({ doctor, facility, specialty }) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              facility={facility}
              specialty={specialty}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-container-low)] flex flex-col items-center gap-3">
          <p className="font-headline-sm text-base font-bold text-[var(--color-on-surface)]">
            No doctors match your search filters
          </p>
          <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
            Try adjusting your search criteria or resetting filters.
          </p>
        </div>
      )}
    </div>
  );
}
