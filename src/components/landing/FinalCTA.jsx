import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import ScrollReveal from "../react-bits/ScrollReveal";

export default function FinalCTA() {
  return (
    <Section className="relative overflow-hidden py-24 md:py-36" background="transparent">
      <Container>
        <ScrollReveal>
          <FrostedPanel variant="floating" className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] border-primary/10 px-6 py-16 text-center sm:px-10 md:py-24">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,122,106,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,122,106,0.045)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl" />
            <div className="relative">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">A clearer starting point</span>
              <h2 className="mx-auto mt-5 max-w-[18ch] font-serif text-4xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Healthcare is complicated enough. Finding the right place shouldn&apos;t be.</h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground">Explore structured demonstration records and experience the MEDIMESH discovery journey.</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button as={Link} to="/discover" size="lg" className="group gap-2 text-base">Explore MEDIMESH<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Button>
                <Button as="a" href="#journey" size="lg" variant="outline" className="text-base">See how it works</Button>
              </div>
            </div>
          </FrostedPanel>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
