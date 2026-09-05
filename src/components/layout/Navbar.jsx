import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Menu, X, UserCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "../common/Button";
import Container from "../common/Container";
import MedimeshLogo from "../brand/MedimeshLogo";
import { useAuth } from "../../hooks/useAuth";
import { getRoleDashboardPath } from "../../routes/roleDashboardPaths";

const navLinks = [
  { name: "Discover", href: "/discover" },
  { name: "Compare", href: "/compare" },
  { name: "For Doctors", href: "/doctors" },
  { name: "For Hospitals", href: "/hospitals" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, role } = useAuth();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const dashboardLink = role ? (getRoleDashboardPath(role) ?? '/app') : '/login';

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <Container>
        <div
          className={cn(
            "relative rounded-[20px] border border-white/80 bg-[#fdfbf7]/78 px-3 shadow-[0_12px_40px_rgba(18,49,43,0.06)] backdrop-blur-2xl transition-all duration-300 sm:px-4",
            isScrolled && "bg-white/88 shadow-[0_16px_46px_rgba(18,49,43,0.1)]",
          )}
        >
          <nav className="flex h-16 items-center justify-between" aria-label="Primary navigation">
            <Link
              to="/"
              className="group flex items-center rounded-lg px-1 py-2 focus:outline-none focus:ring-2 focus:ring-focus-ring"
              aria-label="MEDIMESH home"
            >
              <MedimeshLogo variant="full" size="md" />
            </Link>

            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="inline-flex min-h-11 items-center rounded-[10px] px-3 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-white/70 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <>
                  <Button as={Link} to={dashboardLink} size="sm" className="min-h-11 gap-1.5 px-4">
                    Open MEDIMESH <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Link to={`${dashboardLink}/profile`} className="ml-1 rounded-full p-1 hover:bg-surface transition">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full" />
                    ) : (
                      <UserCircle className="w-8 h-8 text-muted-foreground" />
                    )}
                  </Link>
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="ghost" size="sm" className="min-h-11">Sign In</Button>
                  <Button as={Link} to="/register" size="sm" className="min-h-11 gap-1.5 px-4">
                    Get Started <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </>
              )}
            </div>

            <button
              type="button"
              className="grid min-h-11 min-w-11 place-items-center rounded-[12px] text-foreground transition-colors hover:bg-white lg:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>

          <div
            id="mobile-navigation"
            className={cn(
              "absolute inset-x-0 top-[72px] origin-top rounded-[20px] border border-white/80 bg-[#fdfbf7]/95 p-4 shadow-[0_22px_60px_rgba(18,49,43,0.12)] backdrop-blur-2xl transition duration-200 lg:hidden",
              isMobileMenuOpen ? "visible scale-y-100 opacity-100" : "invisible scale-y-95 opacity-0",
            )}
          >
            <ul className="grid gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="flex min-h-11 items-center justify-between rounded-[12px] px-3 text-base font-semibold text-foreground hover:bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name} <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
              {user ? (
                <Button className="col-span-2" as={Link} to={dashboardLink} onClick={() => setIsMobileMenuOpen(false)}>Open MEDIMESH</Button>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Button>
                  <Button as={Link} to="/register" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
