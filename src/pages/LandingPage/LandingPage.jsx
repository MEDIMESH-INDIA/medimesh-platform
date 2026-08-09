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
import PatientsSection from "../../components/landing/PatientsSection";
import DoctorsSection from "../../components/landing/DoctorsSection";
import HospitalsSection from "../../components/landing/HospitalsSection";
import HowItWorks from "../../components/landing/HowItWorks";
import PlatformPreview from "../../components/landing/PlatformPreview";
import WhyMedimesh from "../../components/landing/WhyMedimesh";
import FutureEcosystem from "../../components/landing/FutureEcosystem";
import FinalCTA from "../../components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <SolutionSection />
        <DiscoverSection />
        <FilterSection />
        <CompareSection />
        <TrustSection />
        <PatientsSection />
        <DoctorsSection />
        <HospitalsSection />
        <HowItWorks />
        <PlatformPreview />
        <WhyMedimesh />
        <FutureEcosystem />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
