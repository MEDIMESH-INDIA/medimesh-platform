import { ArrowUpRight } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Container from "../common/Container";
import MedimeshLogo from "../brand/MedimeshLogo";
import { useAuth } from "../../hooks/useAuth";
import { useAuthGate } from "../../hooks/useAuthGate";
import { useCompare } from "../../hooks/useCompare";

const footerLinks = [
  { name: "Discover", href: "/discover" },
  { name: "Doctors", href: "/doctors" },
  { name: "Home Visits", href: "/home-visits" },
  { name: "Compare", href: "/compare" },
  { name: "For Doctors", href: "/for-doctors" },
  { name: "For Hospitals", href: "/for-hospitals" },
  { name: "About", href: "/about" },
];

export default function Footer() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { compareList } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();

  const hasCompareTray = compareList.length > 0 && location.pathname !== '/compare' && location.pathname !== '/app/compare';

  const handleFooterLinkClick = (e, link) => {
    if (link.href === '/compare' && !user) {
      e.preventDefault();
      requireAuth({
        title: 'Compare Hospitals',
        message: 'Sign in or create an account to compare hospitals side-by-side.',
        returnTo: '/compare',
        action: () => navigate('/compare'),
      });
    }
  };
  return (
    <footer className={`relative z-20 overflow-hidden border-t border-white/10 bg-[#17211f] py-8 text-white md:py-9 transition-[padding] duration-200 ${hasCompareTray ? 'pb-28 sm:pb-32' : ''}`}>
      <Container>
        <div className="grid gap-6 border-b border-white/10 pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Link to="/" className="inline-block rounded-xl bg-white/95 px-3 py-1.5 shadow-sm transition hover:bg-white" aria-label="MEDIMESH home">
              <MedimeshLogo variant="horizontal" size="md" className="h-7 w-auto" />
            </Link>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">Healthcare discovery, comparison, and source-aware navigation—designed to make complex information easier to understand.</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">Source-aware healthcare information platform</p>
          </div>
          <Link to="/register" className="group flex min-h-12 w-fit items-center gap-3 rounded-[13px] border border-white/15 bg-white/[0.06] px-4 text-sm font-bold transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#8fd0c5]">
            Get started <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="flex flex-col gap-4 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleFooterLinkClick(e, link)}
                    className="inline-flex min-h-11 items-center text-xs font-semibold text-white/55 transition hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-2 text-[10px] font-medium text-white/55 sm:flex-row sm:gap-5">
            <span>© {new Date().getFullYear()} MEDIMESH INDIA</span>
            <span>Healthcare information only · Not medical advice</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
