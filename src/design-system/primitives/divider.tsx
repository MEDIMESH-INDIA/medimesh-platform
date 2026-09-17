import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  className,
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          'inline-block w-[1px] bg-[var(--color-border-default)] self-stretch min-h-[1em]',
          spacing === 'sm' && 'mx-2',
          spacing === 'md' && 'mx-4',
          spacing === 'lg' && 'mx-6',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <hr
      role="separator"
      className={cn(
        'w-full border-none h-[1px] bg-[var(--color-border-default)]',
        spacing === 'none' && 'my-0',
        spacing === 'sm' && 'my-2',
        spacing === 'md' && 'my-4',
        spacing === 'lg' && 'my-6',
        className
      )}
      {...props}
    />
  );
}
