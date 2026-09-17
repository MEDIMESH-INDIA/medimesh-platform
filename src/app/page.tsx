'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { SearchInput } from '@/components/forms/search-input';
import { LocationSelector, LocationIndicator } from '@/components/location';
import { SearchSuggestion, SearchSuggestionGroup } from '@/components/discovery';
import { Card } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import type { UserLocation } from '@/types';
import {
  HospitalIcon,
  MedicalServicesIcon,
  EmergencyIcon,
  ShieldIcon,
  ArrowForwardIcon,
} from '@/components/global/icons';

const COMMON_QUERIES = [
  'Cardiologist near me',
  'Hospitals with MRI',
  'Orthopedic hospitals in Pune',
  'PM-JAY hospitals',
  'ICU in Bengaluru',
  'Panaji hospitals',
];

const DISCOVERY_CATEGORIES = [
  {
    title: 'Hospitals & ICUs',
    description: 'Discover verified inpatient facilities, intensive care beds, and casualty units.',
    icon: <HospitalIcon size={22} className="text-[var(--color-primary)]" />,
    href: '/hospitals',
    count: '8 Demo Facilities',
  },
  {
    title: 'Clinical Specialties',
    description: 'Cardiology, Orthopedics, Neurology, Oncology, Pediatrics, and more.',
    icon: <MedicalServicesIcon size={22} className="text-[var(--color-primary)]" />,
    href: '/search?specialty=Cardiology',
    count: '9 Specialties',
  },
  {
    title: 'Government Schemes',
    description: 'Empaneled hospitals for Ayushman Bharat (PM-JAY), CGHS, and ECHS.',
    icon: <ShieldIcon size={22} className="text-[var(--color-secondary)]" />,
    href: '/search?scheme=PM-JAY',
    count: 'Empaneled Care',
  },
  {
    title: 'Emergency & Critical Care',
    description: '24/7 casualty intake status, cardiac ICUs, and advanced trauma centers.',
    icon: <EmergencyIcon size={22} className="text-[var(--color-tertiary)]" />,
    href: '/search?service=24%2F7+Emergency+Casualty',
    count: '24/7 Casualty',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<UserLocation>({
    mode: 'SELECTED',
    displayName: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    state: 'Karnataka',
  });

  const handleSearchSubmit = (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}&location=${encodeURIComponent(currentLocation.city || '')}`);
    } else {
      router.push(`/search?location=${encodeURIComponent(currentLocation.city || '')}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Global Header */}
      <Header
        currentLocation={currentLocation}
        onLocationChange={(loc) => setCurrentLocation(loc)}
        onSearchClick={() => {
          const input = document.getElementById('home-hero-search');
          input?.focus();
        }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[var(--color-surface-container-low,#f2f3ff)] to-[var(--color-background)] border-b border-[var(--color-border-default)] py-12 md:py-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col items-center text-center">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] text-xs font-semibold uppercase tracking-wider mb-5">
              <span>Healthcare Discovery Platform · Phase 03 UI Preview</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight max-w-3xl mb-4">
              Find Healthcare Facilities, Specialties &amp; Schemes
            </h1>

            {/* Subtitle */}
            <p className="font-body text-sm sm:text-base md:text-lg text-[var(--color-on-surface-variant)] max-w-2xl mb-8 leading-relaxed">
              Explore transparent healthcare discovery across India. Search by specialty, procedure, hospital name, or government health scheme without marketing bias. (Previewing with illustrative demo records).
            </p>

            {/* Prominent Search Complex */}
            <div className="w-full max-w-2xl shadow-[var(--shadow-md)] rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] p-2 mb-4">
              <SearchInput
                id="home-hero-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                onSubmitSearch={() => handleSearchSubmit()}
                placeholder="Search by symptom, specialty, procedure, or hospital name..."
                className="border-none shadow-none text-base"
              />
            </div>

            {/* Common Query Pills */}
            <div className="w-full max-w-2xl mb-6">
              <SearchSuggestionGroup label="Common Queries:">
                {COMMON_QUERIES.map((q) => (
                  <SearchSuggestion
                    key={q}
                    onClick={() => {
                      setSearchQuery(q);
                      handleSearchSubmit(q);
                    }}
                  >
                    {q}
                  </SearchSuggestion>
                ))}
              </SearchSuggestionGroup>
            </div>

            {/* Location Reference Banner */}
            <div className="inline-flex items-center gap-3 bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] px-4 py-2 rounded-[var(--radius-md)] text-xs md:text-sm">
              <LocationIndicator
                location={currentLocation}
                onChangeClick={() => setIsLocationSelectorOpen(true)}
                showAccuracyNote={false}
              />
            </div>
          </div>
        </section>

        {/* Core Discovery Categories Grid */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-[var(--color-border-default)] pb-4">
            <div>
              <span className="font-label-sm text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                Structured Directory
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
                Explore Healthcare Categories
              </h2>
            </div>
            <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] max-w-md">
              Sourced facility directories, government empanelment records, and critical care status across Indian states.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DISCOVERY_CATEGORIES.map((cat) => (
              <Link key={cat.title} href={cat.href} className="group">
                <Card className="h-full hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between">
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-surface-container)] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-base text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="font-body text-xs text-[var(--color-on-surface-variant)] mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[var(--color-border-default)]/60 flex items-center justify-between font-label-sm text-xs text-[var(--color-primary)] font-semibold mt-4">
                    <span>{cat.count}</span>
                    <ArrowForwardIcon size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Data Transparency & Non-Endorsement Notice */}
        <section className="bg-[var(--color-surface-container-low)] border-y border-[var(--color-border-default)] py-10">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto flex flex-col gap-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center mx-auto">
                <ShieldIcon size={20} />
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
                Our Verification &amp; Transparency Standard
              </h2>
              <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                MEDIMESH aggregates official healthcare data from public registries, government scheme empanelment records, and verified facility disclosures. Currently in Phase 03, all discoverable facilities are synthetic demonstration records for UI modeling. We do not accept payment to alter verification standing, provide commercial recommendations, or rank healthcare institutions.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link href="/hospitals">
                  <Button variant="primary" size="md">
                    Browse Hospital Directory
                  </Button>
                </Link>
                <Link href="/showcase">
                  <Button variant="outline" size="md">
                    Inspect Design Canvas
                  </Button>
                </Link>
              </div>
            </div>
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
        onSelectLocation={(loc) => setCurrentLocation(loc)}
      />
    </div>
  );
}
