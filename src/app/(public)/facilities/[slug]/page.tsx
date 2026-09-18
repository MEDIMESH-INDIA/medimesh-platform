import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { FacilityDetailView } from '@/features/facilities';

interface FacilityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const facilities = await repo.findMany();
  return facilities.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: FacilityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const facility = await repo.findBySlug(slug);

  if (!facility) {
    return {
      title: 'Facility Not Found | MEDIMESH INDIA',
      description: 'The requested healthcare facility profile could not be located in our directory.',
    };
  }

  return {
    title: `${facility.name} (Demo Record) | MEDIMESH INDIA`,
    description: `Demonstration directory profile for ${facility.name} in ${facility.location.city}, ${facility.location.state}. Synthetic data model record.`,
  };
}

export default async function FacilityDetailPage({ params }: FacilityPageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const facility = await repo.findBySlug(slug);

  if (!facility) {
    notFound();
  }

  const profile = await repo.getProfileByFacilityId(facility.id);
  const facilitySpecialtyRels = await repo.getFacilitySpecialties(facility.id);
  const allSpecialties = await repo.listSpecialties();
  const specialties = allSpecialties.filter((s) =>
    facilitySpecialtyRels.some((rel) => rel.specialtyId === s.id && !rel.isArchived)
  );

  const facilityServiceRels = await repo.getFacilityServices(facility.id);
  const allServices = await repo.listServices();
  const services = allServices.filter((s) =>
    facilityServiceRels.some((rel) => rel.serviceId === s.id && !rel.isArchived)
  );

  const doctors = await repo.getDoctorsByFacility(facility.id);
  const tariffs = await repo.getFacilityTariffs(facility.id);
  const source = await repo.getSourceById(facility.sourceId);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header
        currentLocation={{
          mode: 'SELECTED',
          displayName: `${facility.location.city}, ${facility.location.state}`,
          city: facility.location.city,
          state: facility.location.state,
        }}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <FacilityDetailView
          facility={facility}
          profile={profile}
          specialties={specialties}
          services={services}
          doctors={doctors}
          tariffs={tariffs}
          source={source}
        />
      </main>
      <Footer />
    </div>
  );
}
