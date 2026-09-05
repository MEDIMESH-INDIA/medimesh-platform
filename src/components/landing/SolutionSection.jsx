import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, Database, HeartPulse, Hospital, Layers3, Stethoscope, UserRound, Waypoints } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { cn } from "../../utils/cn";

const nodes = [
  { label: "Hospitals", icon: Hospital },
  { label: "Doctors", icon: Stethoscope },
  { label: "Specialties", icon: HeartPulse },
  { label: "Facilities", icon: Building2 },
  { label: "Services", icon: Layers3 },
  { label: "Sources", icon: Database },
  { label: "Patients", icon: UserRound },
  { label: "Future schemes", icon: Waypoints, future: true },
];

export default function SolutionSection() {
  const [activeNode, setActiveNode] = useState(null);
  const reduceMotion = useReducedMotion();

  return (
    <Section className="relative overflow-hidden py-24 md:py-36" background="transparent">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="02 / The MEDIMESH approach"
            title="One place to understand your options."
            description="MEDIMESH organizes healthcare entities, capabilities, and source context into an information mesh built for discovery and comparison."
            alignment="center"
            className="mx-auto mb-14 max-w-3xl"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-white/80 bg-white/45 px-4 py-12 shadow-[0_25px_80px_rgba(15,40,35,0.07)] backdrop-blur-sm sm:px-10 lg:py-16">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,122,106,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,122,106,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <svg aria-hidden="true" className="absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1000 520" preserveAspectRatio="none">
              {nodes.map((node, index) => {
                const starts = [[155,118],[390,84],[650,84],[845,118],[155,402],[390,438],[650,438],[845,402]];
                const [x, y] = starts[index];
                const active = activeNode === null || activeNode === index;
                return (
                  <motion.path
                    key={node.label}
                    d={`M${x} ${y} Q ${500 + (x < 500 ? -50 : 50)} 260 500 260`}
                    fill="none"
                    stroke="#0A7A6A"
                    strokeWidth={activeNode === index ? 2.2 : 1.2}
                    strokeOpacity={active ? 0.42 : 0.08}
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : index * 0.06 }}
                  />
                );
              })}
            </svg>

            <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-x-16 lg:gap-y-36">
              {nodes.map((node, index) => {
                const Icon = node.icon;
                return (
                  <button
                    key={node.label}
                    type="button"
                    className={cn(
                      "group relative z-10 min-h-[92px] rounded-[18px] border border-border bg-[#fdfbf7]/85 p-3 text-left shadow-[0_8px_24px_rgba(15,40,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:p-4",
                      activeNode !== null && activeNode !== index && "opacity-45",
                    )}
                    onMouseEnter={() => setActiveNode(index)}
                    onMouseLeave={() => setActiveNode(null)}
                    onFocus={() => setActiveNode(index)}
                    onBlur={() => setActiveNode(null)}
                    aria-label={`Highlight ${node.label} connection`}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="mt-3 block text-xs font-bold sm:text-sm">{node.label}</span>
                    {node.future && <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Potential</span>}
                  </button>
                );
              })}
            </div>

            <FrostedPanel variant="floating" className="relative z-20 mx-auto mt-6 flex h-32 w-32 flex-col items-center justify-center rounded-full border-primary/20 text-center lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Information</span>
              <strong className="mt-1 text-lg tracking-[-0.04em]">MEDIMESH</strong>
              <span className="mt-1 text-[10px] font-semibold text-muted-foreground">structured layer</span>
            </FrostedPanel>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
