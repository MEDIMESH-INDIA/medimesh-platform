import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import InteractiveBackground from "../effects/InteractiveBackground";
import { UserCircle, Stethoscope, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EcosystemSection() {
  const cards = [
    {
      title: "Patients",
      description: "Discover healthcare with clarity. Find verified hospitals, compare services, and make informed choices for your family.",
      icon: <UserCircle className="w-8 h-8" />,
      color: "text-primary",
      bg: "bg-primary/5",
      borderHover: "hover:border-primary/50",
      delay: 0.1
    },
    {
      title: "Doctors",
      description: "Build a trusted professional presence. Highlight your specialties, experience, and hospital affiliations.",
      icon: <Stethoscope className="w-8 h-8" />,
      color: "text-secondary-accent",
      bg: "bg-secondary-accent/5",
      borderHover: "hover:border-secondary-accent/50",
      delay: 0.2
    },
    {
      title: "Hospitals",
      description: "Present your institution with structured information. Help patients find your facilities and specialized services.",
      icon: <Building2 className="w-8 h-8" />,
      color: "text-foreground",
      bg: "bg-foreground/5",
      borderHover: "hover:border-foreground/50",
      delay: 0.3
    }
  ];

  return (
    <Section className="relative overflow-hidden border-t border-border" background="transparent">
      <InteractiveBackground variant="default" />
      
      <Container className="py-16 relative z-10">
        <ScrollReveal>
          <SectionHeading 
            eyebrow="05 / The Ecosystem"
            title="A platform for everyone in healthcare."
            description="MEDIMESH connects patients looking for clarity with healthcare professionals and institutions providing care."
            alignment="center"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-16 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <ScrollReveal key={index} delay={card.delay}>
              <motion.div 
                whileHover={{ y: -5 }}
                className={`flex flex-col h-full bg-white/90 backdrop-blur rounded-[2rem] border border-border p-8 shadow-sm transition-all duration-300 ${card.borderHover} cursor-default`}
              >
                <div className={`w-16 h-16 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-8 border border-border/50`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 tracking-tight">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  {card.description}
                </p>
                <div className="mt-auto pt-6 border-t border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Platform Capability
                  </span>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
