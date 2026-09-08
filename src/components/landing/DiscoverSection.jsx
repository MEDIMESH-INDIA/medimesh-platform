import { Link } from "react-router-dom";
import { ArrowRight, Building2, Database, MapPin, Search } from "lucide-react";
import { ILLUSTRATIVE_HOSPITALS } from "../../data/landingData";
import Button from "../common/Button";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function DiscoverSection() {
  return (
    <Section id="discover" className="relative overflow-hidden border-y border-border/70 py-24 md:py-32" background="white">
      <Container className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-32">
          <ScrollReveal>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">03 / Discover</span>
            <SectionHeading
              title="Start with the need, not a ranking."
              description="Search by specialty and location, then inspect structured records without a score deciding what is “best” for you."
              className="mt-4 mb-0 max-w-lg"
            />
            <Button as={Link} to="/discover" variant="outline" className="group mt-8 gap-2">
              Open discovery
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.08}>
          <div className="overflow-hidden rounded-[32px] border border-border bg-[#f4f1ea]/75 p-3 shadow-[0_22px_70px_rgba(15,40,35,0.07)] sm:p-5">
            <div className="flex items-center justify-between gap-3 px-2 pb-4 pt-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]">Discovery workspace</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Illustrative interface</span>
            </div>

            <FrostedPanel variant="elevated" className="rounded-[20px] p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_0.6fr_auto]">
                <label className="flex min-h-12 items-center gap-2 rounded-[12px] border border-border bg-white px-3">
                  <Search className="h-4 w-4 shrink-0 text-primary" />
                  <span className="sr-only">Specialty</span>
                  <input aria-label="Specialty" readOnly value="Cardiology" className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" />
                </label>
                <label className="flex min-h-12 items-center gap-2 rounded-[12px] border border-border bg-white px-3">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="sr-only">Location</span>
                  <input aria-label="Location" readOnly value="Maharashtra" className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" />
                </label>
                <button type="button" className="min-h-12 rounded-[12px] bg-primary px-5 text-sm font-bold text-white shadow-sm">Search</button>
              </div>
            </FrostedPanel>

            <div className="mt-3 grid gap-3">
              {ILLUSTRATIVE_HOSPITALS.map((hospital) => (
                <SpotlightCard key={hospital.id} className="rounded-[22px] border-white/70 bg-white/90 p-4 shadow-[0_8px_25px_rgba(15,40,35,0.04)] sm:p-5">
                  <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border border-primary/10 bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-bold tracking-[-0.02em] sm:text-lg">{hospital.name}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{hospital.location}</p>
                        </div>
                        <span className="w-fit rounded-[9px] border border-primary/10 bg-primary/[0.07] px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] text-primary">{hospital.sourceState}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {[hospital.type, ...hospital.specialties].map((item) => (
                          <span key={item} className="rounded-[9px] border border-border bg-surface-elevated/55 px-2 py-1 text-[10px] font-bold text-foreground/70">{item}</span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-primary" />Source visible</span>
                        <span>Checked {hospital.lastChecked}</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
