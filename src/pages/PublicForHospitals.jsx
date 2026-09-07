import { Link } from 'react-router-dom';
import { Building2, BedDouble, Activity, ShieldCheck, CheckCircle2, ArrowRight, FileCheck2, Stethoscope } from 'lucide-react';
import Container from '../components/common/Container';
import FrostedPanel from '../components/common/FrostedPanel';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export default function PublicForHospitals() {
  const { user, role } = useAuth();
  const isHospital = user && role === 'hospital';

  const capabilities = [
    {
      icon: BedDouble,
      title: '1. Licensed Bed Capacity',
      description: 'Record authoritative counts for general beds, ICU facilities, emergency units, and dedicated ambulance fleets.',
    },
    {
      icon: Activity,
      title: '2. Clinical Services Catalog',
      description: 'Publish verified specialty departments, diagnostic capabilities, and surgical services under standardized taxonomy.',
    },
    {
      icon: Stethoscope,
      title: '3. Physician Affiliations',
      description: 'Manage verified medical staff, consulting specialists, and surgeon rosters affiliated with your healthcare facility.',
    },
    {
      icon: ShieldCheck,
      title: '4. Institutional Governance',
      description: 'Demonstrate NABH, NABL, and Municipal Corporation licensing credentials to build patient trust through audited proof.',
    },
  ];

  return (
    <div className="py-8 sm:py-10">
      <Container>
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="space-y-3 max-w-[720px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Building2 className="w-3.5 h-3.5" />
              Institutional Healthcare Network
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-serif font-bold text-foreground tracking-tight">
              Accredited Hospital Capacity &amp; Service Governance
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              MEDIMESH provides verified healthcare infrastructure across Navi Mumbai. Maintain official licensed capacity, clinical specialties, and medical affiliations—structured for civic transparency without commercial pay-for-rank placement.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {isHospital ? (
                <Button as={Link} to="/hospital" className="gap-2 text-sm font-semibold px-6 py-3">
                  <span>Open Hospital Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button as={Link} to="/register?role=hospital" className="gap-2 text-sm font-semibold px-6 py-3">
                  <span>Register Hospital Facility</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button as={Link} to="/discover" variant="outline" className="text-sm font-semibold px-6 py-3">
                Explore Hospital Catalog
              </Button>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            {capabilities.map(cap => (
              <FrostedPanel key={cap.title} variant="elevated" className="rounded-[20px] p-6 sm:p-7 space-y-3 border-border/80">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <cap.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{cap.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>
              </FrostedPanel>
            ))}
          </div>

          {/* Institutional Integrity Standards */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-5 sm:p-7 border-border/80 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Institutional Integrity Principles
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                How MEDIMESH ensures healthcare data reflects verified reality rather than marketing claims.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-2 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Authoritative Capacity Only</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Reported bed counts and emergency facilities correspond to statutory licenses and verified municipal records.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Zero Commercial Bidding</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Listing priority on MEDIMESH is determined strictly by geographic relevance and clinical service capability.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Immutable Audit Logs</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Updates to emergency status, bed capacity, and accreditation are recorded in audit logs with administrative oversight.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Verified Medical Staff Rosters</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">Direct two-way confirmation links accredited physicians with authorized hospital clinical privileges.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileCheck2 className="w-4 h-4 text-primary" />
                <span>Compliant with National Digital Health Mission &amp; Clinical Establishments Act</span>
              </div>
              {isHospital ? (
                <Link to="/hospital" className="text-xs font-semibold text-primary hover:underline">
                  Manage hospital workspace &rarr;
                </Link>
              ) : (
                <Link to="/register?role=hospital" className="text-xs font-semibold text-primary hover:underline">
                  Register your healthcare facility &rarr;
                </Link>
              )}
            </div>
          </FrostedPanel>
        </div>
      </Container>
    </div>
  );
}
