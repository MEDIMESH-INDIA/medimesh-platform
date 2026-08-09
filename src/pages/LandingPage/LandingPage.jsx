import Navbar from "../../components/layout/Navbar";
import Section from "../../components/common/Section";
import SectionHeading from "../../components/common/SectionHeading";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Temporary Development Placeholder for Phase 1 */}
      <main className="pt-20">
        <Section className="min-h-[80vh] flex items-center justify-center border-b border-border">
          <div className="text-center">
            <SectionHeading 
              eyebrow="Development Preview"
              title="MEDIMESH Landing Page"
              description="Phase 1 Foundation Complete"
              alignment="center"
              className="mb-0"
            />
          </div>
        </Section>
      </main>
    </div>
  );
}
