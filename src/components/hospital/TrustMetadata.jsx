import { Database, ShieldCheck, Clock } from 'lucide-react';

const safeFormatDate = (dateString, options) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', options);
};

export default function TrustMetadata({ provenance, compact = false }) {
  if (compact) {
    return null; // Not used anymore as we embedded the compact line directly into the card
  }

  // Full detail (for Hospital Detail page)
  const formattedDetailDate = safeFormatDate(provenance?.last_verified || provenance?.checkedAt) || 'Not provided';
  let reviewStatusText = 'Not provided';
  if (provenance?.reviewStatus === 'demonstration') reviewStatusText = 'Demonstration Data';
  else if (provenance?.reviewStatus === 'manually_reviewed') reviewStatusText = 'Manually Reviewed';
  else if (provenance?.reviewStatus === 'source_matched') reviewStatusText = 'Source Matched';

  const steps = [
    {
      icon: Database,
      label: 'Source',
      value: provenance?.source || provenance?.sourceName || 'Unknown',
    },
    {
      icon: ShieldCheck,
      label: 'Review Status',
      value: reviewStatusText,
    },
    {
      icon: Clock,
      label: 'Last Checked',
      value: formattedDetailDate,
    }
  ];

  return (
    <div className="bg-white/50 border border-border/80 rounded-[16px] p-4">
      <div className="grid gap-4 md:grid-cols-3 relative">
        {/* Decorative horizontal line on desktop */}
        <div className="hidden absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-border/60 -z-0 -translate-y-1/2" />
        {/* Decorative vertical line on mobile */}
        <div className="hidden absolute left-[15px] top-[40px] bottom-[40px] w-[1px] bg-border/60 -z-0" />

        {steps.map((step) => (
          <div key={step.label} className="flex items-start gap-3 min-w-0 text-left">
            <div className="w-8 h-8 rounded-full bg-surface border border-border/60 flex items-center justify-center shrink-0">
              <step.icon className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{step.label}</div>
              <div className="text-[13px] font-medium text-foreground mt-0.5">{step.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
