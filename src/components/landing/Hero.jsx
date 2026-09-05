import Button from "../common/Button";
import Container from "../common/Container";
import Section from "../common/Section";
import BlurText from "../react-bits/BlurText";
import ScrollReveal from "../react-bits/ScrollReveal";
import { Search, MapPin, Building2, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <Section withContainer={false} className="relative flex items-center overflow-hidden pt-28 pb-14 md:pt-32 md:pb-16 lg:min-h-[720px]" background="transparent">
      
      {/* Subtle Teal -> Blue gradient wash in background */}
      <div className="absolute top-0 right-0 w-3/4 h-[80vh] bg-gradient-to-bl from-blue-light/10 via-primary/5 to-transparent rounded-bl-full blur-3xl -z-10"></div>

      <Container className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Copy */}
        <div className="max-w-2xl relative z-20">
          <ScrollReveal delay={0.1}>
            <span className="inline-flex items-center gap-2 mb-6 text-[11px] font-bold tracking-widest uppercase text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 backdrop-blur-sm shadow-sm group hover:border-primary/30 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse group-hover:scale-150 transition-transform"></span>
              A Better Way to Navigate Healthcare
            </span>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 font-serif leading-[1.05] text-balance">
              <BlurText text="Healthcare decisions shouldn't feel like guesswork." delay={100} />
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.6}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-xl leading-relaxed">
              Discover hospitals, understand your options, compare what matters and make informed healthcare decisions — all in one unified platform.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.7} className="flex flex-col sm:flex-row gap-4">
            <Link to="/discover" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
                Explore Healthcare
                <motion.span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</motion.span>
              </Button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 bg-surface/80 backdrop-blur-sm hover:bg-surface hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary transition-all">
                How MEDIMESH Works
              </Button>
            </Link>
          </ScrollReveal>
        </div>

        {/* Right Column: Visual Composition with Image + Floating UI */}
        <ScrollReveal delay={0.5} direction="left" className="relative hidden lg:block h-[500px] w-full">
          <div className="relative w-full h-full flex items-center justify-end">
            
            {/* Main Editorial Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="relative w-[85%] h-[80%] rounded-[2rem] overflow-hidden shadow-2xl border border-border/50 group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10 opacity-60 mix-blend-overlay"></div>
              <img 
                src="/images/modern_hospital.png" 
                alt="Modern Indian Hospital" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-in-out"
              />
              {/* Image metadata overlay */}
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(10,122,106,0.8)] animate-pulse"></span>
                <span className="text-white text-xs font-semibold tracking-wider uppercase drop-shadow-md">Verified Infrastructure</span>
              </div>
            </motion.div>

            {/* Floating Search Bar */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 1.0, duration: 0.6 }}
              className="absolute top-12 left-0 w-[340px] z-30 flex items-center gap-3 px-4 py-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-border shadow-card group hover:shadow-card-hover hover:border-primary/30 transition-all will-change-transform"
            >
              <Search className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-foreground/80">Cardiology in Mumbai</span>
            </motion.div>
            
            {/* Floating Hospital Card (Overlay on Image) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-16 -left-8 w-[380px] z-30 flex flex-col gap-4 p-5 rounded-2xl border border-border bg-white/95 backdrop-blur-md shadow-card hover:shadow-card-hover hover:border-sage/40 transition-all cursor-default will-change-transform"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center shrink-0 border border-sage/20">
                    <Building2 className="w-6 h-6 text-sage" />
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

          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
