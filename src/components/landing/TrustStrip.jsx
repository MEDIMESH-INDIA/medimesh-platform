import { motion } from "framer-motion";
import { DEMO_CATEGORIES } from "../../data/landingData";
import Section from "../common/Section";
import Container from "../common/Container";

export default function TrustStrip() {
  return (
    <Section className="py-8 md:py-10 border-y border-border overflow-hidden bg-surface-elevated/50" withContainer={false}>
      <Container className="flex flex-col items-center gap-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">
          Discover structured information across
        </p>
        
        <div className="w-full relative flex overflow-hidden">
          {/* Fading edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-gradient-to-r from-background to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-gradient-to-l from-background to-transparent"></div>
          
          <motion.div
            className="flex gap-8 md:gap-16 items-center whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30,
            }}
          >
            {/* Double the array for seamless looping */}
            {[...DEMO_CATEGORIES, ...DEMO_CATEGORIES].map((category, index) => (
              <span 
                key={index} 
                className="text-lg md:text-xl font-semibold text-foreground/40"
              >
                {category}
              </span>
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
