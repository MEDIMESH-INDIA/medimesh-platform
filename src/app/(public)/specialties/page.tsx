import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { SpecialtyCard } from '@/features/specialties';

export const metadata: Metadata = {
  title: 'Clinical Specialties & Disciplines | MEDIMESH INDIA',
  description:
    'Browse healthcare facilities and medical specialists by clinical discipline across Cardiology, Oncology, Orthopedics, Neurology, Pediatrics, and more.',
};

export default async function SpecialtiesPage() {
  const repo = getDefaultRepository();
  const specialties = await repo.listSpecialties();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Taxonomy Directory
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              Structured Clinical Disciplines
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Medical Specialties & Departments
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Explore healthcare providers and medical departments organized by clinical taxonomy.
            This directory facilitates structured discovery and does not constitute medical triage or diagnostic advice.
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {specialties.map((spec) => (
            <SpecialtyCard key={spec.id} specialty={spec} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
