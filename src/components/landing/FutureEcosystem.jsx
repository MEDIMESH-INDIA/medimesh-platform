import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { Network } from "lucide-react";

export default function FutureEcosystem() {
  const futureNodes = [
    "Diagnostics", "Pharmacies", "Insurance", "Public Healthcare Data"
  ];

  return (
    <Section withContainer={false} background="white">
      <Container className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <ScrollReveal>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <SectionHeading 
              eyebrow="Future Vision"
              title="Built for India's evolving healthcare ecosystem."
              description="MEDIMESH is designed to integrate with appropriate public and government healthcare data sources as the platform evolves."
              className="mb-0"
            />
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {futureNodes.map((node, index) => (
            <ScrollReveal key={index} delay={0.1 * index}>
              <div className="p-6 rounded-2xl border border-border border-dashed bg-surface-elevated/50 flex flex-col items-center justify-center text-center h-full min-h-[160px] opacity-70 hover:opacity-100 hover:border-solid hover:bg-surface transition-all">
                <span className="font-medium text-foreground">{node}</span>
                <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">Planned Integration</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
