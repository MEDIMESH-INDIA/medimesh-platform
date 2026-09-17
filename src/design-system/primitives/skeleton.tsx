import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-[var(--color-surface-container-high)] rounded-[var(--radius-md)] animate-pulse',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn('flex flex-col gap-2 w-full', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5',
            i === 0 && 'w-full',
            i === 1 && 'w-4/5',
            i === 2 && 'w-3/5',
            i > 2 && 'w-2/3'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      style={{ width: size, height: size }}
      className={cn('rounded-full shrink-0', className)}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-4 md:p-6 bg-[var(--color-surface-container-lowest)] flex flex-col gap-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-20 rounded-[var(--radius-sm)]" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-8 w-24 rounded-[var(--radius-md)]" />
        <Skeleton className="h-8 w-28 rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}
