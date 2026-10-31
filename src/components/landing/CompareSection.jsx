import { Check, Database, HelpCircle, MapPin, ShieldCheck, X } from "lucide-react";
import Container from "../common/Container";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { cn } from "../../utils/cn";

// Fictional demonstration hospitals
const DEMO_HOSPITALS = [
  {
    id: "H1",
    name: "Hospital H1",
    location: "Sector Alpha · Fictional record",
    type: "Multi-specialty Center",
  },
  {
    id: "H2",
    name: "Hospital H2",
    location: "Sector Beta · Fictional record",
    type: "Specialty Hospital",
  },
  {
    id: "H3",
    name: "Hospital H3",
    location: "Sector Gamma · Fictional record",
    type: "Community Healthcare Unit",
  },
];

// Soft pastel comparison status color schemes matching actual Compare feature (RANK_THEMES)
const STATUS_THEMES = {
  positive: {
    bg: "bg-[#DDF3E4]",
    border: "border-[#A7DDB8]",
    text: "text-[#134E4A]",
    badgeBg: "bg-emerald-100/90",
    badgeText: "text-[#134E4A]",
  },
  negative: {
    bg: "bg-[#FBE3E1]",
    border: "border-[#E9B5B1]",
    text: "text-[#991B1B]",
    badgeBg: "bg-rose-100/90",
    badgeText: "text-[#991B1B]",
  },
  unknown: {
    bg: "bg-[#FFF0D6]",
    border: "border-[#F0D29B]",
    text: "text-[#78350F]",
    badgeBg: "bg-amber-100/90",
    badgeText: "text-[#78350F]",
  },
  neutral: {
    bg: "bg-[#FAF9F5]",
    border: "border-border/70",
    text: "text-foreground",
    badgeBg: "bg-surface-elevated",
    badgeText: "text-muted-foreground",
  },
};

// Comparison parameters (B through F)
const COMPARISON_SECTIONS = [
  {
    group: "Care & services",
    label: "Specialties",
    differs: true,
    cells: [
      {
        hospitalId: "H1",
        value: "Cardiology, Orthopedics, Pediatrics, Neurology",
        status: "positive",
        indicator: "4 specialties listed",
      },
      {
        hospitalId: "H2",
        value: "General Medicine, Pediatrics",
        status: "negative",
        indicator: "2 specialties (limited scope)",
      },
      {
        hospitalId: "H3",
        value: "Not listed in demo source",
        status: "unknown",
        indicator: "Not listed",
      },
    ],
  },
  {
    group: "Care & services",
    label: "Facilities",
    differs: true,
    cells: [
      {
        hospitalId: "H1",
        value: "ICU, NICU, Operation Theatre, Dialysis",
        status: "positive",
        indicator: "Comprehensive",
      },
      {
        hospitalId: "H2",
        value: "ICU, Diagnostic Lab",
        status: "negative",
        indicator: "Basic facilities",
      },
      {
        hospitalId: "H3",
        value: "Information pending verification",
        status: "unknown",
        indicator: "Unconfirmed",
      },
    ],
  },
  {
    group: "Urgent response",
    label: "Emergency Department",
    differs: true,
    cells: [
      {
        hospitalId: "H1",
        value: "24/7 Service Available",
        status: "positive",
        indicator: "Available",
      },
      {
        hospitalId: "H2",
        value: "Unavailable",
        status: "negative",
        indicator: "Unavailable",
      },
      {
        hospitalId: "H3",
        value: "Status unconfirmed",
        status: "unknown",
        indicator: "Unknown",
      },
    ],
  },
  {
    group: "Urgent response",
    label: "Ambulance",
    differs: true,
    cells: [
      {
        hospitalId: "H1",
        value: "On-site ALS Ambulance",
        status: "positive",
        indicator: "Available",
      },
      {
        hospitalId: "H2",
        value: "Unavailable",
        status: "negative",
        indicator: "Unavailable",
      },
      {
        hospitalId: "H3",
        value: "Not listed",
        status: "unknown",
        indicator: "Not listed",
      },
    ],
  },
  {
    group: "Hospital capacity",
    label: "Total Beds",
    differs: true,
    cells: [
      {
        hospitalId: "H1",
        value: "350 Beds",
        status: "positive",
        indicator: "Higher capacity",
      },
      {
        hospitalId: "H2",
        value: "60 Beds",
        status: "negative",
        indicator: "Lower capacity",
      },
      {
        hospitalId: "H3",
        value: "Record not reported",
        status: "unknown",
        indicator: "Incomplete",
      },
    ],
  },
];

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
          <div className="mx-auto max-w-5xl rounded-[28px] border border-border bg-white/95 p-3.5 shadow-[0_24px_80px_rgba(15,40,35,0.08)] backdrop-blur-sm sm:rounded-[36px] sm:p-7 md:p-8">
            {/* Top Preview Bar */}
            <div className="mb-4 flex flex-col gap-2.5 border-b border-border/70 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 font-serif text-sm font-bold text-foreground sm:text-base">
                  Selected Hospitals
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  3/3
                </span>
              </div>
              <span className="w-fit rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-primary sm:text-[10px]">
                Illustrative demonstration preview
              </span>
            </div>

            {/* A. Hospital Overview Cards (3-column layout on both desktop & mobile) */}
            <section aria-label="Hospital Overview" className="mb-4 sm:mb-5">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {DEMO_HOSPITALS.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="relative flex flex-col justify-between rounded-xl border border-primary/25 bg-white/95 p-2 sm:p-3 shadow-xs transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary">
                          {hospital.id}
                        </span>
                      </div>
                      <h4 className="mt-1 font-serif text-xs font-bold leading-tight text-foreground sm:text-sm">
                        {hospital.name}
                      </h4>
                      <p className="mt-0.5 text-[10px] text-muted-foreground hidden sm:block">
                        {hospital.type}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-1 border-t border-border/50 pt-1.5 text-[9px] text-muted-foreground sm:text-[10px]">
                      <MapPin className="h-2.5 w-2.5 shrink-0 text-primary/70 sm:h-3 sm:w-3" />
                      <span className="truncate">{hospital.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sticky/Subtle Column Header for Rapid Eye Scanning */}
            <div className="mb-3 rounded-xl border border-border/60 bg-[#FCFBF8]/95 px-2 py-1.5 shadow-2xs sm:px-3 sm:py-2">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                {DEMO_HOSPITALS.map((hospital) => (
                  <div key={`header-${hospital.id}`} className="min-w-0">
                    <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-primary mb-0.5">
                      {hospital.id}
                    </span>
                    <p className="font-serif text-[11px] font-bold text-foreground truncate sm:text-xs">
                      {hospital.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* B through F: Card-based Comparison Sections */}
            <div className="space-y-2.5 sm:space-y-3">
              {COMPARISON_SECTIONS.map((section) => (
                <div
                  key={`${section.group}-${section.label}`}
                  className="rounded-2xl border border-border/80 bg-white/90 p-2.5 shadow-xs transition-shadow sm:p-3.5"
                >
                  {/* Parameter Label Header clearly displayed ABOVE the 3 cards */}
                  <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-1.5 sm:mb-2.5 sm:pb-2">
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground sm:text-[10px]">
                        {section.group}
                      </span>
                      <h3 className="font-serif text-xs font-bold leading-snug text-foreground sm:text-sm">
                        {section.label}
                      </h3>
                    </div>
                    {section.differs && (
                      <span className="shrink-0 rounded-md bg-lavender/20 px-1.5 py-0.5 text-[9px] font-semibold text-[#5a4880] sm:text-[10px]">
                        Differs
                      </span>
                    )}
                  </div>

                  {/* Three Comparison Cards Side-by-Side */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {section.cells.map((cell) => {
                      const theme = STATUS_THEMES[cell.status] || STATUS_THEMES.neutral;
                      return (
                        <div
                          key={`${section.label}-${cell.hospitalId}`}
                          className={cn(
                            "flex min-h-[64px] min-w-0 flex-col justify-between rounded-xl border p-2 transition-colors sm:min-h-[76px] sm:p-2.5",
                            theme.bg,
                            theme.border,
                          )}
                        >
                          <div className="min-w-0">
                            <span className="mb-0.5 block text-[9px] font-bold text-muted-foreground/75">
                              {cell.hospitalId}
                            </span>
                            <div className={cn("break-words text-[11px] font-semibold leading-snug sm:text-xs", theme.text)}>
                              {cell.value}
                            </div>
                          </div>

                          {cell.indicator && (
                            <div className="mt-1.5 flex items-center border-t border-black/5 pt-1 sm:mt-2">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold sm:gap-1 sm:text-[9px]",
                                  theme.badgeBg,
                                  theme.badgeText,
                                )}
                              >
                                {cell.status === "positive" && <Check className="h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" />}
                                {cell.status === "negative" && <X className="h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" />}
                                {cell.status === "unknown" && <HelpCircle className="h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" />}
                                <span className="truncate">{cell.indicator}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust and Independence Notice */}
            <div className="mt-5 flex flex-col gap-1.5 border-t border-border/60 pt-3.5 text-[10px] text-muted-foreground sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-4 sm:text-[11px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                Independent comparison: each parameter evaluated separately without weighted scoring.
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 shrink-0 text-primary" />
                Demonstration dataset · illustrative healthcare data only.
              </span>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
