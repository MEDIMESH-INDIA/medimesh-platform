import { ArrowDown, Database, FileQuestion, Search } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const sources = [
  { label: "Search results", meta: "Different formats" },
  { label: "Hospital websites", meta: "Provider-led detail" },
  { label: "Public portals", meta: "Separate records" },
  { label: "Directories", meta: "Uneven fields" },
  { label: "Referrals", meta: "Personal context" },
  { label: "Scheme lists", meta: "Eligibility context" },
];

export default function ProblemSection() {
  return (
    <Section id="problem" className="relative overflow-hidden border-b border-border/70 py-24 md:py-32" background="muted">
      <Container className="grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
        <ScrollReveal>
          <SectionHeading
            eyebrow="01 / The challenge"
            title="Finding healthcare is easy. Understanding it isn't."
            description="Important information sits across disconnected sources, in different formats and with different levels of context. People are left to reconcile it themselves."
            className="mb-0 max-w-xl"
          />
          <div className="mt-8 flex items-start gap-3 border-l-2 border-primary/30 pl-4">
            <FileQuestion className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="max-w-md text-sm leading-6 text-muted-foreground">The problem is not a lack of information. It is the work required to make that information comparable.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-[#fdfbf7]/75 p-5 shadow-[0_20px_60px_rgba(15,40,35,0.06)] sm:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,122,106,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,122,106,0.045)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative grid grid-cols-2 gap-3">
              {sources.map((source, index) => (
                <FrostedPanel
                  key={source.label}
                  className={`rounded-[18px] p-3.5 sm:p-4 ${index % 3 === 1 ? "sm:translate-y-2" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full border-2 border-primary/40 bg-white" />
                    <div>
                      <p className="text-xs font-bold sm:text-sm">{source.label}</p>
                      <p className="mt-1 text-[10px] font-medium text-muted-foreground sm:text-xs">{source.meta}</p>
                    </div>
                  </div>
                </FrostedPanel>
              ))}
            </div>

            <div className="relative my-5 flex items-center justify-center gap-3">
              <span className="h-px flex-1 border-t border-dashed border-primary/25" />
              <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/15 bg-primary/10 text-primary"><ArrowDown className="h-4 w-4" /></span>
              <span className="h-px flex-1 border-t border-dashed border-primary/25" />
            </div>

            <FrostedPanel variant="elevated" className="relative rounded-[22px] border-primary/15 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary text-white"><Database className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-primary">The missing layer</p>
                  <p className="mt-1 text-sm font-bold sm:text-base">A consistent, source-aware record</p>
                </div>
                <Search className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </div>
            </FrostedPanel>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
