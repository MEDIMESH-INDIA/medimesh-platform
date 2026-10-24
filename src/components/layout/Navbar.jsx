import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "../common/Button";
import Container from "../common/Container";
import MedimeshLogo from "../brand/MedimeshLogo";
import UserAvatar from "../common/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { useAuthGate } from "../../hooks/useAuthGate";
import { getRoleDashboardPath } from "../../routes/roleDashboardPaths";
import { lockScroll, unlockScroll, resetScrollLock } from "../../lib/ui/scrollLock";

const navLinks = [
  { name: "Discover", href: "/discover" },
  { name: "Care Finder", href: "/care-finder" },
  { name: "Doctors", href: "/doctors" },
  { name: "Home Visits", href: "/home-visits" },
  { name: "Compare", href: "/compare" },
  { name: "For Doctors", href: "/for-doctors" },
  { name: "For Hospitals", href: "/hospitals" },
  { name: "About", href: "/about" },
];

function isNavActive(pathname, href) {
  if (href === '/discover') return pathname === href || pathname.startsWith('/hospitals/');
  if (href === '/hospitals') return pathname === href || pathname === '/for-hospitals';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleButtonRef = useRef(null);
  const wasOpenRef = useRef(false);
  const { user, profile, role } = useAuth();
  const { requireAuth } = useAuthGate();

  const handleNavLinkClick = (e, link) => {
    if (link.href === '/care-finder' && !user) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      requireAuth({
        title: 'Care Finder',
        message: 'Sign in or create an account to use Care Finder for guided hospital matching.',
        returnTo: '/care-finder',
        action: () => navigate('/care-finder'),
      });
      return;
    }
    if (link.href === '/compare' && !user) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      requireAuth({
        title: 'Compare Hospitals',
        message: 'Sign in or create an account to compare hospitals side-by-side.',
        returnTo: '/compare',
        action: () => navigate('/compare'),
      });
      return;
    }
    setIsMobileMenuOpen(false);
  };

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

  // Lock body scroll and listen for Escape when mobile menu is open (document.body.style.overflow)
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    lockScroll();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  // Focus restoration to hamburger toggle button when mobile menu closes
  useEffect(() => {
    if (wasOpenRef.current && !isMobileMenuOpen) {
      toggleButtonRef.current?.focus();
    }
    wasOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  // Auto-close mobile menu on route change and reset any residual scroll lock
  useEffect(() => {
    setIsMobileMenuOpen(false);
    resetScrollLock();
  }, [location.pathname]);

  const dashboardLink = role ? (getRoleDashboardPath(role) ?? '/app') : '/login';

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <Container className="relative z-10">
        <div
          className={cn(
            "relative rounded-[20px] border border-white/80 bg-[#fdfbf7]/78 px-3 shadow-[0_3px_16px_rgba(18,49,43,0.04)] backdrop-blur-2xl transition-all duration-300 sm:px-4",
            isScrolled && "bg-white/88 shadow-[0_5px_22px_rgba(18,49,43,0.07)]",
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

            <ul className="hidden items-center gap-1 xl:flex">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleNavLinkClick(e, link)}
                    aria-current={isNavActive(location.pathname, link.href) ? 'page' : undefined}
                    className={cn("inline-flex min-h-11 items-center rounded-[10px] px-2.5 py-2 text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring", isNavActive(location.pathname, link.href) ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-black/5 hover:text-foreground")}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden items-center gap-2 xl:flex">
              {user ? (
                <>
                  <Button as={Link} to={dashboardLink} size="sm" className="min-h-11 gap-1.5 px-4">
                    Open MEDIMESH <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Link to={`${dashboardLink}/profile`} aria-label="Open profile" className="ml-1 rounded-full p-1 hover:bg-surface transition">
                    <UserAvatar
                      src={profile?.avatar_url}
                      alt="Profile"
                      name={profile?.display_name || user?.email}
                      size="sm"
                    />
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
              ref={toggleButtonRef}
              type="button"
              className="grid min-h-11 min-w-11 place-items-center rounded-[12px] text-foreground transition-colors hover:bg-white xl:hidden"
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
              "absolute inset-x-0 top-[72px] max-h-[calc(100dvh-110px)] overflow-y-auto origin-top rounded-[20px] border border-white/80 bg-[#fdfbf7]/95 p-4 shadow-[0_22px_60px_rgba(18,49,43,0.12)] backdrop-blur-2xl transition duration-200 xl:hidden",
              isMobileMenuOpen ? "visible scale-y-100 opacity-100" : "invisible scale-y-95 opacity-0 pointer-events-none",
            )}
          >
            <ul className="grid gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    aria-current={isNavActive(location.pathname, link.href) ? 'page' : undefined}
                    className="flex min-h-11 items-center justify-between rounded-[12px] px-3 text-base font-semibold text-foreground hover:bg-white"
                    onClick={(e) => handleNavLinkClick(e, link)}
                  >
                    {link.name} <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface/80 p-2.5">
                    <UserAvatar
                      src={profile?.avatar_url}
                      alt={profile?.display_name || user?.email || 'User'}
                      name={profile?.display_name || user?.email}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {profile?.display_name || user?.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      {role && (
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {role}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button as={Link} to={dashboardLink} onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </Button>
                    <Button as={Link} to={`${dashboardLink}/profile`} variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                      Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button as={Link} to="/login" variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Button>
                  <Button as={Link} to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
