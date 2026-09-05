import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { Search, Filter, Columns, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    { num: "01", title: "Search", desc: "Look for hospitals, doctors, or specific specialties.", icon: <Search className="w-6 h-6" /> },
    { num: "02", title: "Filter", desc: "Narrow down by location, facilities, and insurance.", icon: <Filter className="w-6 h-6" /> },
    { num: "03", title: "Compare", desc: "Evaluate options side-by-side using structured data.", icon: <Columns className="w-6 h-6" /> },
    { num: "04", title: "Decide", desc: "Make an informed healthcare choice with confidence.", icon: <CheckCircle className="w-6 h-6" /> },
  ];

  return (
    <Section withContainer={false} background="muted" className="border-y border-border">
      <Container>
        <ScrollReveal>
          <SectionHeading 
            title="How MEDIMESH Works"
            alignment="center"
          />
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={0.1 * i}>
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm h-full flex flex-col hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-serif text-muted-foreground/30 font-bold">{step.num}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm flex-1">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
