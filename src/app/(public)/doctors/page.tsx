import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { DoctorsDirectory } from './doctors-directory';

export const metadata: Metadata = {
  title: 'Doctor & Specialist Directory | MEDIMESH INDIA',
  description:
    'Public professional registration information and hospital affiliations for medical consultants, specialists, and physicians across India.',
};

export default async function DoctorsPage() {
  const repo = getDefaultRepository();
  const rawDoctors = await repo.listDoctors();
  const allSpecialties = await repo.listSpecialties();
  const allFacilities = await repo.findMany();

  const specialtyMap = new Map(allSpecialties.map((s) => [s.id, s]));
  const facilityMap = new Map(allFacilities.map((f) => [f.id, f]));

  const doctorsWithRelations = rawDoctors.map((doc) => ({
    doctor: doc,
    facility: facilityMap.get(doc.facilityId),
    specialty: specialtyMap.get(doc.specialtyId),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Practitioner Directory
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              Public Documentation Review Only
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Doctors & Healthcare Professionals
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Public professional registration information, where available, with source, verification state, and freshness.
            MEDIMESH verification represents provenance and public record review only. It must never imply clinical quality,
            suitability, or commercial endorsement.
          </p>
        </div>

        {/* Directory with filters */}
        <DoctorsDirectory initialDoctors={doctorsWithRelations} />
      </main>
      <Footer />
    </div>
  );
}
