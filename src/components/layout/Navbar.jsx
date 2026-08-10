import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "../common/Button";
import Container from "../common/Container";

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

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] py-3"
          : "bg-transparent py-6"
      )}
    >
      <Container>
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 rounded-sm"
          >
            <span className="text-xl font-bold tracking-tight text-foreground">
              MEDI<span className="text-primary">MESH</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-sm px-1 py-1 group"
                  >
                    {link.name}
                    <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-primary/50 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <Link to="/login" className="focus:outline-none rounded-md">
                <Button variant="ghost" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="focus:outline-none rounded-md">
                <Button variant="primary" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="lg:hidden p-2 -mr-2 text-foreground hover:bg-surface-elevated rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </nav>
      </Container>

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          "fixed inset-0 top-[60px] bg-surface z-40 lg:hidden transition-transform duration-300 ease-in-out border-t border-border",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          <ul className="flex flex-col gap-6 mb-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className="text-lg font-medium text-foreground block transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-sm w-fit"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-auto flex flex-col gap-4">
            <Link to="/login" className="w-full focus:outline-none rounded-md">
              <Button variant="outline" size="lg" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/register" className="w-full focus:outline-none rounded-md">
              <Button variant="primary" size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
