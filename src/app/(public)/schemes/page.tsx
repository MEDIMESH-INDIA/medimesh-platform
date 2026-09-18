import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { SchemeCard } from '@/features/schemes';

export const metadata: Metadata = {
  title: 'Government Schemes & Insurance Empanelment | MEDIMESH INDIA',
  description:
    'Directory of healthcare schemes including Ayushman Bharat PM-JAY, CGHS, ECHS, and state health assurance empanelments across India.',
};

export default async function SchemesPage() {
  const repo = getDefaultRepository();
  const schemes = await repo.listSchemes();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Public Health Programs
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              Documented Empanelment Records
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Government Health Schemes & Insurance
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Browse public health assurance schemes and empaneled healthcare network facilities.
            MEDIMESH displays verified and facility-reported participation separately.
            MEDIMESH does not evaluate patient eligibility, guarantee package coverage, or process cashless claims.
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
