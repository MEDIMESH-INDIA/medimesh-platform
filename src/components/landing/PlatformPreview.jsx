import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function PlatformPreview() {
  return (
    <Section withContainer={false} background="white">
      <Container>
        <ScrollReveal>
          <SectionHeading 
            eyebrow="06 / The Interface"
            title="Experience the platform."
            description="A conceptual preview of the MEDIMESH healthcare discovery interface."
            alignment="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="mt-10">
          <SpotlightCard className="w-full aspect-[4/3] md:aspect-[16/9] bg-surface-elevated rounded-[2rem] border border-border p-2 md:p-3 overflow-hidden shadow-2xl">
            <div className="w-full h-full relative rounded-2xl overflow-hidden group">
              <img 
                src="/images/healthcare_data.png" 
                alt="MEDIMESH Interface Preview" 
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 mix-blend-overlay"></div>
              
              {/* Overlay Metadata */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-white">
                  <p className="text-xs font-bold tracking-widest uppercase text-white/70 mb-1">Preview Dashboard</p>
                  <p className="text-sm font-medium">Data Intelligence & Verification Module</p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-light shadow-[0_0_10px_rgba(141,185,217,0.8)] animate-pulse"></span>
                  <span className="text-white text-xs font-semibold tracking-wider uppercase">Live Sync</span>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
