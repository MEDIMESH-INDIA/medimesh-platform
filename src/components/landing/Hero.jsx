import Button from "../common/Button";
import Container from "../common/Container";
import Section from "../common/Section";
import TiltedCard from "../react-bits/TiltedCard";
import ScrollReveal from "../react-bits/ScrollReveal";
import ShinyText from "../react-bits/ShinyText";
import { Search, MapPin, Building2, ShieldCheck, Activity, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <Section className="relative min-h-[95vh] flex items-center pt-32 pb-16 overflow-hidden" background="transparent">
      
      <Container className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Copy */}
        <div className="max-w-2xl">
          <ScrollReveal delay={0.1}>
            <span className="inline-flex items-center gap-2 mb-6 text-[11px] font-bold tracking-widest uppercase text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              A Better Way to Navigate Healthcare
            </span>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 font-serif leading-[1.05] text-balance">
              Healthcare decisions <br className="hidden md:block" />
              shouldn't feel like <br className="hidden md:block" />
              <ShinyText text="guesswork." className="text-primary italic font-serif" />
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-xl leading-relaxed">
              Discover hospitals, understand your options, compare what matters and make informed healthcare decisions — all in one unified platform.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 shadow-sm hover:shadow transition-shadow">
              Explore Healthcare
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 bg-surface/50 backdrop-blur-sm">
              How MEDIMESH Works
            </Button>
          </ScrollReveal>
        </div>

        {/* Right Column: Visual Mockup */}
        <ScrollReveal delay={0.3} direction="left" className="relative hidden lg:block h-[560px] w-full perspective-1000">
          <div className="absolute inset-0 flex items-center justify-center">
            <TiltedCard className="w-full max-w-[460px] bg-white/95 backdrop-blur-xl p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[24px] border border-border/60">
              <div className="flex flex-col gap-4">
                
                {/* Search Bar Mock */}
                <div className="flex items-center gap-3 px-4 py-3.5 bg-surface rounded-xl border border-border shadow-sm group hover:border-primary/30 transition-colors">
                  <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-foreground/80">Cardiology hospitals in Mumbai</span>
                </div>
                
                {/* Result Mock 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-default"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-base">Apollo Hospitals</h3>
                          <ShieldCheck className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Navi Mumbai</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-surface-elevated text-foreground/70 rounded-md font-bold">Cardiology</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-surface-elevated text-foreground/70 rounded-md font-bold">24/7 ICU</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-primary/5 text-primary rounded-md font-bold border border-primary/10 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Available</span>
                  </div>
                </motion.div>

                {/* Result Mock 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                  className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-background shadow-sm opacity-90 scale-[0.98] origin-top hover:opacity-100 hover:scale-100 transition-all cursor-default"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary-accent/10 flex items-center justify-center shrink-0 border border-secondary-accent/10">
                        <Activity className="w-6 h-6 text-secondary-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-base">Fortis Hiranandani</h3>
                          <ShieldCheck className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Vashi</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.6</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-surface-elevated text-foreground/70 rounded-md font-bold">Trauma Level 1</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-surface-elevated text-foreground/70 rounded-md font-bold">Emergency</span>
                  </div>
                </motion.div>

              </div>
              <div className="absolute -bottom-4 right-4 bg-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg border border-border shadow-sm text-muted-foreground">
                Illustrative Demo Data
              </div>
            </TiltedCard>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
