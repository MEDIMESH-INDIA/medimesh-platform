import FrostedPanel from '../common/FrostedPanel';

export default function HospitalCardSkeleton() {
  return (
    <FrostedPanel variant="elevated" className="rounded-[20px] p-5 border-border/60 h-full flex flex-col min-w-0">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1 pr-2 space-y-2.5">
          <div className="h-6 bg-muted/60 rounded-md w-3/4 animate-pulse"></div>
          <div className="h-4 bg-muted/40 rounded-md w-1/2 animate-pulse mt-2"></div>
        </div>
        <div className="w-9 h-9 rounded-full bg-muted/40 animate-pulse shrink-0"></div>
      </div>
      
      <div className="mb-6 flex gap-2">
        <div className="w-16 h-5 bg-muted/40 rounded border border-border/30 animate-pulse"></div>
        <div className="w-20 h-5 bg-muted/40 rounded border border-border/30 animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 mt-auto">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col border border-border/40 rounded-xl p-2.5 bg-surface/30">
            <div className="w-10 h-2.5 bg-muted/40 rounded animate-pulse mb-2"></div>
            <div className="w-16 h-3.5 bg-muted/60 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-border/60 flex flex-col gap-4">
        <div className="w-1/2 h-4 bg-muted/40 rounded animate-pulse mb-1"></div>
        
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 sm:flex-none w-28 h-9 bg-muted/40 rounded-xl animate-pulse"></div>
          <div className="flex-1 sm:flex-none sm:ml-auto w-32 h-9 bg-muted/50 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </FrostedPanel>
  );
}
