import Section from "../common/Section";
import Container from "../common/Container";
import ScrollReveal from "../react-bits/ScrollReveal";
import { ArrowDown } from "lucide-react";

export default function WhyMedimesh() {
  const points = [
    "Fragmented information",
    "Structured discovery",
    "Comparable options",
    "Better decisions",
  ];

  return (
    <Section withContainer={false} background="muted" className="py-16 md:py-20 lg:py-24">
      <Container className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {points.map((point, index) => (
          <div key={index} className="flex flex-col items-center">
            <ScrollReveal delay={0.1}>
              <h2 className={`text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-balance ${
                index === points.length - 1 ? "text-primary font-bold" : "text-foreground"
              }`}>
                {point}
              </h2>
            </ScrollReveal>
            
            {index < points.length - 1 && (
              <ScrollReveal delay={0.2} className="my-6 md:my-8">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-white shadow-sm text-muted-foreground">
                  <ArrowDown className="w-5 h-5" />
                </div>
              </ScrollReveal>
            )}
          </div>
        ))}
      </Container>
    </Section>
  );
}
