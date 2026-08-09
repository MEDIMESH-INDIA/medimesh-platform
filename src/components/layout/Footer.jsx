import Container from "../common/Container";
import { Link } from "react-router-dom";

export default function Footer() {
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Discover", href: "/discover" },
        { name: "Compare", href: "/compare" },
        { name: "For Doctors", href: "/doctors" },
        { name: "For Hospitals", href: "/hospitals" }
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "About", href: "/about" },
        { name: "Documentation", href: "/about" },
        { name: "How It Works", href: "/about" }
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "/about" },
        { name: "Terms", href: "/about" },
        { name: "Contact", href: "/about" }
      ],
    },
  ];

  return (
    <footer className="relative bg-foreground py-16 md:py-24 border-t border-border overflow-hidden z-20">
      <Container className="relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Info */}
          <div className="col-span-2 lg:col-span-2">
            <div className="text-2xl font-bold tracking-tight text-white mb-4">
              MEDI<span className="text-primary-light">MESH</span>
            </div>
            <p className="text-white/60 mb-6 max-w-sm">
              Making healthcare information easier to discover, understand, and compare.
            </p>
            <div className="text-sm text-white/40 font-medium tracking-wide uppercase">
              Smart India Hackathon 2026
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column, i) => (
            <div key={i} className="col-span-1">
              <h4 className="font-semibold text-white mb-4">{column.title}</h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link to={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© {new Date().getFullYear()} MEDIMESH INDIA. All rights reserved.</p>
          <p>Concept design for demonstration.</p>
        </div>
      </Container>
    </footer>
  );
}
