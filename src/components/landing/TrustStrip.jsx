import { motion } from "framer-motion";
import { DEMO_CATEGORIES } from "../../data/landingData";
import Section from "../common/Section";
import Container from "../common/Container";

export default function TrustStrip() {
  return (
    <Section className="py-12 md:py-16 border-y border-border overflow-hidden bg-transparent" withContainer={true}>
      <div className="flex flex-col items-center gap-8">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">
          Discover structured information across
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
          {DEMO_CATEGORIES.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="px-4 py-2 bg-surface border border-border rounded-full text-foreground/70 text-sm md:text-base font-medium shadow-sm hover:border-primary/40 hover:text-primary hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
            >
              {category}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
