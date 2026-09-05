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
    <Section withContainer={false} className="relative overflow-hidden border-t border-border" background="transparent">
      <InteractiveBackground variant="default" />
      
      <Container className="relative z-10">
        <ScrollReveal>
          <SectionHeading 
            eyebrow="05 / The Ecosystem"
            title="A platform for everyone in healthcare."
            description="MEDIMESH connects patients looking for clarity with healthcare professionals and institutions providing care."
          />
        </ScrollReveal>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 mt-10 items-center">
          
          {/* Left Column: Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {cards.map((card, index) => (
              <ScrollReveal key={index} delay={card.delay}>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className={`flex items-start gap-6 bg-white/90 backdrop-blur rounded-2xl border border-border p-6 shadow-sm transition-all duration-300 ${card.borderHover} cursor-default`}
                >
                  <div className={`w-14 h-14 shrink-0 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center border border-border/50`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 tracking-tight">{card.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Right Column: Imagery */}
          <div className="lg:col-span-6 relative h-[520px] hidden lg:block rounded-[2rem] overflow-hidden shadow-2xl border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-muted/30 to-lavender/30 z-10"></div>
            <img 
              src="/images/doctor_consultation.png" 
              alt="Doctor Consultation" 
              className="w-full h-full object-cover object-center"
            />
            {/* Floating verification card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute top-12 -left-6 bg-white p-4 rounded-xl shadow-card border border-border z-20 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-light/20 flex items-center justify-center text-blue-muted font-bold">
                DR
              </div>
              <div>
                <p className="text-sm font-bold">Dr. Anjali Sharma</p>
                <p className="text-xs text-muted-foreground">Verified Senior Specialist</p>
              </div>
            </motion.div>
          </div>

        </div>
      </Container>
    </Section>
  );
}
