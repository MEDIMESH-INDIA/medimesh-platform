import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";

export default function FilterSection() {
  const filters = [
    "Mumbai", "Cardiology", "Multi-specialty", "Within 5 km", "Insurance Accepted"
  ];

  return (
    <Section background="muted" className="border-y border-border">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 relative">
            <ScrollReveal>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 max-w-xl mx-auto">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">Active Filters</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {filters.map((filter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.15 }}
                      className="flex items-center gap-2 bg-surface-elevated border border-border px-3 py-1.5 rounded-full text-sm font-medium text-foreground hover:bg-border transition-colors cursor-pointer"
                    >
                      {filter}
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-border flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Showing 12 matching facilities</span>
                  <span className="text-primary font-medium cursor-pointer">Clear All</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
          
          <div className="lg:col-span-5 order-1 lg:order-2">
            <ScrollReveal>
              <SectionHeading 
                eyebrow="02 / Filter"
                title="Narrow down to what you need."
                description="Easily filter healthcare providers by location, specialties, required facilities, and accepted insurance plans."
                className="mb-0 lg:ml-auto"
                alignment="left"
              />
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
