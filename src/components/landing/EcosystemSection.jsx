import {
  ArrowUpRight,
  Building2,
  ChartNoAxesColumn,
  Compass,
  Landmark,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
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
    primaryLabel: "Explore hospitals",
    href: "/discover",
    links: [
      { label: "Care Finder", href: "/care-finder" },
      { label: "Compare", href: "/compare" },
    ],
    className: "lg:col-start-1 lg:row-start-1",
  },
  {
    label: "Doctors",
    title: "Professional context",
    description: "Explore doctors, their specialties, qualifications, and available care options.",
    icon: Stethoscope,
    primaryLabel: "Find doctors",
    href: "/doctors",
    links: [{ label: "Home visits", href: "/home-visits" }],
    className: "lg:col-start-2 lg:row-start-1",
  },
  {
    label: "Hospitals",
    title: "Organizational records",
    description: "Explore hospital services and facilities through consistent, comparable information.",
    icon: Building2,
    primaryLabel: "Discover hospitals",
    href: "/discover",
    links: [{ label: "Compare hospitals", href: "/compare" }],
    className: "lg:col-start-1 lg:row-start-2",
  },
  {
    label: "Platform review",
    title: "Data context & governance",
    description: "Use guided matching to understand care needs and make more informed next steps.",
    icon: ShieldCheck,
    primaryLabel: "Open Care Finder",
    href: "/care-finder",
    links: [
      { label: "Discover", href: "/discover" },
      { label: "Compare options", href: "/compare" },
    ],
    className: "lg:col-start-2 lg:row-start-2",
  },
];

function EcosystemIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto hidden h-56 w-full max-w-[390px] items-center justify-center lg:flex">
      <div className="absolute inset-8 rounded-full border border-primary/10 bg-primary/[0.025]" />
      <div className="absolute inset-14 rounded-full border border-dashed border-primary/15" />
      <div className="absolute left-7 top-5 grid h-12 w-12 place-items-center rounded-full border border-primary/10 bg-white/90 text-primary shadow-sm">
        <UsersRound className="h-5 w-5" />
      </div>
      <div className="absolute right-8 top-8 grid h-12 w-12 place-items-center rounded-full border border-primary/10 bg-white/90 text-primary shadow-sm">
        <Landmark className="h-5 w-5" />
      </div>
      <div className="absolute bottom-7 left-8 grid h-12 w-12 place-items-center rounded-full border border-primary/10 bg-white/90 text-primary shadow-sm">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="absolute bottom-5 right-9 grid h-12 w-12 place-items-center rounded-full border border-primary/10 bg-white/90 text-primary shadow-sm">
        <ChartNoAxesColumn className="h-5 w-5" />
      </div>
      <div className="relative z-10 flex h-40 w-36 -rotate-3 flex-col gap-3 rounded-2xl border border-primary/10 bg-white/95 p-5 shadow-[0_18px_55px_rgba(15,118,110,0.12)]">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="h-2 w-20 rounded-full bg-primary/25" />
        <div className="h-2 w-full rounded-full bg-primary/10" />
        <div className="h-2 w-4/5 rounded-full bg-primary/10" />
        <div className="h-2 w-3/4 rounded-full bg-primary/10" />
      </div>
      <div className="absolute z-[5] ml-16 mt-2 h-36 w-28 rotate-3 rounded-2xl border border-primary/10 bg-primary/[0.07]" />
      <div className="absolute z-[4] ml-24 mt-4 h-32 w-24 rotate-6 rounded-2xl border border-primary/10 bg-primary/[0.045]" />
    </div>
  );
}

export default function EcosystemSection() {
  return (
    <Section className="border-y border-border/60 py-20 md:py-28" background="white">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <ScrollReveal>
            <SectionHeading
              eyebrow="07 / The ecosystem"
              title="Clarity depends on every side of the record."
              description="MEDIMESH creates distinct surfaces for the people searching, the professionals and institutions represented, and the review context around their information."
              className="max-w-3xl"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <EcosystemIllustration />
          </ScrollReveal>
        </div>

        <div className="mt-8 grid gap-4 sm:gap-5 lg:grid-cols-2">
          {stakeholders.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.label} delay={index * 0.06} className={item.className}>
                <FrostedPanel
                  variant="subtle"
                  className="group h-full min-h-[260px] rounded-[24px] border border-border/70 bg-white/85 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_45px_rgba(15,118,110,0.08)] sm:p-7"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className="grid h-14 w-14 place-items-center rounded-full border border-primary/10 bg-primary/[0.09] text-primary">
                        <Icon className="h-6 w-6" />
                      </span>
                      <Link
                        to={item.href}
                        aria-label={item.primaryLabel}
                        className="grid h-11 w-11 place-items-center rounded-full bg-surface-elevated text-primary transition group-hover:bg-primary group-hover:text-white"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </Link>
                    </div>

                    <Link to={item.href} className="mt-4 block rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-primary">{item.label}</p>
                      <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-foreground sm:text-2xl">{item.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </Link>

                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {item.links.map((link) => (
                        <Link
                          key={link.href + link.label}
                          to={link.href}
                          className="rounded-full border border-primary/5 bg-primary/[0.07] px-3.5 py-2 text-xs font-semibold text-primary/90 transition hover:border-primary/20 hover:bg-primary/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          {link.label}
                        </Link>
                      ))}
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
