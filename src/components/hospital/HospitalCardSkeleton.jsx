export default function HospitalCardSkeleton() {
  return (
    <div className="rounded-3xl p-5 sm:p-6 border border-border/80 bg-white h-full flex flex-col min-w-0 shadow-2xs">
      {/* Top Row: Icon Badge & Save Button Skeleton */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E6F4F1]/60 animate-pulse shrink-0" />
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-border/80 bg-muted/20 animate-pulse shrink-0" />
      </div>

      {/* Hospital Name Skeleton */}
      <div className="space-y-2 mb-2">
        <div className="h-6 bg-muted/40 rounded-md w-4/5 animate-pulse" />
        <div className="h-6 bg-muted/30 rounded-md w-3/5 animate-pulse" />
      </div>

      {/* Location Skeleton */}
      <div className="h-4 bg-muted/30 rounded-md w-1/2 mb-2 animate-pulse" />

      {/* Specialties Skeleton */}
      <div className="h-4 bg-muted/20 rounded-md w-2/3 mb-3 animate-pulse" />

      {/* Type Pill Skeleton */}
      <div className="w-24 h-6 rounded-lg bg-[#F5EFE6]/70 mb-4 animate-pulse" />

      {/* 2x2 Facilities Grid Skeleton */}
      <div className="rounded-2xl bg-[#EEF7F4]/60 border border-[#D5EAE2] grid grid-cols-2 mb-4 overflow-hidden animate-pulse">
        <div className="p-3 sm:p-3.5 border-r border-b border-[#D5EAE2] h-14 bg-muted/10" />
        <div className="p-3 sm:p-3.5 border-b border-[#D5EAE2] h-14 bg-muted/10" />
        <div className="p-3 sm:p-3.5 border-r border-[#D5EAE2] h-14 bg-muted/10" />
        <div className="p-3 sm:p-3.5 h-14 bg-muted/10" />
      </div>

      {/* Provenance Skeleton */}
      <div className="flex items-center gap-2 mb-4 mt-auto">
        <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
        <div className="h-3.5 bg-muted/30 rounded w-1/3 animate-pulse" />
      </div>

      {/* Footer Action Buttons Skeleton */}
      <div className="flex items-center gap-3 pt-1 mt-auto">
        <div className="flex-1 h-11 sm:h-12 rounded-xl border border-border/80 bg-muted/20 animate-pulse" />
        <div className="flex-1 h-11 sm:h-12 rounded-xl bg-primary/30 animate-pulse" />
      </div>
    </div>
  );
}
