import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { motion } from "framer-motion";
import { Hospital, UserCircle, Stethoscope, Activity, Building, BriefcaseMedical, Star, Database } from "lucide-react";

export default function SolutionSection() {
  const nodes = [
    { icon: <UserCircle className="w-5 h-5" />, label: "Patients", angle: 0 },
    { icon: <Stethoscope className="w-5 h-5" />, label: "Doctors", angle: 45 },
    { icon: <Hospital className="w-5 h-5" />, label: "Hospitals", angle: 90 },
    { icon: <Activity className="w-5 h-5" />, label: "Services", angle: 135 },
    { icon: <Building className="w-5 h-5" />, label: "Facilities", angle: 180 },
    { icon: <BriefcaseMedical className="w-5 h-5" />, label: "Specialities", angle: 225 },
    { icon: <Star className="w-5 h-5" />, label: "Reviews", angle: 270 },
    { icon: <Database className="w-5 h-5" />, label: "Data", angle: 315 },
  ];

  return (
    <Section className="relative overflow-hidden border-t border-border" background="transparent">
      <Container className="flex flex-col items-center py-12">
        <ScrollReveal>
          <SectionHeading 
            eyebrow="02 / The Medimesh Approach"
            title="One place to understand your options."
            description="MEDIMESH acts as a central healthcare discovery layer, organizing fragmented information into a structured, comparable format."
            alignment="center"
          />
        </ScrollReveal>

        <div className="relative w-full max-w-3xl aspect-[4/3] md:aspect-video mt-16 md:mt-24 flex items-center justify-center">
          
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

          {/* Connective Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full z-0 overflow-visible pointer-events-none">
            <g transform="translate(50%, 50%)" style={{ transformOrigin: 'center' }}>
              {nodes.map((node, i) => {
                const radius = 200; // base distance
                const rad = (node.angle * Math.PI) / 180;
                return (
                  <motion.line
                    key={`line-${i}`}
                    x1="0" y1="0"
                    x2={Math.cos(rad) * radius}
                    y2={Math.sin(rad) * radius}
                    stroke="currentColor"
                    className="text-primary/20"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Surrounding Nodes */}
          {nodes.map((node, i) => {
            const radius = 200; 
            const rad = (node.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 + (i * 0.1), type: "spring" }}
                style={{ x, y }}
                className="absolute z-10 flex flex-col items-center gap-2 group cursor-default"
              >
                <motion.div 
                  className="w-12 h-12 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                >
                  {node.icon}
                </motion.div>
                <span className="text-xs font-semibold text-muted-foreground bg-surface/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-border/50 group-hover:text-foreground group-hover:border-border transition-colors">
                  {node.label}
                </span>
              </motion.div>
            );
          })}

          {/* Center MEDIMESH Node */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.3 }}
            className="absolute z-20"
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px 0px rgba(10,122,106,0.1)", "0px 0px 30px 10px rgba(10,122,106,0.2)", "0px 0px 0px 0px rgba(10,122,106,0.1)"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-surface border border-border shadow-lg flex items-center justify-center"
            >
              <div className="absolute inset-1 rounded-full border border-primary/20 bg-primary/5"></div>
              <span className="relative text-foreground font-bold text-lg md:text-xl tracking-tight">
                MEDI<span className="text-primary">MESH</span>
              </span>
            </motion.div>
          </motion.div>

        </div>
      </Container>
    </Section>
  );
}
