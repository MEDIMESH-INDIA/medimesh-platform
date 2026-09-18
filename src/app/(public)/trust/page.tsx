import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/global/navigation';
import { Footer } from '@/components/global/footer';
import {
  ShieldIcon,
  InfoIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@/components/global/icons';
import { StatusBadge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';

export const metadata: Metadata = {
  title: 'Trust Center & Verification Standards | MEDIMESH INDIA 2.0',
  description:
    'Comprehensive documentation of MEDIMESH source provenance, editorial review workflows, verification taxonomy, and public correction standards.',
};

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface,#faf8ff)]">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 py-8 md:py-14 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-xs font-semibold self-center">
            <ShieldIcon size={16} />
            <span>MEDIMESH INDIA 2.0 Trust Architecture</span>
          </div>

          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-on-surface)]">
            Trust, Provenance &amp; Verification Standards
          </h1>

          <p className="font-body text-sm md:text-base text-[var(--color-on-surface-variant)] leading-relaxed">
            MEDIMESH is an independent healthcare information discovery platform engineered for transparent, sourced healthcare information in India. We believe transparent attribution and clear verification boundaries are essential for reliable public health discovery.
          </p>
        </section>

        {/* Core Architectural Invariant Banner */}
        <div className="p-5 md:p-6 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] shadow-[var(--shadow-sm)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldIcon size={22} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-sm md:text-base text-[var(--color-on-surface)]">
                What &ldquo;MEDIMESH Verified&rdquo; Means — And What It Does Not Mean
              </span>
              <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                <strong>Documentation Review Only:</strong> MEDIMESH verification confirms that an entry has been reviewed against documented source records and institutional disclosures. It does <strong>not</strong> constitute a clinical endorsement, medical suitability assessment, regulatory accreditation, government certification, or hospital ranking score.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <Link href="/facilities">
              <Button variant="outline" size="sm">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 1: Canonical Data Sources Taxonomy */}
        <section id="sources" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-[var(--color-border-default)] pb-3">
            <span className="font-label-sm text-xs uppercase font-bold text-[var(--color-primary)] tracking-wider">
              Data Taxonomy
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
              Canonical Source Categories
            </h2>
            <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)]">
              Every data point in the MEDIMESH directory attaches to a structured <code className="font-mono text-xs">SourceProvenance</code> record identifying its authoritative origin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] shadow-[var(--shadow-xs)] flex flex-col gap-2.5">
              <span className="font-label-sm text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                GOVERNMENT_PUBLICATION
              </span>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Official Government Health Publications
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                National Health Systems Resource Centre (NHSRC), Ministry of Health and Family Welfare (MoHFW) circulars, state gazette notifications, and published district healthcare profiles.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] shadow-[var(--shadow-xs)] flex flex-col gap-2.5">
              <span className="font-label-sm text-xs font-bold text-blue-700 uppercase tracking-wider">
                PUBLIC_REGISTRY
              </span>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Public Statutory Registries
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                National Medical Commission (NMC) public register, State Medical Councils, Clinical Establishments Act state portals, and official professional licensing registers.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] shadow-[var(--shadow-xs)] flex flex-col gap-2.5">
              <span className="font-label-sm text-xs font-bold text-teal-700 uppercase tracking-wider">
                OFFICIAL_SCHEME_SOURCE
              </span>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Assurance Scheme Empanelment Portals
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Ayushman Bharat PM-JAY hospital empanelment databases, Central Government Health Scheme (CGHS) listings, ECHS portals, and State Health Assurance Society registries.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] shadow-[var(--shadow-xs)] flex flex-col gap-2.5">
              <span className="font-label-sm text-xs font-bold text-indigo-700 uppercase tracking-wider">
                FACILITY_REPORTED
              </span>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Facility-Reported Information
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Direct disclosures submitted by authorized institutional administrators, verified against institutional letterheads, official domains, or physical premises noticeboards.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] shadow-[var(--shadow-xs)] flex flex-col gap-2.5">
              <span className="font-label-sm text-xs font-bold text-slate-700 uppercase tracking-wider">
                PUBLIC_DOCUMENT
              </span>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Publicly Documented Records
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Official hospital tariff cards, published OPD appointment schedules, accreditation certificates (NABH/NABL), and hospital patient charters available to the public.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] shadow-[var(--shadow-xs)] flex flex-col gap-2.5">
              <span className="font-label-sm text-xs font-bold text-amber-700 uppercase tracking-wider">
                SYNTHETIC_DEMO
              </span>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Synthetic Architectural Demonstration Data
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Model records used for interface design, responsive layout testing, and architectural validation. Distinctly labeled with demonstration disclaimers to prevent confusion.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Verification States */}
        <section id="verification" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-[var(--color-border-default)] pb-3">
            <span className="font-label-sm text-xs uppercase font-bold text-[var(--color-primary)] tracking-wider">
              Review Status
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
              Verification State Taxonomy
            </h2>
            <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)]">
              Every facility, doctor profile, specialty relation, tariff, and availability report carries an explicit, immutable verification indicator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 md:p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex items-start gap-4">
              <StatusBadge verification="MEDIMESH_VERIFIED" size="md" className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  MEDIMESH Verified
                </span>
                <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  Information cross-referenced and confirmed against relevant documentary source evidence and verified provenance records.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex items-start gap-4">
              <StatusBadge verification="FACILITY_REPORTED" size="md" className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  Facility Reported
                </span>
                <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  Information reported directly by the healthcare facility or its administrative staff. Published transparently while independent documentary cross-check is underway.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex items-start gap-4">
              <StatusBadge verification="PUBLIC_SOURCE" size="md" className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  Public Source
                </span>
                <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  Data sourced from open government portals, state gazettes, or public registries without direct facility confirmation.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex items-start gap-4">
              <StatusBadge verification="PENDING_VERIFICATION" size="md" className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  Pending Verification
                </span>
                <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  Newly staged record or recent update submitted by public users or administrators currently queued for editorial evaluation.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex items-start gap-4">
              <StatusBadge verification="NOT_CONFIRMED" size="md" className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  Not Confirmed
                </span>
                <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  Secondary observation or historical entry where authoritative confirmation has not yet been established.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex items-start gap-4">
              <StatusBadge verification="UNABLE_TO_VERIFY" size="md" className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  Unable to Verify
                </span>
                <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  Documentary review concluded without conclusive supporting evidence; entry remains flagged or archived to maintain discovery integrity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Freshness & Temporal Tracking */}
        <section id="freshness" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-[var(--color-border-default)] pb-3">
            <span className="font-label-sm text-xs uppercase font-bold text-[var(--color-primary)] tracking-wider">
              Temporal Currency
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
              Freshness &amp; Time-Sensitive Observations
            </h2>
            <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)]">
              Healthcare operational realities change rapidly. MEDIMESH tracks explicit observation timestamps and enforces freshness thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--color-primary)]">
                <ClockIcon size={18} />
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  Observed vs Published
                </span>
              </div>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Availability indicators store exact observation timestamps (<code className="font-mono text-[11px]">observedAt</code>). Observations older than 48 hours are automatically flagged as needing update.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--color-tertiary)]">
                <InfoIcon size={18} />
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  No Emergency Guarantees
                </span>
              </div>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Critical care and bed availability tracking represents point-in-time observations. Users must always verify intake status directly with the facility triage counter before travel.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-teal-700">
                <CheckCircleIcon size={18} />
                <span className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                  Periodic Audit Schedule
                </span>
              </div>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Tariff packages, scheme empanelment tiers, and OPD consultation hours undergo periodic review against facility circulars and scheme announcements.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Public Correction Workflow */}
        <section id="corrections" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-[var(--color-border-default)] pb-3">
            <span className="font-label-sm text-xs uppercase font-bold text-[var(--color-primary)] tracking-wider">
              Correction Workflow
            </span>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-on-surface)]">
              Public Correction &amp; Editorial Verification Workflow
            </h2>
            <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)]">
              Anyone with an authenticated account can report a factual inaccuracy on any published healthcare record. Here is how reports are processed:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Authenticated Report
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                User signs in to report an inaccuracy on an approved descriptive field (phone, operating hours, bed capacity, tariff rate). Submitter identity is recorded for accountability.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Snapshot Capture
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                The current published value and revision identifier are frozen with the submission. Zero mutation occurs on published directory data at this stage.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Documentary Review
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Our editorial review desk evaluates the reported discrepancy against facility circulars, reception noticeboards, or public registration references.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Clarification Requests
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                If evidence is incomplete, the report moves to <code className="font-mono text-xs">NEEDS_INFORMATION</code>. The submitter is notified and can append additional documentation through their account activity screen.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Concurrency Protection
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Before applying any change, the target record&apos;s current revision is verified. If newer published information has been applied in the interim, the change is paused to prevent overwriting.
              </p>
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] flex flex-col gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                6
              </div>
              <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                Atomic Acceptance
              </h3>
              <p className="font-body text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Upon acceptance, a canonical <code className="font-mono text-xs">SourceProvenance</code> record and new <code className="font-mono text-xs">RecordRevision</code> are created as one atomic transaction, and the submitter is notified.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Strict Platform Invariants */}
        <section id="invariants" className="p-6 md:p-8 rounded-[var(--radius-xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ShieldIcon size={20} className="text-[var(--color-primary)]" />
            <h2 className="font-heading text-lg md:text-xl font-bold text-[var(--color-on-surface)]">
              Strict Non-Negotiable Platform Boundaries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body text-[var(--color-on-surface-variant)] leading-relaxed">
            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-subtle)] flex flex-col gap-1">
              <strong className="text-[var(--color-on-surface)]">Zero Rankings or Quality Scores:</strong>
              <span>
                MEDIMESH does not publish star ratings, patient satisfaction scores, &ldquo;top hospital&rdquo; lists, or clinical excellence rankings. All healthcare institutions are presented neutrally according to factual verified directory attributes.
              </span>
            </div>

            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-subtle)] flex flex-col gap-1">
              <strong className="text-[var(--color-on-surface)]">Zero Clinical / Diagnostic Functions:</strong>
              <span>
                MEDIMESH does not provide medical triage, clinical diagnosis, prescription management, treatment advice, or emergency dispatch services. Discovery search terms are strictly mapped to facility and specialty capabilities.
              </span>
            </div>

            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-subtle)] flex flex-col gap-1">
              <strong className="text-[var(--color-on-surface)]">Zero Personal Health Information (PHI):</strong>
              <span>
                User accounts do not store medical records, Aadhaar numbers, diagnostic histories, prescriptions, or patient identifiers. Personalization is strictly limited to discovery bookmarks and comparison baselines.
              </span>
            </div>

            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-subtle)] flex flex-col gap-1">
              <strong className="text-[var(--color-on-surface)]">Zero Commercial Influence:</strong>
              <span>
                Listing positions are deterministic and never influenced by sponsored advertisements, commercial promotion, paid priority tiers, or affiliate arrangements with healthcare operators.
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
