import { AlertCircle, Building2, Link2Off, RefreshCw } from 'lucide-react';
import AppPageContainer from '../../layout/AppPageContainer';
import Button from '../../common/Button';
import FrostedPanel from '../../common/FrostedPanel';
import { cn } from '../../../utils/cn';

export function HospitalPortalGate({ portal, children }) {
  if (portal.loading) {
    return (
      <AppPageContainer>
        <div className="animate-pulse space-y-6" role="status" aria-label="Loading hospital workspace">
          <div className="space-y-3">
            <div className="h-3 w-36 rounded-full bg-primary/10" />
            <div className="h-10 w-full max-w-md rounded-xl bg-surface" />
            <div className="h-4 w-full max-w-2xl rounded-full bg-surface" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="h-56 rounded-[20px] border border-border/60 bg-white/55" />
            <div className="h-56 rounded-[20px] border border-border/60 bg-white/55" />
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map(item => <div key={item} className="h-28 rounded-[20px] border border-border/60 bg-white/55" />)}
          </div>
        </div>
      </AppPageContainer>
    );
  }

  if (portal.error) {
    return (
      <AppPageContainer>
        <FrostedPanel className="mx-auto max-w-2xl p-6 text-center sm:p-8">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
          <h1 className="mt-4 font-serif text-2xl font-semibold">Hospital workspace unavailable</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">We could not load your hospital workspace. Your records were not changed.</p>
          <Button className="mt-5 gap-2" onClick={() => void portal.refresh()}><RefreshCw className="h-4 w-4" /> Try again</Button>
        </FrostedPanel>
      </AppPageContainer>
    );
  }

  if (!portal.workspace?.linked) {
    return (
      <AppPageContainer>
        <FrostedPanel className="mx-auto max-w-2xl p-6 text-center sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-primary/15 bg-primary/5 text-primary">
            <Link2Off className="h-5 w-5" />
          </span>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Organization link required</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Your MEDIMESH hospital profile has not been linked yet.</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">A MEDIMESH reviewer must connect this account to the correct canonical hospital. We never claim imported hospitals by matching names.</p>
          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-3 text-xs text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" /> Existing public hospital records remain unchanged.
          </div>
        </FrostedPanel>
      </AppPageContainer>
    );
  }

  return children(portal.workspace);
}

export function PortalStatusBadge({ children, tone = 'neutral', className }) {
  const tones = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    primary: 'border-primary/20 bg-primary/5 text-primary',
    neutral: 'border-border bg-surface/70 text-muted-foreground',
  };
  return <span className={cn('inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold capitalize', tones[tone], className)}>{children}</span>;
}
