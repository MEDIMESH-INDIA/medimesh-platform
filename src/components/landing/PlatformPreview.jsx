import Section from "../common/Section";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function PlatformPreview() {
  return (
    <Section background="white">
      <Container>
        <ScrollReveal>
          <SectionHeading 
            title="Experience the platform."
            description="A conceptual preview of the MEDIMESH healthcare discovery interface."
            alignment="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="mt-12">
          <SpotlightCard className="w-full aspect-[4/3] md:aspect-[16/9] bg-surface-elevated rounded-3xl border border-border p-2 md:p-4 overflow-hidden">
            <div className="w-full h-full bg-white rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
              {/* App Header Mock */}
              <div className="h-14 border-b border-border flex items-center px-4 md:px-6 justify-between bg-surface">
                <div className="font-bold text-lg tracking-tight">MEDI<span className="text-primary">MESH</span></div>
                <div className="hidden md:flex items-center gap-4">
                  <div className="h-2 w-16 bg-border rounded-full"></div>
                  <div className="h-2 w-16 bg-border rounded-full"></div>
                  <div className="h-8 w-8 rounded-full bg-primary/10"></div>
                </div>
              </div>
              {/* App Body Mock */}
              <div className="flex-1 flex bg-surface-elevated/30">
                {/* Sidebar */}
                <div className="hidden md:block w-64 border-r border-border p-6 bg-surface">
                  <div className="h-4 w-24 bg-border rounded mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-3 w-full bg-surface-elevated rounded"></div>
                    <div className="h-3 w-3/4 bg-surface-elevated rounded"></div>
                    <div className="h-3 w-5/6 bg-surface-elevated rounded"></div>
                  </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col gap-6">
                  {/* Search / Filter Area */}
                  <div className="flex gap-4">
                    <div className="flex-1 h-12 bg-white border border-border rounded-lg shadow-sm"></div>
                    <div className="w-24 h-12 bg-primary/10 rounded-lg border border-primary/20"></div>
                  </div>
                  {/* Results Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-white border border-border rounded-xl p-4 shadow-sm h-32 flex flex-col justify-between">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-elevated shrink-0"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-3 w-3/4 bg-border rounded"></div>
                            <div className="h-2 w-1/2 bg-surface-elevated rounded"></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-primary/5 rounded-md"></div>
                          <div className="h-5 w-16 bg-primary/5 rounded-md"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
