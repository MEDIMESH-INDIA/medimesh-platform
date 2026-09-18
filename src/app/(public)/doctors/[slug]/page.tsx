import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { DoctorProfileView } from '@/features/doctors';

interface DoctorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const doctors = await repo.listDoctors();
  return doctors.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const docResult = await repo.getDoctorBySlug(slug);

  if (!docResult) {
    return {
      title: 'Doctor Not Found | MEDIMESH INDIA',
      description: 'The requested healthcare practitioner profile could not be found.',
    };
  }

  const { doctor, facility, specialty } = docResult;

  return {
    title: `${doctor.name} — ${doctor.title} | MEDIMESH INDIA`,
    description: `Public professional registration information and hospital affiliation for ${doctor.name} (${specialty?.name || 'Specialist'}) at ${facility?.name || 'Affiliated Hospital'}.`,
  };
}

export default async function DoctorProfilePage({ params }: DoctorPageProps) {
  const { slug } = await params;
  const repo = getDefaultRepository();
  const docResult = await repo.getDoctorBySlug(slug);

  if (!docResult) {
    notFound();
  }

  const { doctor, facility, specialty } = docResult;
  const source = await repo.getSourceById(doctor.sourceId);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <DoctorProfileView
          doctor={doctor}
          facility={facility}
          specialty={specialty}
          source={source}
        />
      </main>
      <Footer />
    </div>
  );
}
