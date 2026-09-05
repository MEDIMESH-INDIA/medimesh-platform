import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import ShinyText from "../react-bits/ShinyText";
import { ShieldCheck } from "lucide-react";

export default function TrustSection() {
  const words = ["Verified", "Structured", "Comparable", "Transparent"];

  return (
    <Section withContainer={false} background="muted" className="border-t border-border relative overflow-hidden">
      
      {/* Sage + Amber subtle wash for trust and verification */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-sage/5 via-transparent to-amber/5 blur-3xl -z-10 pointer-events-none"></div>

      <Container className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <ScrollReveal>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-success" />
            </div>
            <SectionHeading 
              title="Healthcare information should be trusted, not guessed."
              description="MEDIMESH is designed around a structured data pipeline. We aim to track the source, verification status, and last update date of healthcare information."
              className="mb-0"
            />
          </ScrollReveal>
        </div>

        <div className="flex flex-col gap-4">
          {words.map((word, index) => (
            <ScrollReveal key={index} delay={0.1 + (index * 0.1)}>
              <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-between group">
                <span className="text-2xl font-serif text-foreground">{word}</span>
                <span className="text-sm font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <ShinyText text="Core Principle" />
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
