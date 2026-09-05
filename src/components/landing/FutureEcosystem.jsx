import { ArrowRight, Database, FlaskConical, Landmark, Network, Pill, ShieldPlus } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const futureNodes = [
  { label: "Diagnostics", icon: FlaskConical },
  { label: "Pharmacies", icon: Pill },
  { label: "Insurance context", icon: ShieldPlus },
  { label: "Public datasets", icon: Landmark },
];

export default function FutureEcosystem() {
  return (
    <Section className="border-y border-border/70 py-24 md:py-32" background="white">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <ScrollReveal>
          <Network className="h-6 w-6 text-primary" />
          <SectionHeading
            eyebrow="Future direction"
            title="Designed to connect—only when the data is authorized."
            description="MEDIMESH can evolve toward additional healthcare and public-data contexts. These are potential integrations, not current partnerships or live connections."
            className="mt-5 mb-0 max-w-xl"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="rounded-[30px] border border-border bg-surface-elevated/55 p-4 sm:p-6">
            <FrostedPanel variant="elevated" className="flex items-center gap-3 rounded-[18px] p-4">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-primary text-white"><Database className="h-4 w-4" /></span>
              <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-primary">Current product direction</p><p className="mt-1 text-sm font-bold">Structured healthcare discovery</p></div>
            </FrostedPanel>
            <div className="flex h-10 items-center justify-center"><ArrowRight className="h-4 w-4 rotate-90 text-primary/60" /></div>
            <div className="grid grid-cols-2 gap-3">
              {futureNodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div key={node.label} className="rounded-[16px] border border-dashed border-primary/25 bg-white/55 p-4">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="mt-4 text-xs font-bold">{node.label}</p>
                    <span className="mt-1 block text-[8px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">Potential integration</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
