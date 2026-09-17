import React from 'react';
import { cn } from '@/lib/utils';
import { InfoIcon } from '@/components/global/icons';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'inset';
  elevation?: 'flat' | 'low' | 'raised';
}

export function Card({
  variant = 'default',
  elevation = 'low',
  className,
  children,
  ...props
}: CardProps) {
  const isInteractive = variant === 'interactive';
  const isInset = variant === 'inset';

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] transition-all duration-150',
        isInset
          ? 'bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)]'
          : 'bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)]',
        elevation === 'flat' && 'shadow-none',
        elevation === 'low' && !isInset && 'shadow-[var(--shadow-xs)]',
        elevation === 'raised' && !isInset && 'shadow-[var(--shadow-sm)]',
        isInteractive &&
          'cursor-pointer hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-outline-variant)] active:bg-[var(--color-surface-container-low)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1 p-4 md:p-6 pb-2 md:pb-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  as: Component = 'h3',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' }) {
  return (
    <Component
      className={cn(
        'font-heading font-semibold text-[var(--color-on-surface)] tracking-tight text-base md:text-lg',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 md:p-6 pt-2 md:pt-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-4 md:p-6 pt-0 border-t border-[var(--color-border-default)] mt-2 pt-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface InsetAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'neutral' | 'teal' | 'blue' | 'amber';
}

const insetStyles = {
  neutral: 'bg-[var(--color-surface-container-low)] border-[var(--color-border-default)] text-[var(--color-on-surface-variant)]',
  teal: 'bg-[var(--color-healthcare-anchor-bg,#f0fdfa)] border-[var(--color-healthcare-anchor-border,#ccfbf1)] text-[var(--color-healthcare-anchor,#0f766e)]',
  blue: 'bg-[var(--color-civic-blue-bg,#eff6ff)] border-[var(--color-civic-blue-border,#bfdbfe)] text-[var(--color-civic-blue,#2563eb)]',
  amber: 'bg-[var(--color-audit-amber-bg,#fef3c7)] border-[var(--color-audit-amber-border,#fde68a)] text-[var(--color-tertiary,#7d4200)]',
};

export function InsetArea({
  variant = 'neutral',
  className,
  children,
  ...props
}: InsetAreaProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border p-3 md:p-4 text-sm font-body',
        insetStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
  variant?: 'neutral' | 'teal' | 'blue' | 'amber';
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function InfoCard({
  title,
  icon,
  variant = 'neutral',
  action,
  children,
  className,
  ...props
}: InfoCardProps) {
  return (
    <InsetArea variant={variant} className={cn('flex items-start gap-3', className)} {...props}>
      <span className="shrink-0 mt-0.5">{icon || <InfoIcon size={18} />}</span>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-heading font-semibold text-sm mb-1 text-[var(--color-on-surface)]">
            {title}
          </h4>
        )}
        <div className="font-body text-xs md:text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
          {children}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </InsetArea>
  );
}
