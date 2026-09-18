import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { EmergencyDirectoryView } from '@/features/availability';

export const metadata: Metadata = {
  title: 'Emergency & Critical Care Discovery | MEDIMESH INDIA',
  description:
    'Urgent care reference directory: Casualty intake units, trauma centers, and ICU capacity across hospitals. For life-threatening emergencies, call 112 or 108 immediately.',
};

export default async function EmergencyDiscoveryPage() {
  const repo = getDefaultRepository();
  const allFacilities = await repo.findMany();

  // Filter facilities with emergency or hospital or critical care profile
  const emergencyFacilities = [];
  for (const fac of allFacilities) {
    if (fac.category === 'Hospital' || fac.category === 'Emergency/Critical Care') {
      const profile = await repo.getProfileByFacilityId(fac.id);
      const availability = await repo.getLatest(fac.id, 'CASUALTY_INTAKE');
      emergencyFacilities.push({
        facility: fac,
        profile,
        availability,
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <EmergencyDirectoryView facilities={emergencyFacilities} />
      </main>
      <Footer />
    </div>
  );
}
