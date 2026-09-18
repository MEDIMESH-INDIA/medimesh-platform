import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { PharmacyDetailView } from '@/features/pharmacy';

interface PharmacyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const allFacilities = await repo.findMany();
  const pharmacies = allFacilities.filter((f) => f.category === 'Pharmacy');
  return pharmacies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PharmacyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const pharmacy = await repo.findBySlug(slug);

  if (!pharmacy) {
    return {
      title: 'Pharmacy Not Found | MEDIMESH INDIA',
      description: 'The requested pharmacy listing could not be found.',
    };
  }

  return {
    title: `${pharmacy.name} | Pharmacy Directory | MEDIMESH INDIA`,
    description: `Store location, counter timings, and verified directory information for ${pharmacy.name} in ${pharmacy.location.city}.`,
  };
}

export default async function PharmacyDetailPage({ params }: PharmacyPageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const pharmacy = await repo.findBySlug(slug);

  if (!pharmacy) {
    notFound();
  }

  const source = await repo.getSourceById(pharmacy.sourceId);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <PharmacyDetailView pharmacy={pharmacy} source={source} />
      </main>
      <Footer />
    </div>
  );
}
