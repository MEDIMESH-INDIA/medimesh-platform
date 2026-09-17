'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/primitives/button';
import {
  SearchIcon,
  ErrorIcon,
  WifiOffIcon,
  SpinnerIcon,
  RefreshIcon,
} from '@/components/global/icons';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No matching healthcare information found',
  description = 'Try adjusting your search terms, removing active filters, or selecting a broader geographical area.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-container-low,#f2f3ff)] max-w-lg mx-auto my-6',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-primary)] mb-4">
        {icon || <SearchIcon size={24} />}
      </div>

      <h3 className="font-heading font-semibold text-base md:text-lg text-[var(--color-on-surface)] mb-2">
        {title}
      </h3>

      <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Unable to display healthcare information',
  description = 'An unexpected error occurred while loading this section. Healthcare records remain safe and unaffected. Please retry.',
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[var(--radius-lg)] border border-[var(--color-error-container)] bg-[var(--color-surface-container-lowest,#ffffff)] max-w-md mx-auto my-6 shadow-sm',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--color-error-container)] text-[var(--color-on-error-container)] flex items-center justify-center mb-4">
        <ErrorIcon size={24} />
      </div>

      <h3 className="font-heading font-semibold text-base md:text-lg text-[var(--color-on-surface)] mb-2">
        {title}
      </h3>

      <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            leftIcon={<RefreshIcon size={16} />}
          >
            Try again
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}

export interface OfflineBannerProps {
  lastUpdatedDate?: string;
  className?: string;
}

export function OfflineBanner({ lastUpdatedDate, className }: OfflineBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'w-full bg-[var(--color-inverse-surface,#283044)] text-[var(--color-inverse-on-surface,#eef0ff)] px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-body shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-2 max-w-2xl">
        <WifiOffIcon size={16} className="text-[var(--color-tertiary-fixed)] shrink-0" />
        <span>
          <strong>You are currently offline.</strong> Showing locally available information.
          {lastUpdatedDate && ` Last refreshed: ${lastUpdatedDate}.`}
        </span>
      </div>
      <div className="shrink-0 font-medium text-[11px] text-[var(--color-inverse-on-surface)]/80">
        Reconnecting...
      </div>
    </div>
  );
}

export function PageLoadingState({ message = 'Loading healthcare information...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
      <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-primary)] mb-4 animate-pulse">
        <SpinnerIcon size={24} />
      </div>
      <p className="font-body text-sm text-[var(--color-on-surface-variant)]">
        {message}
      </p>
    </div>
  );
}

export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-body text-[var(--color-on-surface-variant)]">
      <SpinnerIcon size={14} className="text-[var(--color-primary)]" />
      <span>{text}</span>
    </div>
  );
}

export function NotFoundState({
  title = 'Information Not Found',
  description = 'The requested healthcare facility or directory entry could not be located.',
  onReturnHome,
}: {
  title?: string;
  description?: string;
  onReturnHome?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onReturnHome ? (
          <Button variant="primary" onClick={onReturnHome}>
            Return to discovery
          </Button>
        ) : null
      }
    />
  );
}
