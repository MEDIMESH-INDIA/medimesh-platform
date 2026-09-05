import { Bookmark, CheckCircle2, Filter, GitCompareArrows, Search } from "lucide-react";
import Container from "../common/Container";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const steps = [
  { number: "01", title: "Discover", description: "Describe the care need and place.", icon: Search },
  { number: "02", title: "Filter", description: "Apply visible, supported criteria.", icon: Filter },
  { number: "03", title: "Compare", description: "Place consistent fields side by side.", icon: GitCompareArrows },
  { number: "04", title: "Understand", description: "Read sources, freshness, and gaps.", icon: Bookmark },
  { number: "05", title: "Decide", description: "Choose with clearer context.", icon: CheckCircle2 },
];

export default function HowItWorks() {
  return (
    <Section id="journey" className="relative overflow-hidden py-24 md:py-36" background="transparent">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="The core journey"
            title="Five steps. One continuous decision path."
            description="Each stage preserves the context gathered before it, reducing the need to reconstruct a shortlist across disconnected tabs."
            alignment="center"
            className="mx-auto max-w-3xl"
          />
        </ScrollReveal>

        <div className="relative mt-14">
          <div className="absolute left-[25px] top-8 h-[calc(100%-4rem)] border-l border-dashed border-primary/30 md:left-[10%] md:right-[10%] md:top-[25px] md:h-px md:border-l-0 md:border-t" />
          <ol className="relative grid gap-7 md:grid-cols-5 md:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title}>
                  <ScrollReveal delay={index * 0.07}>
                    <div className="flex gap-5 md:flex-col md:items-center md:text-center">
                      <span className="relative z-10 grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[15px] border border-primary/15 bg-[#fdfbf7] text-primary shadow-[0_8px_25px_rgba(15,40,35,0.07)]"><Icon className="h-4 w-4" /></span>
                      <div className="pt-0.5 md:pt-2">
                        <span className="text-[9px] font-extrabold tracking-[0.16em] text-primary">{step.number}</span>
                        <h3 className="mt-1 text-base font-bold">{step.title}</h3>
                        <p className="mx-auto mt-2 max-w-[180px] text-xs leading-5 text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
