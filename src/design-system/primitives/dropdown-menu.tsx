'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error('Dropdown components must be used within <DropdownMenu>');
  }
  return ctx;
}

export interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownTrigger({ children }: DropdownTriggerProps) {
  const { isOpen, toggle } = useDropdown();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="true"
      aria-expanded={isOpen}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      className="inline-flex cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded-[var(--radius-md)]"
    >
      {children}
    </div>
  );
}

export interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'right';
  width?: string;
  children: React.ReactNode;
}

export function DropdownContent({
  align = 'left',
  width = 'w-56',
  className,
  children,
  ...props
}: DropdownContentProps) {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  return (
    <div
      role="menu"
      tabIndex={-1}
      className={cn(
        'absolute top-full mt-1.5 z-50 bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-1.5 flex flex-col gap-0.5 animate-in fade-in-50 zoom-in-95 duration-100',
        align === 'right' ? 'right-0' : 'left-0',
        width,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function DropdownItem({
  icon,
  className,
  children,
  onClick,
  ...props
}: DropdownItemProps) {
  const { setIsOpen } = useDropdown();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setIsOpen(false);
  };

  return (
    <button
      role="menuitem"
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs md:text-sm font-body text-[var(--color-on-surface)] rounded-[var(--radius-md)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)] transition-colors cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:bg-[var(--color-surface-container)] focus-visible:text-[var(--color-primary)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 text-[var(--color-primary)]">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function DropdownLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-outline)] font-label-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="h-[1px] bg-[var(--color-border-default)] my-1" role="separator" />;
}
