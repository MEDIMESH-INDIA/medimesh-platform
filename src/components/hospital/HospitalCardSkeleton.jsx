import FrostedPanel from '../common/FrostedPanel';

export default function HospitalCardSkeleton() {
  return (
    <FrostedPanel variant="elevated" className="rounded-2xl p-4 sm:p-5 border-border/70 h-full flex flex-col min-w-0 bg-surface/90">
      <div className="flex justify-between items-start gap-3 mb-2.5">
        <div className="flex-1 pr-2 space-y-2">
          <div className="h-5 bg-muted/50 rounded-md w-3/4 animate-pulse"></div>
          <div className="h-3.5 bg-muted/30 rounded-md w-1/2 animate-pulse"></div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-muted/30 animate-pulse shrink-0"></div>
      </div>
      
      <div className="mb-3 flex gap-1.5">
        <div className="w-16 h-4 bg-muted/30 rounded border border-border/30 animate-pulse"></div>
        <div className="w-20 h-4 bg-muted/30 rounded border border-border/30 animate-pulse"></div>
      </div>
      
      <div className="h-10 rounded-xl border border-dashed border-border/60 bg-muted/20 mb-2.5 mt-auto animate-pulse"></div>
      
      <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
        <div className="w-24 h-8 bg-muted/30 rounded-xl animate-pulse"></div>
        <div className="w-24 h-8 bg-muted/40 rounded-xl animate-pulse ml-auto"></div>
      </div>
    </FrostedPanel>
  );
}
