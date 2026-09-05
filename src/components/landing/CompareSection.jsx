import { Database, GitCompareArrows, Info, MapPin } from "lucide-react";
import { COMPARISON_ROWS } from "../../data/landingData";
import Container from "../common/Container";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const valueStyle = (value) => value === "Not provided"
  ? "text-muted-foreground italic"
  : value === "Listed" || value === "Listed in demo"
    ? "text-primary"
    : "text-foreground";

export default function CompareSection() {
  return (
    <Section id="compare" className="relative overflow-hidden border-y border-border/70 py-24 md:py-36" background="muted">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="05 / Compare"
            title="See the difference—without a winner."
            description="Put the same fields side by side. MEDIMESH keeps facts, gaps, and source context visible so the decision remains yours."
            alignment="center"
            className="mx-auto max-w-3xl"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_80px_rgba(15,40,35,0.08)]">
            <div className="flex flex-col gap-3 border-b border-border bg-white/75 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-primary/10 text-primary"><GitCompareArrows className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs font-bold">Side-by-side record view</p>
                  <p className="text-[10px] text-muted-foreground">The same comparison fields for each option</p>
                </div>
              </div>
              <span className="w-fit rounded-[9px] border border-primary/15 bg-primary/[0.07] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-primary">Illustrative comparison</span>
            </div>

            <div className="overflow-x-auto" tabIndex="0" aria-label="Scrollable illustrative hospital comparison">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">Illustrative comparison of two fictional demonstration hospitals</caption>
                <thead>
                  <tr className="border-b border-border bg-[#fdfbf7]">
                    <th scope="col" className="w-[28%] px-6 py-6 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Compare field</th>
                    <th scope="col" className="w-[36%] border-l border-border px-6 py-6">
                      <p className="text-base font-bold tracking-[-0.02em]">Harbourview Medical Centre</p>
                      <span className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground"><MapPin className="h-3 w-3" />Vashi · fictional record</span>
                    </th>
                    <th scope="col" className="w-[36%] border-l border-border px-6 py-6">
                      <p className="text-base font-bold tracking-[-0.02em]">NaviCare Multispeciality</p>
                      <span className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground"><MapPin className="h-3 w-3" />Nerul · fictional record</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-border/80 transition-colors last:border-b-0 hover:bg-surface-elevated/35">
                      <th scope="row" className="px-6 py-4 text-xs font-bold text-foreground">{row.label}</th>
                      <td className={`border-l border-border px-6 py-4 text-xs font-semibold ${valueStyle(row.first)}`}>{row.first}</td>
                      <td className={`border-l border-border px-6 py-4 text-xs font-semibold ${valueStyle(row.second)}`}>{row.second}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border bg-surface-elevated/45 px-5 py-4 text-[10px] font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-primary" />Listed means present only in this fictional demonstration record.</span>
              <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-primary" />Demonstration dataset · not live healthcare information</span>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
