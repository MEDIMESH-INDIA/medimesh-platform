import {
  ArrowDown,
  CheckCircle2,
  Database,
  FileQuestion,
  GitCompareArrows,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Container from "../common/Container";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const FRAGMENTED_SOURCES = [
  "Search results",
  "Hospital websites",
  "Public portals",
  "Directories",
  "Referral information",
  "Scheme lists",
];

const CORE_CAPABILITIES = [
  { title: "Data organization", desc: "Structured ontology & entity mapping" },
  { title: "Standardized fields", desc: "Common clinical & facility schema" },
  { title: "Source attribution", desc: "Transparent record provenance" },
  { title: "Missing info handling", desc: "Explicit blanks, never assumed zero" },
];

const STRUCTURED_OUTCOMES = [
  { label: "Discover", icon: Search, desc: "Need-first lookup" },
  { label: "Filter", icon: SlidersHorizontal, desc: "Visible criteria" },
  { label: "Compare", icon: GitCompareArrows, desc: "Equal side-by-side" },
  { label: "Understand", icon: Sparkles, desc: "Contextual clarity" },
];

export default function ProblemSection() {
  return (
    <Section id="problem" className="relative overflow-hidden border-b border-border/70 py-24 md:py-32" background="muted">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="01 / The challenge"
            title="Finding healthcare is easy. Understanding it isn't."
            description="Important information sits across disconnected sources, in different formats and with different levels of context. People are left to reconcile it themselves."
            className="mb-0 max-w-xl"
          />
          <div className="mt-8 flex items-start gap-3 border-l-2 border-primary/30 pl-4">
            <FileQuestion className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              The problem is not a lack of information. It is the work required to make that information comparable.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {/* Flowchart Container */}
          <div className="relative overflow-hidden rounded-[26px] border border-border bg-[#fdfbf7]/85 p-3.5 shadow-[0_20px_60px_rgba(15,40,35,0.06)] backdrop-blur-sm sm:rounded-[32px] sm:p-6">
            {/* Background Texture */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(10,122,106,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,122,106,0.045)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative flex flex-col items-center">
              {/* Level 1: Fragmented Healthcare Sources */}
              <div className="w-full">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                    <span className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">
                      Fragmented Healthcare Sources
                    </span>
                  </div>
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[8.5px] font-bold text-amber-800">
                    Disparate & Inconsistent
                  </span>
                </div>

                <div className="rounded-2xl border border-dashed border-border/90 bg-white/60 p-2.5 sm:p-3 shadow-2xs">
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
                    {FRAGMENTED_SOURCES.map((source) => (
                      <div
                        key={source}
                        className="flex items-center justify-center rounded-lg border border-border/80 bg-white/95 px-2 py-1.5 text-center shadow-2xs"
                      >
                        <span className="truncate text-[10.5px] font-medium text-foreground/80 sm:text-xs">
                          {source}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connector 1: Ingest & Normalize */}
              <div className="flex flex-col items-center py-1 sm:py-1.5">
                <div className="h-2.5 w-px bg-primary/40 sm:h-3" />
                <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary shadow-2xs sm:gap-1.5 sm:text-[8.5px]">
                  <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span>Ingest & Normalize</span>
                </div>
                <div className="h-2.5 w-px bg-primary/40 sm:h-3" />
              </div>

              {/* Level 2: Central Highlighted MEDIMESH Information Layer */}
              <div className="relative w-full rounded-[20px] border-2 border-primary/45 bg-white p-3 shadow-[0_12px_36px_rgba(10,122,106,0.1)] sm:rounded-[22px] sm:p-4">
                <div className="mb-2.5 flex items-center justify-between border-b border-primary/15 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-white shadow-2xs">
                      <Database className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-wider text-primary sm:text-[8.5px]">
                        Core Architecture
                      </span>
                      <h4 className="text-xs font-bold text-foreground sm:text-sm">
                        MEDIMESH Information Layer
                      </h4>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-primary sm:text-[8.5px]">
                    Structured Core
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {CORE_CAPABILITIES.map((cap) => (
                    <div
                      key={cap.title}
                      className="flex flex-col justify-between rounded-lg border border-primary/15 bg-primary/[0.03] p-1.5 sm:rounded-xl sm:p-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />
                        <span className="text-[10.5px] font-bold text-foreground leading-tight sm:text-xs">
                          {cap.title}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[8.5px] text-muted-foreground leading-normal sm:text-[9.5px]">
                        {cap.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector 2: Structured Access */}
              <div className="flex flex-col items-center py-1 sm:py-1.5">
                <div className="h-2.5 w-px bg-primary/40 sm:h-3" />
                <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary shadow-2xs sm:gap-1.5 sm:text-[8.5px]">
                  <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span>Structured Access</span>
                </div>
                <div className="h-2.5 w-px bg-primary/40 sm:h-3" />
              </div>

              {/* Level 3: Structured Healthcare Information */}
              <div className="w-full">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">
                      Structured Healthcare Information
                    </span>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8.5px] font-bold text-emerald-800">
                    Comparable & Verified
                  </span>
                </div>

                <div className="rounded-2xl border border-border bg-white/70 p-2.5 sm:p-3 shadow-2xs">
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
                    {STRUCTURED_OUTCOMES.map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col items-center justify-center rounded-lg border border-primary/15 bg-white p-2 text-center shadow-2xs transition-shadow sm:rounded-xl sm:p-2.5"
                      >
                        <div className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-primary mb-1">
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[11px] font-bold text-foreground sm:text-xs">
                          {item.label}
                        </span>
                        <span className="text-[8.5px] text-muted-foreground sm:text-[9px]">
                          {item.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
