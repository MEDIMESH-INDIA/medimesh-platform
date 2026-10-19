import { Clock, Database, ShieldCheck } from 'lucide-react';

const safeFormatDate = (dateString, options) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', options || { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function TrustMetadata({ provenance, compact = false }) {
  const formattedDetailDate = safeFormatDate(provenance?.last_verified || provenance?.checkedAt) || 'Not provided';
  let reviewStatusText = 'Not provided';
  if (provenance?.reviewStatus === 'demonstration') reviewStatusText = 'Demonstration Data';
  else if (provenance?.reviewStatus === 'manually_reviewed') reviewStatusText = 'Manually Reviewed';
  else if (provenance?.reviewStatus === 'source_matched') reviewStatusText = 'Source Matched';

  const sourceName = provenance?.source || provenance?.sourceName || 'Published Government Healthcare Directory';

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-border/80 bg-white/70 px-5 py-3 text-xs" aria-label="Source transparency">
        <div className="flex items-center gap-2.5 min-w-0">
          <Database className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">Source:</span>
          <span className="font-semibold text-foreground truncate max-w-[320px]">{sourceName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Review:</span>
          <span className="font-semibold text-foreground">{reviewStatusText}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="h-4 w-4 text-muted-foreground/80 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Checked:</span>
          <span className="font-semibold text-foreground">{formattedDetailDate}</span>
        </div>
      </div>
    );
  }

  // Refined editorial source transparency card
  return (
    <section aria-labelledby="transparency-heading" className="rounded-[24px] border border-border/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 id="transparency-heading" className="font-serif text-xl font-bold text-foreground">
              Source Transparency & Provenance
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Official healthcare registry verification and catalog metadata
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-1 rounded-2xl border border-border/60 bg-[#fdfbf7] p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Primary Source</span>
          </div>
          <p className="pt-1 text-sm font-semibold text-foreground leading-snug">
            {sourceName}
          </p>
          <p className="text-xs text-muted-foreground">
            Official public health authority register
          </p>
        </div>

        <div className="space-y-1 rounded-2xl border border-border/60 bg-[#fdfbf7] p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Review Status</span>
          </div>
          <p className="pt-1 text-sm font-semibold text-foreground leading-snug">
            {reviewStatusText}
          </p>
          <p className="text-xs text-muted-foreground">
            Catalog integrity & schema validation tier
          </p>
        </div>

        <div className="space-y-1 rounded-2xl border border-border/60 bg-[#fdfbf7] p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Last Verified</span>
          </div>
          <p className="pt-1 text-sm font-semibold text-foreground leading-snug">
            {formattedDetailDate}
          </p>
          <p className="text-xs text-muted-foreground">
            Most recent data synchronization
          </p>
        </div>
      </div>
    </section>
  );
}
