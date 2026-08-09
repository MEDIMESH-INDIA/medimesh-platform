import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import InteractiveBackground from "../effects/InteractiveBackground";
import { Check, Minus, Building2, MapPin, Activity } from "lucide-react";

export default function CompareSection() {
  const comparisonData = [
    { feature: "24/7 Emergency Response", h1: true, h2: true },
    { feature: "Level 1 Trauma Center", h1: false, h2: true },
    { feature: "Robotic Surgery Suite", h1: true, h2: false },
    { feature: "NABH Accredited", h1: true, h2: true },
    { feature: "Public Scheme Coverage", h1: false, h2: false },
    { feature: "Dedicated Cardiology Wing", h1: true, h2: false },
    { feature: "Maternity & NICU", h1: true, h2: true },
  ];

  return (
    <Section background="transparent" className="border-t border-border relative overflow-hidden z-0">
      <InteractiveBackground variant="comparison" />

      <Container className="py-12 relative z-10">
        <ScrollReveal>
          <SectionHeading 
            eyebrow="04 / Compare"
            title="Don't just find a hospital. Understand the difference."
            description="View side-by-side comparisons of facilities, services, and infrastructure to make the best choice based on structured information."
            alignment="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="mt-16 max-w-5xl mx-auto">
          
          <div className="flex items-center justify-end mb-4">
            <span className="text-[10px] font-bold bg-surface-elevated px-2.5 py-1 rounded-md text-muted-foreground uppercase tracking-wider border border-border">Illustrative Comparison</span>
          </div>

          <div className="border border-border rounded-2xl bg-white shadow-xl shadow-border/20 overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-surface border-b border-border">
              <div className="p-6 md:p-8 flex items-center">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Compare Features</span>
              </div>
              
              {/* Hospital A */}
              <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-border bg-surface-elevated/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="font-bold text-lg mb-1">Apollo Hospitals</div>
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Navi Mumbai
                </div>
              </div>
              
              {/* Hospital B */}
              <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-border">
                <div className="w-10 h-10 rounded-lg bg-secondary-accent/10 flex items-center justify-center mb-4 border border-secondary-accent/10">
                  <Activity className="w-5 h-5 text-secondary-accent" />
                </div>
                <div className="font-bold text-lg mb-1">Fortis Hiranandani</div>
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Vashi
                </div>
              </div>
            </div>
            
            {/* Data Rows */}
            <div className="divide-y divide-border">
              {comparisonData.map((row, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 group hover:bg-surface-elevated/30 transition-colors">
                  <div className="p-4 md:p-6 text-sm font-semibold text-foreground flex items-center bg-surface group-hover:bg-transparent transition-colors">
                    {row.feature}
                  </div>
                  <div className="px-6 py-3 md:p-6 border-t md:border-t-0 md:border-l border-border flex items-center justify-end md:justify-center bg-surface-elevated/30 group-hover:bg-transparent transition-colors">
                    <span className="md:hidden text-xs text-muted-foreground mr-auto font-medium uppercase tracking-wider">Apollo</span>
                    {row.h1 ? (
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success"><Check className="w-3.5 h-3.5" /></div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground"><Minus className="w-3.5 h-3.5" /></div>
                    )}
                  </div>
                  <div className="px-6 py-3 md:p-6 border-t md:border-t-0 md:border-l border-border flex items-center justify-end md:justify-center group-hover:bg-transparent transition-colors">
                    <span className="md:hidden text-xs text-muted-foreground mr-auto font-medium uppercase tracking-wider">Fortis</span>
                    {row.h2 ? (
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success"><Check className="w-3.5 h-3.5" /></div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground"><Minus className="w-3.5 h-3.5" /></div>
                    )}
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
