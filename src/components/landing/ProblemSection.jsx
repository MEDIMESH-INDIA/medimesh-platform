import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import AnimatedContent from "../react-bits/AnimatedContent";
import { motion } from "framer-motion";

export default function ProblemSection() {
  const sources = [
    { name: "Search Engines", top: "15%", left: "10%", delay: 0.1, yAnim: [0, -15, 0] },
    { name: "Hospital Websites", top: "45%", left: "5%", delay: 0.2, yAnim: [0, 10, 0] },
    { name: "Directories", top: "75%", left: "20%", delay: 0.3, yAnim: [0, -10, 0] },
    { name: "Social Media", top: "20%", right: "15%", delay: 0.4, yAnim: [0, 15, 0] },
    { name: "Public Portals", top: "55%", right: "8%", delay: 0.5, yAnim: [0, -12, 0] },
    { name: "Reviews", top: "80%", right: "25%", delay: 0.6, yAnim: [0, 8, 0] },
  ];

  return (
    <Section withContainer={false} className="relative overflow-hidden border-t border-border" background="muted">
      
      {/* Subtle Peach -> Coral gradient wash for patient confusion/human side */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/2 h-[60vh] bg-gradient-to-tr from-peach/10 to-coral/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <Container className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center relative z-10">
        <div className="z-10">
          <AnimatedContent distance={50} direction="vertical" reverse={false} config={{ tension: 80, friction: 20 }}>
            <SectionHeading 
              eyebrow="01 / The Challenge"
              title="Finding healthcare is easy. Understanding it isn't."
              description="Information is fragmented across hospital websites, directories, search engines, and public portals. Finding the right place means navigating a maze of unverified and disconnected data."
              className="mb-0 max-w-lg"
            />
          </AnimatedContent>
        </div>

        <div className="relative h-[400px] w-full rounded-[2rem] bg-surface-elevated/50 border border-border overflow-hidden">
          {/* Decorative background grid for the visualization */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          
          {sources.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: src.delay }}
              style={{ top: src.top, left: src.left, right: src.right }}
              className="absolute z-10"
            >
              <motion.div
                animate={{ y: src.yAnim }}
                transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
                className="bg-white px-4 py-2.5 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border text-sm font-semibold text-muted-foreground flex items-center gap-2 will-change-transform"
              >
                <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-primary/40' : 'bg-secondary-accent/40'}`}></div>
                {src.name}
              </motion.div>
            </motion.div>
          ))}
          
          {/* Central Question Mark / Confusion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/50 backdrop-blur-md rounded-full border border-border shadow-lg flex items-center justify-center z-0"
          >
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
            <span className="text-5xl font-serif text-muted-foreground opacity-40 font-bold">?</span>
          </motion.div>

          {/* Connective lines that are broken/faded */}
          <svg className="absolute inset-0 w-full h-full -z-10 opacity-30">
            <g stroke="currentColor" className="text-border" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
              <path d="M 50 100 Q 200 150 250 225" />
              <path d="M 400 50 Q 300 150 250 225" />
              <path d="M 50 350 Q 150 250 250 225" />
              <path d="M 450 350 Q 350 250 250 225" />
            </g>
          </svg>
        </div>
      </Container>
    </Section>
  );
}
