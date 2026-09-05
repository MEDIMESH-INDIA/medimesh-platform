import { motion, useReducedMotion } from "framer-motion";
import { Activity, Baby, Bone, Brain, HeartPulse, Microscope } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import { DISCOVERY_CATEGORIES } from "../../data/landingData";

const icons = [HeartPulse, Brain, Baby, Bone, Microscope, Activity];

export default function TrustStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="explore-by-title" className="relative border-y border-border/80 bg-white/25 py-7 backdrop-blur-[2px]">
      <Container>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <div className="shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Discovery vocabulary</p>
            <h2 id="explore-by-title" className="mt-1 text-sm font-bold tracking-[-0.02em]">Explore by care need</h2>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {DISCOVERY_CATEGORIES.map((category, index) => {
              const Icon = icons[index];
              return (
                <motion.div
                  key={category}
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.045, duration: reduceMotion ? 0 : 0.4 }}
                >
                  <FrostedPanel className="flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-[13px] px-3.5 text-xs font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary/20">
                    <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {category}
                  </FrostedPanel>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
