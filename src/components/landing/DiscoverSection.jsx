import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import SpotlightCard from "../react-bits/SpotlightCard";
import ScrollReveal from "../react-bits/ScrollReveal";
import { DEMO_HOSPITALS } from "../../data/landingData";
import { Building2, MapPin, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DiscoverSection() {
  return (
    <Section id="discover" background="white" className="border-t border-border">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center py-8">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <SectionHeading 
                eyebrow="03 / Discover"
                title="Start with what matters to you."
                description="Search for healthcare facilities by location, specialty, or specific services. See verified information structured for clarity."
                className="mb-8"
              />
            </ScrollReveal>
          </div>
          
          <div className="lg:col-span-7 flex flex-col gap-4 relative">
            
            {/* Subtle decorative background */}
            <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-elevated via-transparent to-transparent -z-10 rounded-full"></div>

            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                Discovery Feed
              </span>
              <span className="text-[10px] font-bold bg-surface-elevated/50 px-2.5 py-1 rounded-md text-muted-foreground uppercase tracking-wider border border-border">DEMO DATA</span>
            </div>
            
            {DEMO_HOSPITALS.map((hospital, index) => (
              <ScrollReveal key={hospital.id} delay={0.2 + (index * 0.1)}>
                <SpotlightCard className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center group cursor-pointer border-border hover:border-primary/30 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                    <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{hospital.name}</h3>
                        {hospital.verified && (
                          <span className="bg-success/10 text-success text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-success/20">Verified</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-border group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium mb-3">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {hospital.location}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {hospital.rating}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span>{hospital.type}</span>
                    </div>
                    <div className="flex gap-2">
                      {hospital.facilities.slice(0, 3).map((facility, i) => (
                        <span key={i} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-surface-elevated/50 text-foreground/70 rounded border border-border/50 font-semibold group-hover:bg-surface transition-colors">
                          {facility}
                        </span>
                      ))}
                      {hospital.facilities.length > 3 && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 text-muted-foreground font-semibold">
                          +{hospital.facilities.length - 3} more
                        </span>
                      )}
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
