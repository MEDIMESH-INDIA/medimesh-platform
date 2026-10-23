import { Link } from 'react-router-dom';
import { Search, Stethoscope, Home, GitCompare, Bookmark, Compass, ArrowRight, Sparkles } from 'lucide-react';

const discoveryActions = [
  {
    label: 'Care Finder',
    description: 'Guided, explainable matching to hospital capabilities',
    href: '/app/care-finder',
    icon: Compass,
    badge: 'Guided Matching',
    highlight: true,
  },
  {
    label: 'Discover hospitals',
    description: 'Search the published catalog with verified coordinates',
    href: '/app/discover',
    icon: Search,
  },
  {
    label: 'Find doctors',
    description: 'Explore practitioners with verified clinical specialties',
    href: '/app/doctors',
    icon: Stethoscope,
  },
  {
    label: 'Home visit doctors',
    description: 'Connect with doctors offering house consultations',
    href: '/app/home-visits',
    icon: Home,
  },
  {
    label: 'Compare hospitals',
    description: 'Side-by-side analysis with shareable comparison links',
    href: '/app/compare',
    icon: GitCompare,
  },
  {
    label: 'Saved hospitals',
    description: 'Review your private shortlist of healthcare facilities',
    href: '/app/saved',
    icon: Bookmark,
  },
];

export default function PatientDiscoveryActions() {
  return (
    <section aria-labelledby="discovery-actions-heading" className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
            Explore healthcare options
          </p>
          <h2 id="discovery-actions-heading" className="mt-1 font-serif text-2xl font-semibold text-foreground">
            Healthcare Discovery Actions
          </h2>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {discoveryActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.href}
              className={`group relative flex flex-col justify-between h-full rounded-[20px] border p-4 sm:p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                action.highlight
                  ? 'border-primary/30 bg-gradient-to-br from-primary/[0.07] via-white/80 to-white/90 hover:border-primary/50'
                  : 'border-border/70 bg-white/70 hover:border-primary/30 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl transition-colors shrink-0 ${
                      action.highlight
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {action.badge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-primary border border-primary/20 whitespace-nowrap">
                        <Sparkles className="w-2.5 h-2.5" />
                        {action.badge}
                      </span>
                    )}
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface/80 border border-border/70 text-primary transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-sans text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

