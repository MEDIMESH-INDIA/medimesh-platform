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
    location: "Sector Alpha · Demo record",
    type: "Multi-specialty Center",
  },
  {
    id: "H2",
    name: "Hospital H2",
    location: "Sector Beta · Demo record",
    type: "Specialty Hospital",
  },
  {
    id: "H3",
    name: "Hospital H3",
    location: "Sector Gamma · Demo record",
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

// Parameter rows with realistic, mixed demonstration profiles across H1, H2, and H3
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
        indicator: "4 specialties",
      },
      {
        hospitalId: "H2",
        value: "General Medicine; full roster pending",
        status: "unknown",
        indicator: "Limited info",
      },
      {
        hospitalId: "H3",
        value: "Cardiology, Pediatrics, Oncology",
        status: "positive",
        indicator: "3 specialties",
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
        value: "Diagnostic Lab; ICU details unverified",
        status: "unknown",
        indicator: "Partial details",
      },
      {
        hospitalId: "H3",
        value: "Day clinic only; no ICU or OT listed",
        status: "negative",
        indicator: "Basic only",
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
        value: "24/7 Emergency unit listed",
        status: "positive",
        indicator: "Available",
      },
      {
        hospitalId: "H2",
        value: "No emergency service in record",
        status: "negative",
        indicator: "Unavailable",
      },
      {
        hospitalId: "H3",
        value: "Emergency coverage unconfirmed",
        status: "unknown",
        indicator: "Not reported",
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
        value: "Ambulance record unconfirmed",
        status: "unknown",
        indicator: "Not confirmed",
      },
      {
        hospitalId: "H2",
        value: "On-site ALS Ambulance service",
        status: "positive",
        indicator: "Available",
      },
      {
        hospitalId: "H3",
        value: "No ambulance service in record",
        status: "negative",
        indicator: "Unavailable",
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
        indicator: "350 beds listed",
      },
      {
        hospitalId: "H2",
        value: "Bed count not reported",
        status: "unknown",
        indicator: "Not reported",
      },
      {
        hospitalId: "H3",
        value: "180 Beds",
        status: "positive",
        indicator: "180 beds listed",
      },
    ],
  },
];

export default function CompareSection() {
  return (
    <Section id="compare" className="relative overflow-hidden border-y border-border/70 py-20 md:py-28" background="muted">
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

        <ScrollReveal delay={0.1} className="mt-10 sm:mt-12">
          {/* Compact Product Demonstration Container (780-840px desktop max-width) */}
          <div className="mx-auto max-w-[820px] rounded-[24px] border border-border bg-white/95 p-3.5 shadow-[0_20px_60px_rgba(15,40,35,0.06)] backdrop-blur-sm sm:rounded-[28px] sm:p-5 md:p-6">
            {/* Top Preview Status Bar */}
            <div className="mb-3.5 flex flex-col gap-2 border-b border-border/60 pb-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  Selected Hospitals
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary sm:text-[10px]">
                  3/3
                </span>
              </div>
              <span className="w-fit rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-primary sm:text-[9.5px]">
                Illustrative demonstration preview
              </span>
            </div>

            {/* A. Hospital Overview Cards (Compact 3-column layout) */}
            <section aria-label="Hospital Overview" className="mb-3 sm:mb-3.5">
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {DEMO_HOSPITALS.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="relative flex flex-col justify-between rounded-xl border border-primary/20 bg-white/95 p-2 shadow-2xs transition-shadow sm:p-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-primary sm:text-[9px]">
                          {hospital.id}
                        </span>
                      </div>
                      <h4 className="mt-1 truncate text-xs font-bold leading-tight text-foreground sm:text-[13px]">
                        {hospital.name}
                      </h4>
                      <p className="mt-0.5 hidden truncate text-[9.5px] text-muted-foreground sm:block sm:text-[10px]">
                        {hospital.type}
                      </p>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1 border-t border-border/40 pt-1 text-[8.5px] text-muted-foreground sm:text-[9.5px]">
                      <MapPin className="h-2.5 w-2.5 shrink-0 text-primary/70 sm:h-3 sm:w-3" />
                      <span className="truncate">{hospital.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Column Identifier Header Strip for Rapid Scanning */}
            <div className="mb-2.5 rounded-lg border border-border/60 bg-[#FCFBF8]/95 px-2 py-1.5 shadow-2xs sm:mb-3 sm:rounded-xl sm:py-2">
              <div className="grid grid-cols-3 gap-2 text-center sm:gap-2.5">
                {DEMO_HOSPITALS.map((hospital) => (
                  <div key={`header-${hospital.id}`} className="min-w-0">
                    <span className="mb-0.5 inline-block rounded bg-primary/10 px-1.5 py-0.2 text-[8.5px] font-black tracking-wider text-primary sm:text-[9px]">
                      {hospital.id}
                    </span>
                    <p className="truncate text-[10.5px] font-bold text-foreground sm:text-xs">
                      {hospital.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* B through F: Compact Card-based Comparison Sections */}
            <div className="space-y-2 sm:space-y-2.5">
              {COMPARISON_SECTIONS.map((section) => (
                <div
                  key={`${section.group}-${section.label}`}
                  className="rounded-xl border border-border/80 bg-white/90 p-2 shadow-2xs transition-shadow sm:rounded-2xl sm:p-2.5 md:p-3"
                >
                  {/* Parameter Label Header clearly displayed ABOVE the 3 cards */}
                  <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-1.5 sm:mb-2.5">
                    <div className="min-w-0">
                      <span className="block text-[8.5px] font-extrabold uppercase tracking-wider text-muted-foreground sm:text-[9px]">
                        {section.group}
                      </span>
                      <h3 className="text-xs font-bold leading-snug text-foreground sm:text-[13px]">
                        {section.label}
                      </h3>
                    </div>
                    {section.differs && (
                      <span className="shrink-0 rounded-md bg-lavender/20 px-1.5 py-0.5 text-[8.5px] font-semibold text-[#5a4880] sm:text-[9px]">
                        Differs
                      </span>
                    )}
                  </div>

                  {/* Three Comparison Cards Side-by-Side (Consistent Equal Widths) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {section.cells.map((cell) => {
                      const theme = STATUS_THEMES[cell.status] || STATUS_THEMES.neutral;
                      return (
                        <div
                          key={`${section.label}-${cell.hospitalId}`}
                          className={cn(
                            "flex min-h-[58px] min-w-0 flex-col justify-between rounded-lg border p-2 transition-colors sm:min-h-[64px] sm:rounded-xl sm:p-2.5",
                            theme.bg,
                            theme.border,
                          )}
                        >
                          <div className="min-w-0">
                            <span className="mb-0.5 block text-[8.5px] font-bold text-muted-foreground/75 sm:text-[9px]">
                              {cell.hospitalId}
                            </span>
                            <div className={cn("break-words text-[10px] font-semibold leading-snug sm:text-[11.5px]", theme.text)}>
                              {cell.value}
                            </div>
                          </div>

                          {cell.indicator && (
                            <div className="mt-1.5 flex items-center border-t border-black/5 pt-1 sm:mt-2">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold sm:gap-1 sm:text-[8.5px]",
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

            {/* Trust and Neutrality Disclaimer Notice */}
            <div className="mt-4 flex flex-col gap-1.5 border-t border-border/60 pt-3 text-[9px] text-muted-foreground sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:text-[10px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
                Independent comparison: each parameter evaluated separately without weighted scoring.
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
                Demonstration dataset · illustrative healthcare data only.
              </span>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
