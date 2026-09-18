import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { AmbulanceDetailView } from '@/features/ambulance';

interface AmbulancePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const allFacilities = await repo.findMany();
  const ambulances = allFacilities.filter(
    (f) =>
      f.id.startsWith('fac-amb') ||
      f.name.toLowerCase().includes('transport') ||
      f.name.toLowerCase().includes('ambulance')
  );
  return ambulances.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: AmbulancePageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const ambulance = await repo.findBySlug(slug);

  if (!ambulance) {
    return {
      title: 'Provider Not Found | MEDIMESH INDIA',
      description: 'The requested ambulance provider profile could not be found.',
    };
  }

  return {
    title: `${ambulance.name} | Ambulance Transport | MEDIMESH INDIA`,
    description: `Directory profile for ${ambulance.name} in ${ambulance.location.city}, ${ambulance.location.state}. Non-dispatch informational reference.`,
  };
}

export default async function AmbulanceDetailPage({ params }: AmbulancePageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const ambulance = await repo.findBySlug(slug);

  if (!ambulance) {
    notFound();
  }

  const source = await repo.getSourceById(ambulance.sourceId);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AmbulanceDetailView ambulance={ambulance} source={source} />
      </main>
      <Footer />
    </div>
  );
}
