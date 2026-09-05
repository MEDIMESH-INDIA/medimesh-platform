import { Link } from 'react-router-dom';
import { ArrowRight, Database, GitCompareArrows, Search, ShieldCheck } from 'lucide-react';
import AuthCard from '../common/AuthCard';
import FrostedPanel from '../common/FrostedPanel';
import MedimeshBackground from '../common/MedimeshBackground';
import PageTransition from './PageTransition';

export default function AuthLayout({
  children,
  title,
  subtitle,
  compact = false,
  eyebrow = 'Welcome back',
  statement = 'Healthcare decisions with more clarity.',
  description = 'Access your MEDIMESH workspace and continue exploring structured healthcare information.',
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <MedimeshBackground graph={compact ? 'light' : 'medium'} mesh="light" />
      <a href="#auth-content" className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-[10px] bg-primary px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0">
        Skip to form
      </a>

      <div className={`relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] ${compact ? 'place-items-center px-4 py-10' : 'lg:grid-cols-[1.05fr_0.95fr]'}`}>
        {!compact && (
          <section className="hidden min-h-screen flex-col justify-between px-10 py-9 lg:flex xl:px-16 xl:py-12">
            <Link to="/" className="w-fit font-serif text-2xl font-semibold tracking-[-0.04em] text-foreground">
              MEDI<span className="text-primary">MESH</span>
            </Link>

            <div className="max-w-[620px] py-12">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
              <h1 className="mt-5 max-w-[11ch] font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-foreground xl:text-6xl">
                {statement}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground xl:text-lg">{description}</p>

              <div className="relative mt-12 h-64 max-w-[560px]">
                <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-primary/25" viewBox="0 0 560 256" fill="none">
                  <path d="M92 88 C170 88 175 134 248 134 S355 82 450 82" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 6" />
                  <path d="M248 134 C290 134 302 196 386 196" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 6" />
                </svg>
                <FrostedPanel variant="floating" className="absolute left-0 top-4 w-56 rounded-[20px] p-4">
                  <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary"><Search className="h-4 w-4" /> Search</span>
                  <p className="mt-3 text-sm font-semibold">Care need + location</p>
                </FrostedPanel>
                <FrostedPanel variant="elevated" className="absolute right-4 top-20 w-52 rounded-[20px] p-4">
                  <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary"><GitCompareArrows className="h-4 w-4" /> Compare</span>
                  <p className="mt-3 text-sm font-semibold">Options, side by side</p>
                </FrostedPanel>
                <FrostedPanel className="absolute bottom-0 left-24 w-56 rounded-[20px] p-4">
                  <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary"><Database className="h-4 w-4" /> Source</span>
                  <p className="mt-3 flex items-center justify-between text-sm font-semibold">Context included <ShieldCheck className="h-4 w-4 text-primary" /></p>
                </FrostedPanel>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Built for healthcare navigation—not diagnosis.</p>
          </section>
        )}

        <main id="auth-content" className={`flex w-full items-center justify-center px-4 py-8 sm:px-8 ${compact ? 'max-w-lg' : 'lg:min-h-screen lg:border-l lg:border-white/70 xl:px-16'}`}>
          <PageTransition className="max-w-[510px]">
            <div className="mb-7 flex items-center justify-between lg:hidden">
              <Link to="/" className="font-serif text-2xl font-semibold tracking-[-0.04em] text-foreground">MEDI<span className="text-primary">MESH</span></Link>
              {!compact && <ArrowRight className="h-4 w-4 text-primary" />}
            </div>
            <AuthCard className={compact ? 'text-center' : ''}>
              <div className={compact ? 'mx-auto max-w-sm' : ''}>
                <h2 className="font-serif text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-[2.15rem]">{title}</h2>
                {subtitle && <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>}
              </div>
              <div className="mt-7">{children}</div>
            </AuthCard>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
