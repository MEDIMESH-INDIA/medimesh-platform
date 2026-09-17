'use client';

import React, { createContext, useContext, useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@/components/global/icons';

interface AccordionContextValue {
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion components must be used within <Accordion>');
  }
  return ctx;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  children: React.ReactNode;
}

export function Accordion({
  type = 'single',
  defaultValue,
  className,
  children,
  ...props
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    if (!defaultValue) return new Set();
    if (Array.isArray(defaultValue)) return new Set(defaultValue);
    return new Set([defaultValue]);
  });

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(type === 'single' ? [] : prev);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem }}>
      <div className={cn('divide-y divide-[var(--color-border-default)] border-y border-[var(--color-border-default)] w-full', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  id: string;
  isExpanded: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.has(value);

  return (
    <AccordionItemContext.Provider value={{ id: value, isExpanded }}>
      <div className={cn('overflow-hidden', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const { toggleItem } = useAccordion();
  const itemCtx = useContext(AccordionItemContext);
  const triggerId = useId();

  if (!itemCtx) {
    throw new Error('AccordionTrigger must be used inside AccordionItem');
  }

  const { id, isExpanded } = itemCtx;

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={isExpanded}
      onClick={() => toggleItem(id)}
      className={cn(
        'flex w-full items-center justify-between py-4 text-left font-heading font-semibold text-sm md:text-base text-[var(--color-on-surface)] transition-colors hover:text-[var(--color-primary)] cursor-pointer select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDownIcon
        size={18}
        className={cn(
          'shrink-0 text-[var(--color-on-surface-variant)] transition-transform duration-200 ml-2',
          isExpanded && 'rotate-180 text-[var(--color-primary)]'
        )}
      />
    </button>
  );
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const itemCtx = useContext(AccordionItemContext);

  if (!itemCtx) {
    throw new Error('AccordionContent must be used inside AccordionItem');
  }

  const { isExpanded } = itemCtx;

  if (!isExpanded) return null;

  return (
    <div
      role="region"
      className={cn('pb-4 font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed animate-in fade-in-50 duration-150', className)}
      {...props}
    >
      {children}
    </div>
  );
}
