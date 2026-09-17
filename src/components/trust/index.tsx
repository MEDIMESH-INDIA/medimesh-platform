import React from 'react';
import { cn, formatRelativeTime, isStale } from '@/lib/utils';
import type { Source, VerificationState } from '@/types';
import { StatusBadge } from '@/design-system/primitives/badge';
import {
  InfoIcon,
  ExternalLinkIcon,
  ClockIcon,
  ShieldIcon,
} from '@/components/global/icons';

// Re-export StatusBadge as VerificationBadge and SourceBadge for direct semantic imports
export function VerificationBadge({
  state,
  label,
  size = 'md',
  className,
}: {
  state: VerificationState;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return <StatusBadge verification={state} label={label} size={size} className={className} />;
}

export function SourceBadge({
  source,
  size = 'md',
  className,
}: {
  source: Source;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <StatusBadge
      verification={source.verificationState}
      label={source.sourceOrganization}
      size={size}
      className={className}
    />
  );
}

export interface FreshnessIndicatorProps {
  isoDate: string;
  reporter?: string;
  staleThresholdHours?: number;
  className?: string;
}

export function FreshnessIndicator({
  isoDate,
  reporter,
  staleThresholdHours = 48,
  className,
}: FreshnessIndicatorProps) {
  const stale = isStale(isoDate, staleThresholdHours);
  const relativeText = formatRelativeTime(isoDate);

  return (
    <div className={cn('inline-flex items-center gap-1.5 font-body text-xs', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          stale ? 'bg-[var(--color-tertiary)] animate-pulse' : 'bg-[var(--color-primary)]'
        )}
      />
      <span className={cn('font-medium', stale ? 'text-[var(--color-tertiary)]' : 'text-[var(--color-on-surface)]')}>
        {relativeText}
      </span>
      {reporter && (
        <span className="text-[var(--color-outline)]">
          · {reporter}
        </span>
      )}
      {stale && (
        <span className="text-[var(--color-tertiary)] font-semibold text-[11px] bg-[var(--color-audit-amber-bg,#fef3c7)] px-1.5 py-0.2 rounded border border-[var(--color-audit-amber-border,#fde68a)]">
          Needs update
        </span>
      )}
    </div>
  );
}

export function LastUpdated({
  isoDate,
  prefix = 'Updated',
  className,
}: {
  isoDate: string;
  prefix?: string;
  className?: string;
}) {
  const text = formatRelativeTime(isoDate);
  const displayText = prefix ? `${prefix} ${text.replace('Updated ', '')}` : text;

  return (
    <span className={cn('inline-flex items-center gap-1 font-body text-xs text-[var(--color-on-surface-variant)]', className)}>
      <ClockIcon size={13} className="text-[var(--color-outline)]" />
      <span>{displayText}</span>
    </span>
  );
}

export interface ProvenanceRowProps {
  label: string;
  value: React.ReactNode;
  source?: Source;
  className?: string;
}

export function ProvenanceRow({
  label,
  value,
  source,
  className,
}: ProvenanceRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-[var(--color-border-default)] gap-1.5 text-xs md:text-sm font-body',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-on-surface-variant)]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[var(--color-on-surface)]">{value}</span>
        {source && <VerificationBadge state={source.verificationState} size="sm" />}
      </div>
    </div>
  );
}

export interface SourceInfoProps {
  source: Source;
  className?: string;
}

export function SourceInfo({ source, className }: SourceInfoProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-surface-container-low,#f2f3ff)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-3 flex flex-col gap-2 font-body text-xs text-[var(--color-on-surface-variant)]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-label-sm uppercase font-semibold text-[var(--color-on-surface)]">
          Source Record
        </span>
        <VerificationBadge state={source.verificationState} size="sm" />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>Organization:</span>
          <span className="font-medium text-[var(--color-on-surface)]">
            {source.sourceOrganization}
          </span>
        </div>

        {source.sourceTitle && (
          <div className="flex items-center justify-between">
            <span>Title / Reference:</span>
            <span className="font-medium text-[var(--color-on-surface)]">
              {source.sourceTitle}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Last Confirmed:</span>
          <span>{source.lastUpdated}</span>
        </div>

        {source.verifiedBy && (
          <div className="flex items-center justify-between">
            <span>Verified By:</span>
            <span className="font-medium text-[var(--color-primary)]">
              {source.verifiedBy} ({source.verificationDate || 'Recent'})
            </span>
          </div>
        )}

        {source.sourceUrl && (
          <div className="pt-1 border-t border-[var(--color-border-default)] mt-1">
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium"
            >
              <span>View original source documentation</span>
              <ExternalLinkIcon size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export interface TrustPanelProps {
  title?: string;
  source?: Source;
  className?: string;
  children?: React.ReactNode;
}

export function TrustPanel({
  title = 'Information Verification & Provenance',
  source,
  className,
  children,
}: TrustPanelProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 md:p-6 shadow-[var(--shadow-xs)] flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] pb-2">
        <ShieldIcon size={18} className="text-[var(--color-primary)] shrink-0" />
        <h3 className="font-heading font-semibold text-sm md:text-base text-[var(--color-on-surface)]">
          {title}
        </h3>
      </div>

      <div className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed flex flex-col gap-2">
        {children ? (
          children
        ) : (
          <p>
            MEDIMESH provides transparent healthcare facility records aggregated from official public registries and direct facility disclosures. MEDIMESH verification confirms matching documentation and active institutional standing; it does not constitute a clinical endorsement or medical suitability rating.
          </p>
        )}
      </div>

      {source && <SourceInfo source={source} />}

      <div className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-md)] p-2.5 flex items-start gap-2 text-xs font-body text-[var(--color-on-surface-variant)]">
        <InfoIcon size={15} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <span>
          Always confirm critical admissions, specific doctor schedules, and emergency availability directly with the facility before travelling.
        </span>
      </div>
    </div>
  );
}
