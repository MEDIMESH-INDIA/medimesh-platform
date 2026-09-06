import { Link } from 'react-router-dom';
import { Stethoscope, Award, Building2, ShieldCheck, CheckCircle2, ArrowRight, FileCheck2 } from 'lucide-react';
import Container from '../components/common/Container';
import FrostedPanel from '../components/common/FrostedPanel';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export default function PublicForDoctors() {
  const { user, role } = useAuth();
  const isDoctor = user && role === 'doctor';

  const steps = [
    {
      icon: Stethoscope,
      title: '1. Create Practitioner Profile',
      description: 'Establish your factual profile with your clinical background, languages spoken, and professional focus.',
    },
    {
      icon: Award,
      title: '2. Register Qualifications',
      description: 'Record state medical council registration numbers, recognized degrees, and clinical certifications.',
    },
    {
      icon: Building2,
      title: '3. Link Hospital Affiliations',
      description: 'Connect your practice to accredited hospitals, surgical centers, and healthcare facilities across Navi Mumbai.',
    },
    {
      icon: ShieldCheck,
      title: '4. Council Verification',
      description: 'MEDIMESH audits credentials against council gazette registries before granting verified status.',
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Physician & Specialist Network
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
              Publish Verified Medical Credentials Without Bias
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              MEDIMESH is India&apos;s structured, public healthcare infrastructure. We showcase verifiable clinical credentials and hospital affiliations—without commercial ads, star ratings, or pay-for-rank placement.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {isDoctor ? (
                <Button as={Link} to="/doctor" className="gap-2 text-sm font-semibold px-6 py-3">
                  <span>Open Doctor Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button as={Link} to="/register?role=doctor" className="gap-2 text-sm font-semibold px-6 py-3">
                  <span>Create Doctor Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button as={Link} to="/doctors" variant="outline" className="text-sm font-semibold px-6 py-3">
                Explore Doctor Directory
              </Button>
            </div>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            {steps.map(step => (
              <FrostedPanel key={step.title} variant="elevated" className="rounded-[24px] p-6 sm:p-7 space-y-3 border-border/80">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </FrostedPanel>
            ))}
          </div>

          {/* Value Standards Section */}
          <FrostedPanel variant="elevated" className="rounded-[28px] p-8 sm:p-10 border-border/80 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Our Ethical Directory Standards
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                How MEDIMESH protects practitioner reputation and patient decision-making.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-2 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">No Paid Rankings</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Directory listings cannot be sponsored, promoted, or prioritized through advertising.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">No Unsubstantiated Reviews</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">We do not display anonymous star ratings or unverified clinical outcome claims.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Source Transparency</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Every qualification cites registration councils and verified institutional affiliations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Direct Patient Routing</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Patients discover your hospital practice and clinic location without platform intermediary fees.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileCheck2 className="w-4 h-4 text-primary" />
                <span>Authorized under National Medical Council & State Registry guidelines</span>
              </div>
              {isDoctor ? (
                <Link to="/doctor" className="text-xs font-semibold text-primary hover:underline">
                  Manage your doctor profile &rarr;
                </Link>
              ) : (
                <Link to="/register?role=doctor" className="text-xs font-semibold text-primary hover:underline">
                  Get started as a doctor &rarr;
                </Link>
              )}
            </div>
          </FrostedPanel>
        </div>
      </Container>
    </div>
  );
}
