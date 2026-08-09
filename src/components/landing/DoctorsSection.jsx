import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { Stethoscope } from "lucide-react";

export default function DoctorsSection() {
  return (
    <Section background="muted">
      <Container className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <ScrollReveal>
            <SectionHeading 
              eyebrow="For Doctors"
              title="Give healthcare professionals a better digital presence."
              description="Manage your professional profile, highlight your specialties, and showcase your hospital affiliations."
              className="mb-0"
            />
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="aspect-square bg-white rounded-3xl border border-border flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary-accent/5 via-transparent to-transparent"></div>
            <Stethoscope className="w-16 h-16 text-secondary-accent mb-6" />
            <h3 className="text-2xl font-semibold mb-2">Professional Profiles</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Help patients find you based on your verified credentials and clinical expertise.
            </p>
            <span className="mt-6 px-3 py-1 bg-surface-elevated border border-border rounded-full text-xs font-semibold text-muted-foreground">PLANNED CAPABILITY</span>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
