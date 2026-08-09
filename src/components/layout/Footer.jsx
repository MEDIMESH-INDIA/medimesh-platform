import Container from "../common/Container";

export default function Footer() {
  const footerLinks = [
    {
      title: "Platform",
      links: ["Discover", "Compare", "For Doctors", "For Hospitals"],
    },
    {
      title: "Resources",
      links: ["About", "Documentation", "How It Works"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Contact"],
    },
  ];

  return (
    <footer className="bg-surface py-16 md:py-24 border-t border-border">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Info */}
          <div className="col-span-2 lg:col-span-2">
            <div className="text-2xl font-bold tracking-tight text-foreground mb-4">
              MEDI<span className="text-primary">MESH</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Built for a more informed healthcare journey. Discover, understand, and compare your healthcare options.
            </p>
            <div className="text-sm text-muted-foreground/60 font-medium">
              Smart India Hackathon 2026
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column, i) => (
            <div key={i} className="col-span-1">
              <h4 className="font-semibold text-foreground mb-4">{column.title}</h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground/80">
          <p>© {new Date().getFullYear()} MEDIMESH INDIA. All rights reserved.</p>
          <p>Concept design for demonstration.</p>
        </div>
      </Container>
    </footer>
  );
}
