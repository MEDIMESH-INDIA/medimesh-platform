import Button from "../common/Button";
import Container from "../common/Container";
import Section from "../common/Section";
import TiltedCard from "../react-bits/TiltedCard";
import ScrollReveal from "../react-bits/ScrollReveal";
import ShinyText from "../react-bits/ShinyText";
import { Search, MapPin, Building2, ShieldCheck, Activity } from "lucide-react";

export default function Hero() {
  return (
    <Section className="relative min-h-[90vh] flex items-center pt-32 pb-16 overflow-hidden" background="transparent">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <Container className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Copy */}
        <div className="max-w-2xl">
          <ScrollReveal delay={0.1}>
            <span className="inline-flex items-center gap-2 mb-6 text-sm font-semibold tracking-wider uppercase text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              A Better Way to Navigate Healthcare
            </span>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 font-serif leading-[1.1] text-balance">
              Healthcare decisions <br className="hidden md:block" />
              shouldn't feel like <br className="hidden md:block" />
              <ShinyText text="guesswork." className="text-primary" />
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-xl">
              Discover hospitals, understand your options, compare what matters and make informed healthcare decisions — all in one place.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="w-full sm:w-auto text-base">Explore Healthcare</Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">How MEDIMESH Works</Button>
          </ScrollReveal>
        </div>

        {/* Right Column: Visual */}
        <ScrollReveal delay={0.3} direction="left" className="relative hidden lg:block h-[500px] w-full perspective-1000">
          <div className="absolute inset-0 flex items-center justify-center">
            <TiltedCard className="w-full max-w-[420px] bg-white p-6 shadow-2xl rounded-2xl border-border/50">
              <div className="flex flex-col gap-5">
                {/* Search Bar Mock */}
                <div className="flex items-center gap-3 px-4 py-3 bg-surface-elevated rounded-lg border border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <div className="h-4 w-40 bg-border/60 rounded animate-pulse"></div>
                </div>
                
                {/* Result Mock 1 */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="h-4 w-32 bg-foreground/80 rounded mb-2"></div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" /> Mumbai, Maharashtra
                        </div>
                      </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-surface-elevated rounded-md font-medium">Cardiology</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-surface-elevated rounded-md font-medium">24/7 ICU</span>
                  </div>
                </div>

                {/* Result Mock 2 */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background shadow-sm opacity-70 scale-[0.98]">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-accent/10 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-secondary-accent" />
                      </div>
                      <div>
                        <div className="h-4 w-24 bg-foreground/60 rounded mb-2"></div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" /> Navi Mumbai
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TiltedCard>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
