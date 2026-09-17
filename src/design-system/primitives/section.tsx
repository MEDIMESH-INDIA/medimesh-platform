import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide';
}

export function Container({
  size = 'default',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 md:px-8',
        size === 'default' && 'max-w-[1280px]',
        size === 'narrow' && 'max-w-[768px]',
        size === 'wide' && 'max-w-[1440px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

export function Section({
  spacing = 'md',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        spacing === 'sm' && 'py-4 md:py-6',
        spacing === 'md' && 'py-8 md:py-12',
        spacing === 'lg' && 'py-12 md:py-16',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6',
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            {eyebrow}
          </span>
        )}
        <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-on-surface)] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="font-body text-sm text-[var(--color-on-surface-variant)] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 self-start md:self-end">{action}</div>}
    </div>
  );
}
