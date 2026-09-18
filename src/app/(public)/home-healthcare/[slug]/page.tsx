import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { HomeCareDetailView } from '@/features/home-healthcare';

interface HomeHealthcarePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const allFacilities = await repo.findMany();
  const homeCare = allFacilities.filter((f) => f.category === 'Home Healthcare');
  return homeCare.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: HomeHealthcarePageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const provider = await repo.findBySlug(slug);

  if (!provider) {
    return {
      title: 'Provider Not Found | MEDIMESH INDIA',
      description: 'The requested home healthcare agency profile could not be found.',
    };
  }

  return {
    title: `${provider.name} | Home Healthcare | MEDIMESH INDIA`,
    description: `Service zones, nursing and therapy offerings, and intake coordination contact for ${provider.name} in ${provider.location.city}.`,
  };
}

export default async function HomeHealthcareDetailPage({ params }: HomeHealthcarePageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const provider = await repo.findBySlug(slug);

  if (!provider) {
    notFound();
  }

  const source = await repo.getSourceById(provider.sourceId);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HomeCareDetailView provider={provider} source={source} />
      </main>
      <Footer />
    </div>
  );
}
