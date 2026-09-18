import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { ServiceDetailView } from '@/features/services';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const services = await repo.listServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const service = await repo.findServiceBySlug(slug);

  if (!service) {
    return {
      title: 'Service Not Found | MEDIMESH INDIA',
      description: 'The requested healthcare service or capability could not be found.',
    };
  }

  return {
    title: `${service.name} | Healthcare Services | MEDIMESH INDIA`,
    description: service.description || `Discover facilities equipped with ${service.name}.`,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const service = await repo.findServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const allFacilities = await repo.findMany();
  const matchingFacilities = [];
  for (const fac of allFacilities) {
    const rels = await repo.getFacilityServices(fac.id);
    if (rels.some((r) => r.serviceId === service.id && !r.isArchived)) {
      matchingFacilities.push(fac);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ServiceDetailView service={service} facilities={matchingFacilities} />
      </main>
      <Footer />
    </div>
  );
}
