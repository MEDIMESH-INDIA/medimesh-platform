import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const availableFilters = [
  { group: "Location", value: "Maharashtra" },
  { group: "Specialty", value: "Cardiology" },
  { group: "Facility", value: "Critical care" },
  { group: "Hospital type", value: "Multi-specialty" },
  { group: "Source state", value: "Source visible" },
];

export default function FilterSection() {
  const [active, setActive] = useState(availableFilters.slice(0, 3));
  const reduceMotion = useReducedMotion();

  const toggleFilter = (filter) => {
    setActive((current) =>
      current.some((item) => item.group === filter.group)
        ? current.filter((item) => item.group !== filter.group)
        : [...current, filter],
    );
  };

  return (
    <Section className="relative overflow-hidden py-24 md:py-32" background="transparent">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <ScrollReveal>
          <div className="rounded-[32px] border border-white/80 bg-[#f4f1ea]/70 p-3 shadow-[0_22px_70px_rgba(15,40,35,0.07)] sm:p-5">
            <FrostedPanel variant="floating" className="rounded-[24px] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]">Filter command surface</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold tracking-[-0.025em]">Refine the record set</h3>
                </div>
                <span className="rounded-[9px] border border-border bg-white px-2 py-1 text-[9px] font-bold text-muted-foreground">{active.length} active</span>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {availableFilters.map((filter) => {
                  const selected = active.some((item) => item.group === filter.group);
                  return (
                    <button
                      key={filter.group}
                      type="button"
                      onClick={() => toggleFilter(filter)}
                      aria-pressed={selected}
                      className="flex min-h-14 items-center justify-between rounded-[13px] border border-border bg-white/70 px-3 text-left transition hover:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/35"
                    >
                      <span>
                        <span className="block text-[9px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">{filter.group}</span>
                        <span className="mt-1 block text-xs font-bold">{filter.value}</span>
                      </span>
                      <span className={selected ? "grid h-6 w-6 place-items-center rounded-lg bg-primary text-white" : "grid h-6 w-6 place-items-center rounded-lg border border-border text-muted-foreground"}>
                        {selected ? <Check className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold"><Filter className="h-3.5 w-3.5 text-primary" />Active criteria</span>
                  <button type="button" onClick={() => setActive([])} className="min-h-11 rounded-lg px-2 text-[10px] font-bold text-muted-foreground hover:bg-surface-elevated hover:text-foreground">Clear all</button>
                </div>
                <div className="flex min-h-10 flex-wrap gap-2" aria-live="polite">
                  <AnimatePresence initial={false}>
                    {active.map((filter) => (
                      <motion.button
                        key={filter.group}
                        type="button"
                        onClick={() => toggleFilter(filter)}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                        className="flex min-h-9 items-center gap-2 rounded-[11px] border border-primary/15 bg-primary/[0.07] px-2.5 text-[10px] font-bold text-primary"
                        aria-label={`Remove ${filter.value} filter`}
                      >
                        {filter.value}<X className="h-3 w-3" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  {active.length === 0 && <span className="py-2 text-xs font-medium text-muted-foreground">No filters selected</span>}
                </div>
              </div>
            </FrostedPanel>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SectionHeading
            eyebrow="04 / Filter"
            title="Narrow the field with criteria you can see."
            description="Use supported record fields—location, specialty, facility, hospital type, emergency information, and source state—to focus the search."
            className="mb-0 max-w-lg"
          />
          <p className="mt-7 max-w-md text-sm leading-6 text-muted-foreground">A missing field stays visible as “Not provided.” MEDIMESH does not silently turn unknown information into a negative result.</p>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
