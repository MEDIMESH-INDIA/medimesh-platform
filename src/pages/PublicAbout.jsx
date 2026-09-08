import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Scale,
  Database,
  Building2,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Container from '../components/common/Container';
import FrostedPanel from '../components/common/FrostedPanel';
import Button from '../components/common/Button';

export default function PublicAbout() {
  const pillars = [
    {
      icon: Search,
      title: 'Structured Discovery',
      description: 'Find healthcare facilities and specialists by verified clinical departments, emergency capability, and geographic proximity—without algorithm manipulation.',
    },
    {
      icon: Scale,
      title: 'Direct Side-by-Side Comparison',
      description: 'Compare facilities on factual parameters: licensed beds, ICU units, trauma readiness, diagnostics, and municipal council accreditations.',
    },
    {
      icon: Database,
      title: 'Absolute Source Transparency',
      description: 'Every record cites its exact authority—whether from municipal corporation records, state councils, or verified hospital administration filings.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Pay-for-Rank Advertising',
      description: 'Commercial sponsorships do not influence hospital visibility. What patients see reflects real healthcare capacity, not marketing budgets.',
    },
  ];

  const milestones = [
    {
      label: 'Phase 1: Maharashtra Index',
      status: 'Active Index',
      details: 'Comprehensive canonical dataset covering private and public hospitals across Maharashtra nodes with verified beds, emergency status, and locations.',
    },
    {
      label: 'Phase 2: Physician Credentialing',
      status: 'In Deployment',
      details: 'Direct council registration verification for consulting physicians and surgical specialists linked to accredited institutional facilities.',
    },
    {
      label: 'Phase 3: Metropolitan Expansion',
      status: 'Upcoming',
      details: 'Extending verified catalog coverage across the Mumbai Metropolitan Region (MMR), Pune, and wider Maharashtra healthcare ecosystems.',
    },
  ];

  return (
    <div className="py-8 sm:py-10">
      <Container>
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3 max-w-[720px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              Civic Digital Healthcare Infrastructure
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-serif font-bold text-foreground tracking-tight">
              Rebuilding Trust in Healthcare Discovery
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              MEDIMESH was created to solve one of India&apos;s most critical healthcare bottlenecks: the absence of authoritative, unbiased, and structured information when patients need emergency or specialized care.
            </p>
          </div>

          {/* Problem & Solution Statement */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-5 sm:p-7 border-border/80 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                The Healthcare Information Gap in India
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When a medical emergency occurs, patients and families face fragmented directory listings, outdated phone numbers, unverified bed counts, and commercial search engines prioritizing sponsored healthcare chains. There is rarely a way to reliably determine which hospital actually has 24/7 trauma care, operational ICU beds, or specific surgical capabilities.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-4 border-t border-border/60">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Commercial Aggregator Flaws
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Pay-for-placement search order</li>
                  <li>• Unverified anonymous star reviews</li>
                  <li>• Speculative or hallucinated bed numbers</li>
                  <li>• Opaque clinical outcomes and claim rates</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  The MEDIMESH Civic Approach
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Grounded in official municipal gazettes &amp; seeds</li>
                  <li>• Authoritative licensed bed and ICU declarations</li>
                  <li>• Transparent provenance citation on every profile</li>
                  <li>• Factual absence: unknown attributes marked as &ldquo;Not provided&rdquo;</li>
                </ul>
              </div>
            </div>
          </FrostedPanel>

          {/* Core Pillars */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Built on Four Core Principles
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Engineering digital public goods with institutional accountability.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {pillars.map(pillar => (
                <FrostedPanel key={pillar.title} variant="elevated" className="rounded-[20px] p-6 sm:p-7 space-y-3 border-border/80">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </FrostedPanel>
              ))}
            </div>
          </div>

          {/* Regional Scope & Roadmap */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-5 sm:p-7 border-border/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Regional Scope &amp; Expansion
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Expanding systematically across urban civic jurisdictions.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 w-fit">
                Maharashtra Pilot Active
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {milestones.map((m, idx) => (
                <div key={m.label} className="p-4 rounded-xl bg-surface border border-border/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary font-mono">0{idx + 1}</span>
                      <h4 className="text-sm font-semibold text-foreground">{m.label}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.details}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white border border-border/60 text-foreground shrink-0 self-start">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </FrostedPanel>

          {/* Stakeholder Network Section */}
          <div className="grid sm:grid-cols-3 gap-6">
            <FrostedPanel variant="elevated" className="rounded-[20px] p-6 border-border/80 space-y-3">
              <HeartPulse className="w-8 h-8 text-primary" />
              <h3 className="font-serif font-semibold text-base text-foreground">For Patients</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Objective comparisons, emergency trauma locations, and verified services without commercial noise.
              </p>
              <Link to="/discover" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2">
                Discover hospitals &rarr;
              </Link>
            </FrostedPanel>

            <FrostedPanel variant="elevated" className="rounded-[20px] p-6 border-border/80 space-y-3">
              <Stethoscope className="w-8 h-8 text-primary" />
              <h3 className="font-serif font-semibold text-base text-foreground">For Doctors</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Showcase verified qualifications, council licenses, and accredited hospital affiliations with zero pay-to-rank bias.
              </p>
              <Link to="/for-doctors" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2">
                Physician network &rarr;
              </Link>
            </FrostedPanel>

            <FrostedPanel variant="elevated" className="rounded-[20px] p-6 border-border/80 space-y-3">
              <Building2 className="w-8 h-8 text-primary" />
              <h3 className="font-serif font-semibold text-base text-foreground">For Hospitals</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage licensed bed capacities, specialty service catalogs, and accredited medical staff with full audit trails.
              </p>
              <Link to="/for-hospitals" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2">
                Hospital portal &rarr;
              </Link>
            </FrostedPanel>
          </div>

          {/* Product mission callout */}
          <FrostedPanel variant="elevated" className="rounded-[28px] p-8 border-border/80 bg-gradient-to-br from-primary/5 via-surface to-surface text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Source-aware public infrastructure
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Open Digital Public Good
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              MEDIMESH is a healthcare information product exploring how traceable public data can improve citizen access, care navigation, and institutional accountability across India.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Button as={Link} to="/discover" className="gap-2 text-sm font-semibold px-6 py-3">
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </FrostedPanel>
        </div>
      </Container>
    </div>
  );
}
