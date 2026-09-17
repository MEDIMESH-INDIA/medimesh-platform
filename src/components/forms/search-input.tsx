'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { SearchIcon, CloseIcon, MicIcon, ArrowForwardIcon } from '@/components/global/icons';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  onClear?: () => void;
  onVoiceClick?: () => void;
  onSubmitSearch?: (value: string) => void;
  showVoiceButton?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onClear,
      onVoiceClick,
      onSubmitSearch,
      showVoiceButton = true,
      showSubmitButton = true,
      submitButtonText = 'Search',
      placeholder = 'Search by symptom, specialty, procedure, or hospital name...',
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const internalInputRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalInputRef;

    const hasValue = Boolean(value || (inputRef.current && inputRef.current.value));

    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
      }
      onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = (inputRef.current?.value || (typeof value === 'string' ? value : ''));
        onSubmitSearch?.(query);
      }
    };

    const handleSubmit = () => {
      const query = (inputRef.current?.value || (typeof value === 'string' ? value : ''));
      onSubmitSearch?.(query);
    };

    return (
      <div
        className={cn(
          'w-full bg-[var(--color-surface-container-lowest,#ffffff)] border border-[var(--color-border-input)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xs)] p-1.5 md:p-2 flex items-center gap-1.5 transition-all focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] focus-within:shadow-[var(--shadow-sm)]',
          disabled && 'opacity-60 pointer-events-none bg-[var(--color-surface-container-low)]',
          containerClassName
        )}
      >
        <div className="pl-2 flex items-center pointer-events-none text-[var(--color-primary)]">
          <SearchIcon size={20} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent py-1.5 px-2 font-body text-sm md:text-base text-[var(--color-on-surface)] placeholder:text-[var(--color-text-placeholder)] focus:outline-none min-w-0',
            className
          )}
          {...props}
        />

        <div className="flex items-center gap-1">
          {showVoiceButton && (
            <button
              type="button"
              onClick={onVoiceClick}
              aria-label="Search with voice"
              className="p-2 rounded-[var(--radius-md)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
            >
              <MicIcon size={18} />
            </button>
          )}

          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="p-2 rounded-[var(--radius-md)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
            >
              <CloseIcon size={16} />
            </button>
          )}

          {showSubmitButton && (
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] font-heading font-semibold text-xs md:text-sm px-4 md:px-5 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-primary-container)] active:bg-[#004843] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ml-1 select-none"
            >
              <span>{submitButtonText}</span>
              <ArrowForwardIcon size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
