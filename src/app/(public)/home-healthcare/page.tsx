import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { HomeCareCard } from '@/features/home-healthcare';
import { InfoIcon } from '@/components/global/icons';

export const metadata: Metadata = {
  title: 'Home Healthcare & Rehabilitation Services | MEDIMESH INDIA',
  description:
    'Directory of sourced home nursing, physiotherapy, elder assistance, and post-discharge rehabilitation care agencies across India.',
};

export default async function HomeHealthcarePage() {
  const repo = getDefaultRepository();
  const allFacilities = await repo.findMany();
  const homeCareProviders = allFacilities.filter((f) => f.category === 'Home Healthcare');

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Info Banner */}
        <div className="rounded-[var(--radius-xl)] p-5 md:p-6 bg-[var(--color-surface-container-high)] border border-[var(--color-border-default)] flex items-start gap-4">
          <InfoIcon size={22} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs md:text-sm text-[var(--color-on-surface-variant)]">
            <span className="font-bold text-[var(--color-on-surface)]">
              Home Healthcare Directory Advisory
            </span>
            <span>
              MEDIMESH indexes verified agency contact details for informational reference only.
              Clinical nursing services, home therapy, and medical orders must be coordinated under the direct supervision of the patient&apos;s attending physician.
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Home Health Services
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              Post-Acute & Rehabilitation Support
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Home Healthcare & Rehabilitation
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Locate home care agencies providing qualified nursing visits, bedside elder assistance,
            post-surgical wound management, and home physiotherapy programs.
          </p>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeCareProviders.map((provider) => (
            <HomeCareCard key={provider.id} provider={provider} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
