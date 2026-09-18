import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { AmbulanceCard } from '@/features/ambulance';
import { WarningIcon } from '@/components/global/icons';

export const metadata: Metadata = {
  title: 'Ambulance & Patient Transport Directory | MEDIMESH INDIA',
  description:
    'Sourced directory of Basic Life Support (BLS) and Advanced Life Support (ALS) patient transport services. For government emergency dispatch, call 108 or 112.',
};

export default async function AmbulancesPage() {
  const repo = getDefaultRepository();
  const allFacilities = await repo.findMany();
  // Ambulance facilities have category 'Emergency/Critical Care' and 'Transport' in description or name
  const ambulances = allFacilities.filter(
    (f) =>
      f.id.startsWith('fac-amb') ||
      f.name.toLowerCase().includes('transport') ||
      f.name.toLowerCase().includes('ambulance')
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Warning Banner */}
        <div className="rounded-[var(--radius-xl)] p-5 md:p-6 bg-[var(--color-surface-container-high)] border border-[var(--color-border-default)] flex items-start gap-4">
          <WarningIcon size={22} className="text-[var(--color-tertiary)] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs md:text-sm text-[var(--color-on-surface-variant)]">
            <span className="font-bold text-[var(--color-on-surface)]">
              Directory Discovery — Not an Ambulance Dispatch Service
            </span>
            <span>
              MEDIMESH provides verified provider directories and helpline contacts only.
              MEDIMESH does not dispatch vehicles or track live GPS locations.
              For life-threatening emergencies, dial <strong>108</strong> or <strong>112</strong> immediately.
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Patient Transport
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              BLS & ALS Medical Transport
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Ambulance & Medical Transport Providers
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Discover sourced patient transport operators, inter-hospital critical transfers, and basic life support ambulances.
            Operating hours indicate &quot;Source-reported 24/7 Dispatch&quot; as submitted in facility filings.
          </p>
        </div>

        {/* Ambulance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ambulances.map((amb) => (
            <AmbulanceCard key={amb.id} ambulance={amb} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
