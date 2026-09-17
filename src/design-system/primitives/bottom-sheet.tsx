'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { CloseIcon } from '@/components/global/icons';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-[var(--color-on-surface,#131b2e)]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
        tabIndex={-1}
        className={cn(
          'w-full max-h-[85vh] flex flex-col bg-[var(--color-surface-container-lowest,#ffffff)] border-t border-[var(--color-border-default)] rounded-t-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden animate-in slide-in-from-bottom duration-200',
          className
        )}
      >
        {/* Grab Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-outline-variant)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-default)]">
          <div className="flex flex-col">
            {title && (
              <h2 id="sheet-title" className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="font-body text-xs text-[var(--color-on-surface-variant)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            className="p-2 -mr-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-full transition-colors cursor-pointer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 font-body text-sm text-[var(--color-on-surface)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function BottomSheetFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 p-4 border-t border-[var(--color-border-default)] bg-[var(--color-surface-container-lowest)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
