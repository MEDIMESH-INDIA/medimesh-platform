import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { FacilitiesDirectory } from './facilities-directory';

export const metadata: Metadata = {
  title: 'Healthcare Facilities Directory | MEDIMESH INDIA',
  description:
    'Discover hospitals, clinics, diagnostic centers, pharmacies, home healthcare, and emergency transport providers across Indian cities.',
};

export default async function FacilitiesPage() {
  const repo = getDefaultRepository();
  const facilities = await repo.findMany();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Page Title & Context */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Healthcare Directory
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              Synthetic Demo Dataset
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Healthcare Facilities
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Verified and self-reported hospitals, clinics, diagnostic imaging centres, licensed pharmacies,
            home healthcare providers, and emergency transport services across major Indian metropolitan areas.
          </p>
        </div>

        {/* Interactive Directory List with Filters */}
        <FacilitiesDirectory initialFacilities={facilities} />
      </main>
      <Footer />
    </div>
  );
}
