import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { HospitalProfileView } from '@/features/hospitals/components';
import { getHospitalBySlug, SYNTHETIC_HOSPITALS } from '@/features/hospitals';

interface HospitalPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SYNTHETIC_HOSPITALS.map((hospital) => ({
    slug: hospital.slug,
  }));
}

export async function generateMetadata({ params }: HospitalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hospital = getHospitalBySlug(slug);

  if (!hospital) {
    return {
      title: 'Facility Not Found | MEDIMESH INDIA',
      description: 'The requested healthcare facility profile could not be located in our registry.',
    };
  }

  return {
    title: `${hospital.name} (Demo Record) | MEDIMESH INDIA`,
    description: `Illustrative demo facility profile for ${hospital.name} in ${hospital.city}, ${hospital.state}. Synthetic data model demonstration for UI evaluation.`,
  };
}

export default async function HospitalProfilePage({ params }: HospitalPageProps) {
  const { slug } = await params;
  const hospital = getHospitalBySlug(slug);

  if (!hospital) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <Header
        currentLocation={{
          mode: 'SELECTED',
          displayName: `${hospital.city}, ${hospital.state}`,
          city: hospital.city,
          state: hospital.state,
        }}
      />

      {/* Hospital Profile View */}
      <main className="flex-1 pb-16">
        <HospitalProfileView hospital={hospital} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
