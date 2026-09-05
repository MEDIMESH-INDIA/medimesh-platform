import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, CalendarClock, ChevronDown, Database, Eye, FileCheck2, ShieldCheck } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const provenance = [
  { label: "Hospital information", value: "Facilities + identity", icon: FileCheck2 },
  { label: "Source record", value: "Demonstration dataset", icon: Database },
  { label: "Review state", value: "Illustrative", icon: ShieldCheck },
  { label: "Last checked", value: "02 Sep 2026", icon: CalendarClock },
  { label: "MEDIMESH display", value: "Context remains visible", icon: Eye },
];

export default function TrustSection() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <Section id="trust" className="relative overflow-hidden py-24 md:py-36" background="transparent">
      <Container className="grid items-center gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <ScrollReveal>
          <SectionHeading
            eyebrow="06 / Understand"
            title="Know where the information came from."
            description="A useful healthcare record needs more than fields. It needs visible source, review, freshness, and scope context—including an honest unknown state."
            className="mb-0 max-w-xl"
          />
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 text-sm">
            <div><dt className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Language</dt><dd className="mt-1 font-bold">Source visible</dd></div>
            <div><dt className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Unknowns</dt><dd className="mt-1 font-bold">Not provided</dd></div>
            <div><dt className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Freshness</dt><dd className="mt-1 font-bold">Last checked</dd></div>
            <div><dt className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Boundary</dt><dd className="mt-1 font-bold">No trust score</dd></div>
          </dl>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative overflow-hidden rounded-[34px] border border-border bg-[#f4f1ea]/70 p-4 shadow-[0_24px_75px_rgba(15,40,35,0.07)] sm:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,122,106,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,122,106,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative">
              {provenance.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <FrostedPanel variant={index === provenance.length - 1 ? "floating" : "elevated"} className="rounded-[18px] p-3.5 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                        <div className="flex-1">
                          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                          <p className="mt-1 text-xs font-bold sm:text-sm">{item.value}</p>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-primary/50" />
                      </div>
                    </FrostedPanel>
                    {index < provenance.length - 1 && <div className="flex h-6 justify-center"><span className="h-full border-l border-dashed border-primary/35" /><ArrowDown className="-ml-2 mt-2 h-3 w-3 text-primary" /></div>}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setDetailsOpen((open) => !open)}
                aria-expanded={detailsOpen}
                className="mt-3 flex min-h-11 w-full items-center justify-between rounded-[13px] border border-border bg-white/70 px-4 text-xs font-bold transition hover:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/35"
              >
                What this status does—and does not—mean
                <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {detailsOpen && (
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden px-2 pt-3 text-xs leading-5 text-muted-foreground"
                  >
                    It describes the record&apos;s source context. It is not a clinical endorsement, quality score, certification, or guarantee of current service availability.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
