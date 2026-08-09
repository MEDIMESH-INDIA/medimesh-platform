import Section from "../common/Section";
import Container from "../common/Container";
import Button from "../common/Button";
import ScrollReveal from "../react-bits/ScrollReveal";
import InteractiveBackground from "../effects/InteractiveBackground";
import Aurora from "../react-bits/Aurora";

export default function FinalCTA() {
  return (
    <Section className="relative min-h-[70vh] flex items-center overflow-hidden border-y border-border" background="transparent">
      <InteractiveBackground variant="cta" />
      <Aurora className="opacity-40" />
      
      <Container className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground mb-6 text-balance">
            Healthcare is complicated enough. Finding the right place shouldn't be.
          </h2>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Join the platform that helps you discover, understand, and compare healthcare options with confidence.
          </p>
        </ScrollReveal>
        
        <ScrollReveal delay={0.3} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto text-base px-10">Explore MEDIMESH</Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-base bg-white/50 backdrop-blur-sm">See How It Works</Button>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
