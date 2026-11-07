export default function HospitalCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 sm:p-5 border border-border/80 bg-white h-full flex flex-col min-w-0 shadow-2xs">
      {/* Top Row: Icon Badge & Save Button Skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#E6F4F1]/60 animate-pulse shrink-0" />
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-border/80 bg-muted/20 animate-pulse shrink-0" />
      </div>

      {/* Hospital Name Skeleton */}
      <div className="space-y-1.5 mt-2.5 mb-1">
        <div className="h-5 sm:h-5.5 bg-muted/40 rounded-md w-4/5 animate-pulse" />
        <div className="h-5 sm:h-5.5 bg-muted/30 rounded-md w-3/5 animate-pulse" />
      </div>

      {/* Location Skeleton */}
      <div className="h-3.5 bg-muted/30 rounded-md w-1/2 mb-1.5 animate-pulse" />

      {/* Specialties Skeleton */}
      <div className="h-4 bg-muted/20 rounded-md w-2/3 mb-1.5 animate-pulse" />

      {/* Type Pill Skeleton */}
      <div className="w-20 h-5 rounded-md bg-[#F5EFE6]/70 mb-2.5 animate-pulse" />

      {/* 2x2 Facilities Grid Skeleton */}
      <div className="rounded-xl bg-[#EEF7F4]/60 border border-[#D5EAE2] grid grid-cols-2 mb-2.5 sm:mb-3 overflow-hidden animate-pulse">
        <div className="p-2 sm:p-2.5 border-r border-b border-[#D5EAE2] h-10 sm:h-11 bg-muted/10" />
        <div className="p-2 sm:p-2.5 border-b border-[#D5EAE2] h-10 sm:h-11 bg-muted/10" />
        <div className="p-2 sm:p-2.5 border-r border-[#D5EAE2] h-10 sm:h-11 bg-muted/10" />
        <div className="p-2 sm:p-2.5 h-10 sm:h-11 bg-muted/10" />
      </div>

      {/* Provenance Skeleton */}
      <div className="flex items-center gap-1.5 mb-2.5 mt-auto">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
        <div className="h-3 bg-muted/30 rounded w-1/3 animate-pulse" />
      </div>

      {/* Footer Action Buttons Skeleton */}
      <div className="flex items-center gap-2.5 pt-1 mt-auto">
        <div className="flex-1 h-9 sm:h-10 rounded-xl border border-border/80 bg-muted/20 animate-pulse" />
        <div className="flex-1 h-9 sm:h-10 rounded-xl bg-primary/30 animate-pulse" />
      </div>
    </div>
  );
}
