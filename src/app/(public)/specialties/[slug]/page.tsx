import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { SpecialtyDetailView } from '@/features/specialties';

interface SpecialtyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const specialties = await repo.listSpecialties();
  return specialties.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: SpecialtyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const specialty = await repo.getSpecialtyBySlug(slug);

  if (!specialty) {
    return {
      title: 'Specialty Not Found | MEDIMESH INDIA',
      description: 'The requested specialty could not be found.',
    };
  }

  return {
    title: `${specialty.name} | Medical Specialties | MEDIMESH INDIA`,
    description: specialty.description || `Discover facilities and specialists providing ${specialty.name} services.`,
  };
}

export default async function SpecialtyDetailPage({ params }: SpecialtyPageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const specialty = await repo.getSpecialtyBySlug(slug);

  if (!specialty) {
    notFound();
  }

  const allFacilities = await repo.findMany();
  // Filter facilities offering this specialty
  const matchingFacilities = [];
  for (const fac of allFacilities) {
    const rels = await repo.getFacilitySpecialties(fac.id);
    if (rels.some((r) => r.specialtyId === specialty.id && !r.isArchived)) {
      matchingFacilities.push(fac);
    }
  }

  const doctors = await repo.getDoctorsBySpecialty(specialty.id);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SpecialtyDetailView
          specialty={specialty}
          facilities={matchingFacilities}
          doctors={doctors}
        />
      </main>
      <Footer />
    </div>
  );
}
