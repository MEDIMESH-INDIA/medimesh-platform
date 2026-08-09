import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { Building2 } from "lucide-react";

export default function HospitalsSection() {
  return (
    <Section background="white">
      <Container className="grid md:grid-cols-2 gap-12 items-center">
        <ScrollReveal className="order-2 md:order-1">
          <div className="aspect-square bg-surface-elevated rounded-3xl border border-border flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-foreground/5 via-transparent to-transparent"></div>
            <Building2 className="w-16 h-16 text-foreground mb-6" />
            <h3 className="text-2xl font-semibold mb-2">Organization Profiles</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Manage your facility's information, departments, and services securely.
            </p>
            <span className="mt-6 px-3 py-1 bg-white border border-border rounded-full text-xs font-semibold text-muted-foreground">COMING TO MEDIMESH</span>
          </div>
        </ScrollReveal>

        <div className="order-1 md:order-2">
          <ScrollReveal>
            <SectionHeading 
              eyebrow="For Hospitals"
              title="Help healthcare organizations become easier to discover."
              description="Provide patients with accurate, verified information about your facilities, specialists, and available services."
              className="mb-0"
            />
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
