import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { motion } from "framer-motion";
import { Hospital, UserCircle, Stethoscope, Activity, Building, BriefcaseMedical } from "lucide-react";

export default function SolutionSection() {
  const nodes = [
    { icon: <UserCircle />, label: "Patients", angle: 0 },
    { icon: <Stethoscope />, label: "Doctors", angle: 60 },
    { icon: <Hospital />, label: "Hospitals", angle: 120 },
    { icon: <Activity />, label: "Services", angle: 180 },
    { icon: <Building />, label: "Facilities", angle: 240 },
    { icon: <BriefcaseMedical />, label: "Specialties", angle: 300 },
  ];

  return (
    <Section className="relative overflow-hidden" background="muted">
      <Container className="flex flex-col items-center">
        <ScrollReveal>
          <SectionHeading 
            title="One place to understand your options."
            description="MEDIMESH acts as a central healthcare discovery layer, organizing fragmented information into a structured, comparable format."
            alignment="center"
          />
        </ScrollReveal>

        <div className="relative w-full max-w-2xl aspect-square md:aspect-video mt-12 flex items-center justify-center">
          {/* Center MEDIMESH Node */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="relative z-20 w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <span className="text-white font-bold text-xl tracking-tight">MEDI<br/>MESH</span>
          </motion.div>

          {/* Surrounding Nodes */}
          {nodes.map((node, i) => {
            const radius = 160; // distance from center
            const rad = (node.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0 }}
                whileInView={{ opacity: 1, x, y }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), type: "spring" }}
                className="absolute z-10 flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-primary">
                  {node.icon}
                </div>
                <span className="text-xs font-medium text-foreground bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/50">
                  {node.label}
                </span>
              </motion.div>
            );
          })}
          
          {/* Subtle connecting lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full -z-10 opacity-20 pointer-events-none">
            <g transform="translate(50%, 50%)">
              {nodes.map((node, i) => (
                <motion.line
                  key={`line-${i}`}
                  x1="0" y1="0"
                  x2={Math.cos((node.angle * Math.PI) / 180) * 160}
                  y2={Math.sin((node.angle * Math.PI) / 180) * 160}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              ))}
            </g>
          </svg>
        </div>
      </Container>
    </Section>
  );
}
