import FrostedPanel from '../common/FrostedPanel';

export default function DoctorCardSkeleton() {
  return (
    <FrostedPanel variant="elevated" className="rounded-[20px] p-5 sm:p-6 border-border/70 h-full flex flex-col min-w-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted/60 rounded-md w-3/4 animate-pulse"></div>
          <div className="h-3.5 bg-muted/40 rounded-md w-1/2 animate-pulse"></div>
        </div>
        <div className="w-16 h-5 rounded-full bg-muted/40 animate-pulse shrink-0"></div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-3.5 bg-muted/30 rounded w-2/3 animate-pulse"></div>
        <div className="h-3.5 bg-muted/30 rounded w-1/2 animate-pulse"></div>
      </div>

      <div className="h-16 rounded-xl bg-muted/30 mb-4 animate-pulse"></div>

      <div className="flex gap-2 mb-5 mt-auto">
        <div className="w-16 h-4 bg-muted/30 rounded animate-pulse"></div>
        <div className="w-20 h-4 bg-muted/30 rounded animate-pulse"></div>
      </div>

      <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 mt-auto">
        <div className="w-28 h-3.5 bg-muted/40 rounded animate-pulse"></div>
        <div className="w-20 h-4 bg-muted/50 rounded animate-pulse"></div>
      </div>
    </FrostedPanel>
  );
}
