import { Accessibility, Building2, ClipboardCheck, UsersRound } from "lucide-react";
import Container from "../common/Container";
import Section from "../common/Section";
import ScrollReveal from "../react-bits/ScrollReveal";

const outcomes = [
  { title: "Citizens & caregivers", text: "Less work to build and understand a shortlist.", icon: UsersRound },
  { title: "Access-constrained users", text: "A mobile-first path through essential decision fields.", icon: Accessibility },
  { title: "Hospitals & doctors", text: "Clearer, more consistent representation of provider information.", icon: Building2 },
  { title: "Review & planning", text: "More visible gaps, source state, and correction needs.", icon: ClipboardCheck },
];

export default function WhyMedimesh() {
  return (
    <Section className="relative overflow-hidden py-24 md:py-36" background="transparent">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <ScrollReveal>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">What we aim to improve</span>
            <h2 className="mt-5 max-w-[12ch] font-serif text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Less searching around. More understanding before a decision.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">These are qualitative product goals for the MVP—not achieved outcomes or measured impact claims.</p>
          </ScrollReveal>
          <div className="grid border-t border-border sm:grid-cols-2">
            {outcomes.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={index * 0.05}>
                  <article className={`min-h-[190px] border-b border-border py-6 sm:p-6 ${index % 2 === 0 ? "sm:border-r" : ""}`}>
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-7 text-base font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
