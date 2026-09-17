'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  BookmarkIcon,
  BookmarkFilledIcon,
  ScaleIcon,
  CloseIcon,
  InfoIcon,
} from '@/components/global/icons';

export interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSaved: boolean;
  onToggleSave?: () => void;
  label?: string;
  showText?: boolean;
}

export function SaveButton({
  isSaved,
  onToggleSave,
  label = 'Save',
  showText = false,
  className,
  ...props
}: SaveButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove from saved items` : `Save item`}
      onClick={onToggleSave}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 transition-all duration-150 select-none cursor-pointer',
        showText
          ? 'px-3 py-1.5 rounded-[var(--radius-md)] text-xs md:text-sm font-semibold border'
          : 'w-10 h-10 rounded-[var(--radius-md)]',
        isSaved
          ? 'bg-[var(--color-surface-container)] text-[var(--color-primary)] border-[var(--color-primary-container)]'
          : 'bg-transparent text-[var(--color-outline)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        className
      )}
      {...props}
    >
      {isSaved ? (
        <BookmarkFilledIcon size={18} className="text-[var(--color-primary)]" />
      ) : (
        <BookmarkIcon size={18} />
      )}
      {showText && <span>{isSaved ? 'Saved' : label}</span>}
    </button>
  );
}

export interface CompareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isComparing: boolean;
  onToggleCompare?: () => void;
  disabled?: boolean;
  label?: string;
  showText?: boolean;
}

export function CompareButton({
  isComparing,
  onToggleCompare,
  disabled = false,
  label = 'Compare',
  showText = true,
  className,
  ...props
}: CompareButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isComparing}
      aria-label={isComparing ? `Remove from comparison` : `Add to comparison`}
      disabled={disabled}
      onClick={onToggleCompare}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 transition-all duration-150 select-none cursor-pointer',
        showText
          ? 'px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs md:text-sm font-semibold border'
          : 'w-10 h-10 rounded-[var(--radius-md)] border',
        isComparing
          ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary-container)] shadow-xs'
          : 'bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] border-[var(--color-border-default)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      <ScaleIcon size={16} />
      {showText && <span>{isComparing ? 'Comparing' : label}</span>}
    </button>
  );
}

export function RemoveCompareButton({
  onRemove,
  label = 'Remove',
  className,
}: {
  onRemove: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove item from comparison"
      className={cn(
        'inline-flex items-center gap-1 text-xs font-body text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors p-1 rounded cursor-pointer',
        className
      )}
    >
      <CloseIcon size={14} />
      <span>{label}</span>
    </button>
  );
}

export function ComparisonLimitNotice({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'bg-[var(--color-surface-container-low)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-3 flex items-start gap-2 text-xs font-body text-[var(--color-on-surface-variant)]',
        className
      )}
    >
      <InfoIcon size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
      <div>
        <strong className="text-[var(--color-on-surface)] font-semibold block mb-0.5">
          Comparison Limit (2 Facilities Maximum)
        </strong>
        <span>
          To maintain side-by-side legibility and unbiased evaluation, you can compare up to 2 items at a time. Remove one facility to add another.
        </span>
      </div>
    </div>
  );
}
