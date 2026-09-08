import { Bookmark, Building2, GitCompareArrows, LayoutDashboard, MapPin, Search, SlidersHorizontal } from "lucide-react";
import Container from "../common/Container";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import SpotlightCard from "../react-bits/SpotlightCard";

const sideNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Discover", icon: Search, active: true },
  { label: "Compare", icon: GitCompareArrows },
  { label: "Saved", icon: Bookmark },
];

export default function PlatformPreview() {
  return (
    <Section className="border-y border-border/70 py-24 md:py-36" background="muted">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="The working product"
            title="A discovery workspace—not a futuristic dashboard."
            description="This reconstructed frame reflects the current patient navigation: Dashboard, Discover, Compare, and Saved."
            alignment="center"
            className="mx-auto max-w-3xl"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <SpotlightCard className="mx-auto max-w-6xl rounded-[34px] border-border bg-[#fdfbf7] p-2 shadow-[0_28px_90px_rgba(15,40,35,0.1)] sm:p-3">
            <div className="relative z-10 overflow-hidden rounded-[27px] border border-border bg-white">
              <div className="flex h-11 items-center justify-between border-b border-border bg-surface-elevated/50 px-4">
                <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-coral/60" /><span className="h-2 w-2 rounded-full bg-amber/60" /><span className="h-2 w-2 rounded-full bg-sage/70" /></div>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Illustrative product reconstruction</span>
                <span className="hidden text-[9px] font-bold text-primary sm:block">MEDIMESH</span>
              </div>

              <div className="grid min-h-[520px] md:grid-cols-[180px_1fr]">
                <aside className="hidden border-r border-border bg-[#f4f1ea]/45 p-4 md:block">
                  <p className="mb-6 px-2 text-xs font-extrabold tracking-[-0.03em]">MEDI<span className="text-primary">MESH</span></p>
                  <nav aria-label="Preview navigation" className="grid gap-1">
                    {sideNav.map((item) => {
                      const Icon = item.icon;
                      return <span key={item.label} className={`flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[11px] font-bold ${item.active ? "bg-primary text-white" : "text-muted-foreground"}`}><Icon className="h-3.5 w-3.5" />{item.label}</span>;
                    })}
                  </nav>
                </aside>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-primary">Patient / Discover</p>
                      <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Find care with context.</h3>
                    </div>
                    <span className="w-fit rounded-[9px] border border-primary/15 bg-primary/[0.07] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-primary">Demonstration data</span>
                  </div>

                  <div className="mt-7 grid gap-2 rounded-[18px] border border-border bg-surface-elevated/45 p-2 sm:grid-cols-[1fr_0.65fr_auto]">
                    <span className="flex min-h-11 items-center gap-2 rounded-[11px] bg-white px-3 text-xs font-semibold"><Search className="h-3.5 w-3.5 text-primary" />Cardiology</span>
                    <span className="flex min-h-11 items-center gap-2 rounded-[11px] bg-white px-3 text-xs font-semibold"><MapPin className="h-3.5 w-3.5 text-primary" />Maharashtra</span>
                    <span className="flex min-h-11 items-center justify-center rounded-[11px] bg-primary px-4 text-xs font-bold text-white">Search</span>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-[180px_1fr]">
                    <div className="rounded-[18px] border border-border bg-white p-4">
                      <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider"><SlidersHorizontal className="h-3.5 w-3.5 text-primary" />Filters</p>
                      <div className="mt-4 grid gap-3">
                        {["Location", "Specialty", "Facility", "Source state"].map((label, index) => <div key={label} className="border-b border-border pb-3 last:border-0"><span className="text-[9px] font-bold text-muted-foreground">{label}</span><span className="mt-1 block text-[10px] font-semibold">{index < 2 ? ["Maharashtra","Cardiology"][index] : "Any"}</span></div>)}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {["Harbourview Medical Centre", "NaviCare Multispeciality"].map((name, index) => (
                        <div key={name} className="rounded-[18px] border border-border bg-white p-4 shadow-[0_6px_20px_rgba(15,40,35,0.035)]">
                          <div className="flex items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-primary/10 text-primary"><Building2 className="h-4 w-4" /></span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                <strong className="text-xs sm:text-sm">{name}</strong>
                                <span className="w-fit text-[8px] font-extrabold uppercase tracking-wider text-primary">Illustrative</span>
                              </div>
                              <p className="mt-1 text-[9px] font-medium text-muted-foreground">{index === 0 ? "Vashi" : "Nerul"} · Maharashtra</p>
                              <div className="mt-3 flex flex-wrap gap-1.5">{["Cardiology", index === 0 ? "Multi-specialty" : "Diagnostics"].map(item => <span key={item} className="rounded-lg bg-surface-elevated px-2 py-1 text-[8px] font-bold">{item}</span>)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
