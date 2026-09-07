import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../common/Container";

const footerLinks = [
  { name: "Discover", href: "/discover" },
  { name: "Doctors", href: "/doctors" },
  { name: "Home Visits", href: "/home-visits" },
  { name: "Compare", href: "/compare" },
  { name: "For Doctors", href: "/for-doctors" },
  { name: "For Hospitals", href: "/hospitals" },
  { name: "About", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="relative z-20 overflow-hidden border-t border-white/10 bg-[#17211f] py-8 text-white md:py-9">
      <Container>
        <div className="grid gap-6 border-b border-white/10 pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-primary text-[10px] font-extrabold">MM</span>
              <span className="text-xl font-extrabold tracking-[-0.045em]">MEDI<span className="text-[#8fd0c5]">MESH</span></span>
            </div>
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
              {footerLinks.map((link) => <li key={link.name}><Link to={link.href} className="inline-flex min-h-11 items-center text-xs font-semibold text-white/55 transition hover:text-white">{link.name}</Link></li>)}
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
