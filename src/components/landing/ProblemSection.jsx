import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { motion } from "framer-motion";

export default function ProblemSection() {
  const sources = [
    { name: "Search Engines", top: "10%", left: "10%", delay: 0.1 },
    { name: "Hospital Websites", top: "50%", left: "5%", delay: 0.2 },
    { name: "Directories", top: "80%", left: "20%", delay: 0.3 },
    { name: "Social Media", top: "15%", right: "15%", delay: 0.4 },
    { name: "Public Portals", top: "60%", right: "10%", delay: 0.5 },
    { name: "Reviews", top: "85%", right: "25%", delay: 0.6 },
  ];

  return (
    <Section className="relative overflow-hidden" background="white">
      <Container className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <ScrollReveal>
            <SectionHeading 
              eyebrow="The Challenge"
              title="Finding healthcare is easy. Understanding it isn't."
              description="Information is fragmented across hospital websites, directories, search engines, and public portals. Finding the right place means navigating a maze of unverified and disconnected information."
              className="mb-0 max-w-lg"
            />
          </ScrollReveal>
        </div>

        <div className="relative h-[400px] w-full rounded-3xl bg-surface-elevated border border-border overflow-hidden">
          {sources.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, x: src.left ? -20 : 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: src.delay }}
              style={{ top: src.top, left: src.left, right: src.right }}
              className="absolute bg-white px-4 py-2 rounded-xl shadow-sm border border-border text-sm font-medium text-muted-foreground"
            >
              {src.name}
            </motion.div>
          ))}
          
          {/* Central Question Mark / Confusion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-background rounded-full border border-border shadow-md flex items-center justify-center"
          >
            <span className="text-4xl font-serif text-muted-foreground opacity-50">?</span>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
