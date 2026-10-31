import { useReducedMotion } from "framer-motion";
import {
  Accessibility,
  Activity,
  Baby,
  Bone,
  Brain,
  Dna,
  Droplets,
  Eye,
  HeartHandshake,
  HeartPulse,
  Microscope,
  Pill,
  Scan,
  Shield,
  ShieldPlus,
  Smile,
  SmilePlus,
  Sparkles,
  Stethoscope,
  Wind,
} from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import { DISCOVERY_CATEGORIES } from "../../data/landingData";
import { cn } from "../../utils/cn";

const CATEGORY_ICONS = {
  Cardiology: HeartPulse,
  Neurology: Brain,
  Paediatrics: Baby,
  Orthopaedics: Bone,
  Diagnostics: Microscope,
  "Emergency Care": Activity,
  "General Medicine": Stethoscope,
  Dermatology: Sparkles,
  Ophthalmology: Eye,
  Oncology: Dna,
  Gynaecology: HeartHandshake,
  Urology: Droplets,
  Nephrology: Shield,
  Gastroenterology: Pill,
  Pulmonology: Wind,
  Psychiatry: Smile,
  Physiotherapy: Accessibility,
  Radiology: Scan,
  "Dental Care": SmilePlus,
  "Critical Care": ShieldPlus,
};

export default function TrustStrip() {
  const reduceMotion = useReducedMotion();

  // Duplicate items sequence to create an infinite, seamless loop
  const marqueeItems = [...DISCOVERY_CATEGORIES, ...DISCOVERY_CATEGORIES];

  return (
    <section
      aria-labelledby="explore-by-title"
      className="relative overflow-hidden border-y border-border/80 bg-white/30 py-5 sm:py-6 backdrop-blur-[2px]"
    >
      <Container>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
          <div className="shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
              Discovery vocabulary
            </p>
            <h2 id="explore-by-title" className="mt-0.5 text-sm font-bold tracking-[-0.02em] text-foreground">
              Explore by care need
            </h2>
          </div>

          {/* Marquee viewport with subtle edge fade masks */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            {/* Left and Right edge fade masks */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background via-background/60 to-transparent sm:w-14" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background via-background/60 to-transparent sm:w-14" />

            {/* Continuous Marquee Track */}
            <div
              className={cn(
                "flex items-center gap-2.5 py-1 will-change-transform",
                reduceMotion
                  ? "overflow-x-auto [scrollbar-width:none] w-full"
                  : "animate-marquee hover:[animation-play-state:paused]"
              )}
            >
              {marqueeItems.map((category, index) => {
                const Icon = CATEGORY_ICONS[category] || Activity;
                return (
                  <FrostedPanel
                    key={`${category}-${index}`}
                    className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-[12px] px-3.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-white/95 select-none cursor-default"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span>{category}</span>
                  </FrostedPanel>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
