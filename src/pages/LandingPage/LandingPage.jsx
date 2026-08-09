import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Hero from "../../components/landing/Hero";
import TrustStrip from "../../components/landing/TrustStrip";
import ProblemSection from "../../components/landing/ProblemSection";
import SolutionSection from "../../components/landing/SolutionSection";
import DiscoverSection from "../../components/landing/DiscoverSection";
import FilterSection from "../../components/landing/FilterSection";
import CompareSection from "../../components/landing/CompareSection";
import TrustSection from "../../components/landing/TrustSection";
import EcosystemSection from "../../components/landing/EcosystemSection";
import HowItWorks from "../../components/landing/HowItWorks";
import PlatformPreview from "../../components/landing/PlatformPreview";
import WhyMedimesh from "../../components/landing/WhyMedimesh";
import FutureEcosystem from "../../components/landing/FutureEcosystem";
import FinalCTA from "../../components/landing/FinalCTA";
import InteractiveMeshBackground from "../../components/effects/InteractiveMeshBackground";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent relative">
      <InteractiveMeshBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <Hero />
          <TrustStrip />
          <ProblemSection />
          <SolutionSection />
          <DiscoverSection />
          <FilterSection />
          <CompareSection />
          <TrustSection />
          <EcosystemSection />
          <HowItWorks />
          <PlatformPreview />
          <WhyMedimesh />
          <FutureEcosystem />
          <FinalCTA />
        </main>

        <Footer />
      </div>
    </div>
  );
}
