import { Link } from "react-router-dom";
import { ArrowRight, Building2, Check, GitCompareArrows, MapPin, Search, ShieldCheck } from "lucide-react";
import Button from "../common/Button";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import TiltedCard from "../react-bits/TiltedCard";

export default function Hero() {
  return (
    <Section className="relative overflow-hidden pb-12 pt-8 sm:pt-10 lg:pb-14 lg:pt-12" background="transparent" withContainer={false}>
      <div className="pointer-events-none absolute -right-32 top-12 h-[520px] w-[520px] rounded-full bg-primary/[0.055] blur-3xl" />
      <Container className="relative grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:gap-16">
        <div className="relative z-20 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[12px] border border-primary/15 bg-white/65 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary backdrop-blur-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Healthcare discovery, with context
          </div>

          <h1 className="max-w-[12ch] font-serif text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]">
            Healthcare decisions shouldn&apos;t feel like <em className="font-serif text-primary">guesswork.</em>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            MEDIMESH brings healthcare information into one structured journey—so you can discover, filter, compare, understand, and decide with clearer context.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/discover" size="lg" className="group gap-2 text-base">
              Explore healthcare
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button as="a" href="#journey" size="lg" variant="outline" className="text-base">See how it works</Button>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Built for navigation—not diagnosis or prescription.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[680px]">
          <TiltedCard className="border-0 bg-transparent shadow-none [perspective:1200px]">
            <div className="relative min-h-[530px] overflow-hidden rounded-[32px] border border-white/80 bg-[#f4f1ea]/70 p-4 shadow-[0_8px_30px_rgba(15,40,35,0.07)] sm:min-h-[570px] sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(10,122,106,0.12),transparent_34%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,122,106,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,122,106,0.045)_1px,transparent_1px)] bg-[size:24px_24px]" />

              <div className="relative z-10 flex items-center justify-between gap-3 px-1 pb-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-extrabold tracking-[-0.02em] sm:text-xs">MEDIMESH / DISCOVER</span>
                </div>
                <span className="rounded-lg border border-border bg-white/65 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[9px]">Illustrative interface</span>
              </div>

              <FrostedPanel variant="floating" className="relative z-20 rounded-[22px] p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white"><Search className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-[9px]">Search by care need and place</p>
                    <p className="truncate pt-1 text-sm font-semibold text-foreground sm:text-base">Cardiology in Maharashtra</p>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 text-primary sm:block" />
                </div>
              </FrostedPanel>

              <svg aria-hidden="true" className="absolute left-[18%] top-[128px] z-0 h-[245px] w-[66%] overflow-visible" viewBox="0 0 420 245" fill="none">
                <path d="M210 0 V56 C210 76 104 68 104 102 V158" stroke="#0A7A6A" strokeOpacity=".3" strokeWidth="1.5" />
                <path d="M210 56 C210 76 320 68 320 102 V196" stroke="#0A7A6A" strokeOpacity=".3" strokeWidth="1.5" />
              </svg>

              <FrostedPanel variant="elevated" className="relative z-10 mt-12 rounded-[24px] p-5 sm:ml-3 sm:mt-14 sm:w-[68%] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-[13px] border border-primary/10 bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span>
                  <span className="rounded-lg bg-primary/10 px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-primary sm:text-[9px]">Demonstration data</span>
                </div>
                <h2 className="mt-5 text-lg font-bold tracking-[-0.025em] sm:text-xl">Harbourview Medical Centre</h2>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Vashi, Maharashtra</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Cardiology", "Critical care", "Multi-specialty"].map((item) => (
                    <span key={item} className="rounded-[10px] border border-border bg-white/65 px-2.5 py-1.5 text-[10px] font-bold text-foreground/70">{item}</span>
                  ))}
                </div>
              </FrostedPanel>

              <FrostedPanel variant="floating" className="relative z-20 -mt-2 ml-auto rounded-[20px] p-4 sm:absolute sm:bottom-8 sm:right-7 sm:mt-0 sm:w-[46%]">
                <div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] font-extrabold uppercase tracking-[0.15em]">Source context</span></div>
                <dl className="mt-3 grid gap-2 text-xs">
                  <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Record</dt><dd className="font-semibold">Demo dataset</dd></div>
                  <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Review state</dt><dd className="font-semibold">Illustrative</dd></div>
                  <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Last checked</dt><dd className="font-semibold">02 Sep 2026</dd></div>
                </dl>
              </FrostedPanel>

              <FrostedPanel className="absolute bottom-6 left-5 z-20 hidden rounded-[18px] px-3 py-2.5 sm:flex sm:items-center sm:gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-primary/10 text-primary"><GitCompareArrows className="h-3.5 w-3.5" /></span>
                <span className="text-[11px] font-bold">Added to compare</span>
                <Check className="h-3.5 w-3.5 text-primary" />
              </FrostedPanel>
            </div>
          </TiltedCard>
        </div>
      </Container>
    </Section>
  );
}
