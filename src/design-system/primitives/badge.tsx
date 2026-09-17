import React from 'react';
import { cn } from '@/lib/utils';
import type { VerificationState } from '@/types';
import {
  CheckCircleIcon,
  VerifiedIcon,
  InfoIcon,
  WarningIcon,
  ClockIcon,
} from '@/components/global/icons';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'error'
  | 'outline'
  | 'neutral';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border border-transparent',
  primary:
    'bg-[var(--color-healthcare-anchor-bg,#f0fdfa)] text-[var(--color-healthcare-anchor,#0f766e)] border border-[var(--color-healthcare-anchor-border,#ccfbf1)]',
  secondary:
    'bg-[var(--color-civic-blue-bg,#eff6ff)] text-[var(--color-civic-blue,#2563eb)] border border-[var(--color-civic-blue-border,#bfdbfe)]',
  warning:
    'bg-[var(--color-audit-amber-bg,#fef3c7)] text-[var(--color-tertiary,#7d4200)] border border-[var(--color-audit-amber-border,#fde68a)]',
  error:
    'bg-[var(--color-error-container,#ffdad6)] text-[var(--color-on-error-container,#93000a)] border border-transparent',
  outline:
    'bg-transparent text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]',
  neutral:
    'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border border-[var(--color-border-default)]',
};

const badgeSizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] font-medium px-2 py-0.5 gap-1 rounded-[var(--radius-sm)] tracking-tight',
  md: 'text-xs font-semibold px-2.5 py-1 gap-1.5 rounded-[var(--radius-default)]',
};

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-body shrink-0 select-none',
        badgeVariantStyles[variant],
        badgeSizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export type GenericStatus =
  | 'active'
  | 'inactive'
  | 'unavailable'
  | 'pending'
  | 'updated'
  | 'stale';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: GenericStatus;
  verification?: VerificationState;
  size?: BadgeSize;
  label?: string;
}

export function StatusBadge({
  status,
  verification,
  size = 'md',
  label,
  className,
  ...props
}: StatusBadgeProps) {
  // If verification state is provided, map strictly to MEDIMESH Trust Architecture
  if (verification) {
    switch (verification) {
      case 'MEDIMESH_VERIFIED':
        return (
          <Badge
            variant="primary"
            size={size}
            icon={<VerifiedIcon size={size === 'sm' ? 12 : 14} />}
            className={className}
            title="Verified by MEDIMESH against primary source documentation"
            {...props}
          >
            {label || 'MEDIMESH Verified'}
          </Badge>
        );

      case 'FACILITY_REPORTED':
        return (
          <Badge
            variant="primary"
            size={size}
            icon={<CheckCircleIcon size={size === 'sm' ? 12 : 14} />}
            className={className}
            title="Directly reported by healthcare facility administration"
            {...props}
          >
            {label || 'Facility-reported'}
          </Badge>
        );

      case 'PUBLIC_SOURCE':
        return (
          <Badge
            variant="secondary"
            size={size}
            icon={<InfoIcon size={size === 'sm' ? 12 : 14} />}
            className={className}
            title="Aggregated from public registry or gazette records"
            {...props}
          >
            {label || 'Public source'}
          </Badge>
        );

      case 'PENDING_VERIFICATION':
        return (
          <Badge
            variant="warning"
            size={size}
            icon={<ClockIcon size={size === 'sm' ? 12 : 14} />}
            className={className}
            title="Submitted data currently under verification review"
            {...props}
          >
            {label || 'Verification Pending'}
          </Badge>
        );

      case 'NOT_CONFIRMED':
      default:
        return (
          <Badge
            variant="neutral"
            size={size}
            icon={<InfoIcon size={size === 'sm' ? 12 : 14} />}
            className={className}
            title="Insufficient public or facility information to confirm"
            {...props}
          >
            {label || 'Not confirmed'}
          </Badge>
        );
    }
  }

  // Generic operational status mapping
  switch (status) {
    case 'active':
      return (
        <Badge
          variant="primary"
          size={size}
          icon={<span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />}
          className={className}
          {...props}
        >
          {label || 'Active'}
        </Badge>
      );

    case 'updated':
      return (
        <Badge
          variant="secondary"
          size={size}
          icon={<ClockIcon size={size === 'sm' ? 12 : 14} />}
          className={className}
          {...props}
        >
          {label || 'Updated'}
        </Badge>
      );

    case 'pending':
      return (
        <Badge
          variant="warning"
          size={size}
          icon={<ClockIcon size={size === 'sm' ? 12 : 14} />}
          className={className}
          {...props}
        >
          {label || 'Pending'}
        </Badge>
      );

    case 'stale':
      return (
        <Badge
          variant="warning"
          size={size}
          icon={<WarningIcon size={size === 'sm' ? 12 : 14} />}
          className={className}
          {...props}
        >
          {label || 'Needs update'}
        </Badge>
      );

    case 'unavailable':
    case 'inactive':
      return (
        <Badge
          variant="error"
          size={size}
          icon={<span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)]" />}
          className={className}
          {...props}
        >
          {label || (status === 'unavailable' ? 'Unavailable' : 'Inactive')}
        </Badge>
      );

    default:
      return (
        <Badge variant="default" size={size} className={className} {...props}>
          {label || 'Status'}
        </Badge>
      );
  }
}
