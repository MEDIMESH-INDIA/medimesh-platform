import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { Check, Minus } from "lucide-react";

export default function CompareSection() {
  const comparisonData = [
    { feature: "24/7 Emergency", h1: true, h2: true, h3: false },
    { feature: "Level 1 Trauma Center", h1: false, h2: true, h3: false },
    { feature: "Robotic Surgery", h1: true, h2: false, h3: false },
    { feature: "NABH Accredited", h1: true, h2: true, h3: true },
    { feature: "Public Scheme Support", h1: false, h2: false, h3: true },
  ];

  return (
    <Section background="white">
      <Container>
        <ScrollReveal>
          <SectionHeading 
            eyebrow="03 / Compare"
            title="Don't just find options. Compare them."
            description="View side-by-side comparisons of facilities, services, and accreditations to make the best choice."
            alignment="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="mt-12 overflow-x-auto pb-4">
          <div className="min-w-[800px] border border-border rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-surface-elevated border-b border-border">
              <div className="p-4 font-semibold text-muted-foreground flex items-center">Features (DEMO)</div>
              <div className="p-4 border-l border-border text-center">
                <div className="font-semibold text-foreground">Hospital A</div>
                <div className="text-xs text-muted-foreground">Multi-specialty</div>
              </div>
              <div className="p-4 border-l border-border text-center">
                <div className="font-semibold text-foreground">Hospital B</div>
                <div className="text-xs text-muted-foreground">General</div>
              </div>
              <div className="p-4 border-l border-border text-center">
                <div className="font-semibold text-foreground">Hospital C</div>
                <div className="text-xs text-muted-foreground">Public</div>
              </div>
            </div>
            
            <div className="divide-y divide-border">
              {comparisonData.map((row, i) => (
                <div key={i} className="grid grid-cols-4 hover:bg-surface-elevated/50 transition-colors">
                  <div className="p-4 text-sm font-medium text-foreground flex items-center">{row.feature}</div>
                  <div className="p-4 border-l border-border flex items-center justify-center">
                    {row.h1 ? <Check className="w-5 h-5 text-primary" /> : <Minus className="w-5 h-5 text-border" />}
                  </div>
                  <div className="p-4 border-l border-border flex items-center justify-center">
                    {row.h2 ? <Check className="w-5 h-5 text-primary" /> : <Minus className="w-5 h-5 text-border" />}
                  </div>
                  <div className="p-4 border-l border-border flex items-center justify-center">
                    {row.h3 ? <Check className="w-5 h-5 text-primary" /> : <Minus className="w-5 h-5 text-border" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
