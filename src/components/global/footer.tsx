import React from 'react';
import Link from 'next/link';
import { SAFETY_DISCLAIMERS } from '@/types';
import { InfoIcon } from '@/components/global/icons';

export function Footer() {
  return (
    <footer className="w-full bg-[var(--color-surface-container-low,#f2f3ff)] border-t border-[var(--color-border-default)] mt-auto shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--color-border-default)]">
          {/* Brand & Platform Column */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                +
              </div>
              <span className="font-heading font-bold text-lg text-[var(--color-on-surface)] tracking-tight">
                MEDIMESH <span className="text-xs text-[var(--color-primary)] tracking-widest uppercase">INDIA</span>
              </span>
            </Link>
            <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
              A unified healthcare discovery, comparison, and navigation platform for India. Engineered for transparent, sourced healthcare information.
            </p>
          </div>

          {/* Directory Column */}
          <div className="flex flex-col gap-2 font-body text-xs md:text-sm">
            <span className="font-label-md text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1">
              Healthcare Directory
            </span>
            <Link href="/facilities" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Hospitals
            </Link>
            <Link href="/specialties" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Clinical Specialties
            </Link>
            <Link href="/doctors" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Doctors &amp; Specialists
            </Link>
            <Link href="/services" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Services &amp; Capabilities
            </Link>
            <Link href="/tariffs" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Cost Tariffs &amp; Estimates
            </Link>
          </div>

          {/* Schemes & Government Healthcare Access Column */}
          <div className="flex flex-col gap-2 font-body text-xs md:text-sm">
            <span className="font-label-md text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1">
              Schemes &amp; Access
            </span>
            <Link href="/schemes/ayushman-bharat-pmjay" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Ayushman Bharat (PM-JAY)
            </Link>
            <Link href="/schemes/cghs" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Central Govt Health Scheme (CGHS)
            </Link>
            <Link href="/schemes/echs" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Ex-Servicemen Scheme (ECHS)
            </Link>
            <Link href="/emergency" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Emergency &amp; Critical Care
            </Link>
            <Link href="/ambulances" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Ambulance Transport Directory
            </Link>
          </div>

          {/* Resources & Trust Column */}
          <div className="flex flex-col gap-2 font-body text-xs md:text-sm">
            <span className="font-label-md text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1">
              Trust &amp; Platform
            </span>
            <Link href="/trust" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Trust Center &amp; Methodology
            </Link>
            <Link href="/trust#verification" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Verification Standards
            </Link>
            <Link href="/trust#corrections" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Correction Workflow
            </Link>
            <Link href="/#help" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Help &amp; Support
            </Link>
            <Link href="/#legal" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
              Legal, Privacy &amp; Terms
            </Link>
          </div>
        </div>

        {/* Mandatory Information Disclosure Banner */}
        <div className="mt-8 bg-[var(--color-surface-container,#eaedff)]/70 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 max-w-4xl">
            <InfoIcon size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
            <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              {SAFETY_DISCLAIMERS.primaryDisclosure} MEDIMESH is an independent healthcare information and discovery platform. It is not a government regulatory authority, hospital operator, or medical diagnostic provider.
            </p>
          </div>
          <div className="font-label-sm text-xs text-[var(--color-outline)] whitespace-nowrap self-start md:self-auto">
            © {new Date().getFullYear()} MEDIMESH INDIA
          </div>
        </div>
      </div>
    </footer>
  );
}
