import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import SpotlightCard from "../react-bits/SpotlightCard";
import ScrollReveal from "../react-bits/ScrollReveal";
import { DEMO_HOSPITALS } from "../../data/landingData";
import { Building2, MapPin, Star } from "lucide-react";

export default function DiscoverSection() {
  return (
    <Section id="discover" background="white">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <SectionHeading 
                eyebrow="01 / Discover"
                title="Start with what matters to you."
                description="Search for healthcare facilities by location, specialty, or specific services. See verified information immediately."
                className="mb-8"
              />
            </ScrollReveal>
          </div>
          
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Example Results</span>
              <span className="text-xs bg-surface-elevated px-2 py-1 rounded text-muted-foreground">DEMO</span>
            </div>
            
            {DEMO_HOSPITALS.map((hospital, index) => (
              <ScrollReveal key={hospital.id} delay={0.2 + (index * 0.1)}>
                <SpotlightCard className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{hospital.name}</h3>
                      {hospital.verified && (
                        <span className="bg-success/10 text-success text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Verified</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {hospital.location}</span>
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {hospital.rating}</span>
                      <span>{hospital.type}</span>
                    </div>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
