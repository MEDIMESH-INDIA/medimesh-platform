import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import { getDefaultRepository } from '@/features/data-architecture';
import { ServiceCard } from '@/features/services';

export const metadata: Metadata = {
  title: 'Healthcare Services & Infrastructure Capabilities | MEDIMESH INDIA',
  description:
    'Discover hospital infrastructure capabilities, critical care units, diagnostic equipment, and surgical services across Indian healthcare facilities.',
};

export default async function ServicesPage() {
  const repo = getDefaultRepository();
  const services = await repo.listServices();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold">
              Capabilities Directory
            </span>
            <span className="text-xs text-[var(--color-outline)]">
              Operational Infrastructure
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">
            Services & Medical Capabilities
          </h1>
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
            Search verified healthcare capabilities including cardiac catheterization labs, MRI diagnostics,
            dialysis units, trauma resuscitation bays, and blood banks.
            Items marked &quot;Source-reported 24/7&quot; reflect documented operational schedules subject to facility intake confirmation.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
