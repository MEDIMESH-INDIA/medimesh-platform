import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { PharmacyCard } from '@/features/pharmacy';
import { InfoIcon } from '@/components/global/icons';

export const metadata: Metadata = {
  title: 'Licensed Retail Pharmacy Directory | MEDIMESH INDIA',
  description:
    'Find neighborhood pharmacies, dispensaries, and 24-hour retail counters across Indian cities. Non-commercial informational directory only.',
};

export default async function PharmaciesPage() {
  const repo = getDefaultRepository();
  const allFacilities = await repo.findMany();
  const pharmacies = allFacilities.filter((f) => f.category === 'Pharmacy');

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Info Banner */}
        <div className="rounded-[var(--radius-xl)] p-5 md:p-6 bg-[var(--color-surface-container-high)] border border-[var(--color-border-default)] flex items-start gap-4">
          <InfoIcon size={22} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs md:text-sm text-[var(--color-on-surface-variant)]">
            <span className="font-bold text-[var(--color-on-surface)]">
              Retail Pharmacy Directory Notice
            </span>
            <span>
              MEDIMESH does not sell, ship, or dispense medicines online. All medication must be purchased
              directly from licensed retail counters with a valid prescription where required under the Drugs and Cosmetics Rules.
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Retail Pharmacy Directory
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              Verified & Reported Chemist Shops
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Pharmacies & Retail Dispensaries
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Locate neighborhood retail pharmacies, cold-chain storage facilities, and source-reported 24/7 medicine counters across major metropolitan clusters.
          </p>
        </div>

        {/* Pharmacies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pharmacies.map((pharm) => (
            <PharmacyCard key={pharm.id} pharmacy={pharm} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
