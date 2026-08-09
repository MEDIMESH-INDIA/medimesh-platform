import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { User } from "lucide-react";

export default function PatientsSection() {
  return (
    <Section background="white">
      <Container className="grid md:grid-cols-2 gap-12 items-center">
        <ScrollReveal className="order-2 md:order-1">
          <div className="aspect-square bg-surface-elevated rounded-3xl border border-border flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <User className="w-16 h-16 text-primary mb-6" />
            <h3 className="text-2xl font-semibold mb-2">Patient Dashboard</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Save hospitals, compare your shortlist, and track your healthcare decisions.
            </p>
            <span className="mt-6 px-3 py-1 bg-white border border-border rounded-full text-xs font-semibold text-muted-foreground">PLANNED CAPABILITY</span>
          </div>
        </ScrollReveal>

        <div className="order-1 md:order-2">
          <ScrollReveal>
            <SectionHeading 
              eyebrow="For Patients"
              title="Built around the person making the decision."
              description="Discover hospitals, explore specialties, and build a shortlist to make informed healthcare choices for you and your family."
              className="mb-0"
            />
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
