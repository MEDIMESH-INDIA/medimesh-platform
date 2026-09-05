import { ArrowUpRight, Building2, ClipboardCheck, Stethoscope, UserRound } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";

const stakeholders = [
  {
    label: "Patients & caregivers",
    title: "Discover and compare",
    description: "Move from a care need to a shortlist, with the same facts visible across options.",
    icon: UserRound,
    preview: ["Search intent", "Saved shortlist", "Comparison"],
    className: "lg:col-span-7 lg:row-span-2",
  },
  {
    label: "Doctors",
    title: "Professional context",
    description: "Represent specialties, qualifications, and affiliations in a structured profile.",
    icon: Stethoscope,
    preview: ["Profile", "Affiliations"],
    className: "lg:col-span-5",
  },
  {
    label: "Hospitals",
    title: "Organizational records",
    description: "Present services and facilities through consistent fields.",
    icon: Building2,
    preview: ["Services", "Facilities"],
    className: "lg:col-span-5",
  },
  {
    label: "Platform review",
    title: "Data context & governance",
    description: "Keep source, review state, and freshness attached to the information displayed.",
    icon: ClipboardCheck,
    preview: ["Source", "Review state", "Last checked"],
    className: "lg:col-span-12",
  },
];

export default function EcosystemSection() {
  return (
    <Section className="border-y border-border/70 py-24 md:py-36" background="white">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="07 / The ecosystem"
            title="Clarity depends on every side of the record."
            description="MEDIMESH creates distinct surfaces for the people searching, the professionals and institutions represented, and the review context around their information."
            className="max-w-3xl"
          />
        </ScrollReveal>

        <div className="grid gap-4 lg:grid-cols-12">
          {stakeholders.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.label} delay={index * 0.06} className={item.className}>
                <FrostedPanel variant={index === 0 ? "elevated" : "subtle"} className="group h-full rounded-[24px] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 sm:p-7">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-[13px] border border-primary/10 bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                    </div>
                    <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.16em] text-primary">{item.label}</p>
                    <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] sm:text-2xl">{item.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{item.description}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {item.preview.map((value) => <span key={value} className="rounded-[10px] border border-border bg-surface-elevated/60 px-2.5 py-1.5 text-[10px] font-bold">{value}</span>)}
                    </div>
                  </div>
                </FrostedPanel>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
