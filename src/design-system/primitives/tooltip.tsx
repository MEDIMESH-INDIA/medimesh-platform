'use client';

import React, { useState, useId } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
}

export function Tooltip({
  content,
  position = 'top',
  children,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? id : undefined,
      })}
      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1 text-xs font-body font-normal text-[var(--color-on-surface,#131b2e)] bg-[var(--color-surface-container-highest,#dae2fd)] border border-[var(--color-outline-variant,#bdc9c6)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] whitespace-nowrap pointer-events-none animate-in fade-in-50 duration-100',
            positionStyles[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
