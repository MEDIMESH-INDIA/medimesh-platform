import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { SchemeDetailView } from '@/features/schemes';

interface SchemePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const schemes = await repo.listSchemes();
  return schemes.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: SchemePageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const scheme = await repo.findSchemeBySlug(slug);

  if (!scheme) {
    return {
      title: 'Scheme Not Found | MEDIMESH INDIA',
      description: 'The requested healthcare scheme could not be found.',
    };
  }

  return {
    title: `${scheme.code} — ${scheme.name} | MEDIMESH INDIA`,
    description: `Empaneled healthcare facilities and hospital network records for ${scheme.name} (${scheme.code}).`,
  };
}

export default async function SchemeDetailPage({ params }: SchemePageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const scheme = await repo.findSchemeBySlug(slug);

  if (!scheme) {
    notFound();
  }

  const allFacilities = await repo.findMany();

  // Collect facility relations for this scheme
  const facilityRelations = [];
  for (const fac of allFacilities) {
    const rels = await repo.getFacilitySchemes(fac.id);
    for (const rel of rels) {
      if (rel.schemeId === scheme.id && !rel.isArchived) {
        facilityRelations.push({
          relation: rel,
          facility: fac,
        });
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SchemeDetailView scheme={scheme} facilityRelations={facilityRelations} />
      </main>
      <Footer />
    </div>
  );
}
