import React, { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorText,
      showCharCount = false,
      maxLength,
      disabled,
      required,
      id: customId,
      className,
      value,
      defaultValue,
      onChange,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorText);

    const [charCount, setCharCount] = useState<number>(() => {
      if (typeof value === 'string') return value.length;
      if (typeof defaultValue === 'string') return defaultValue.length;
      return 0;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={id}
              className="font-label-md text-xs md:text-sm font-semibold text-[var(--color-on-surface)] select-none"
            >
              {label}
              {required && <span className="text-[var(--color-error)] ml-1">*</span>}
            </label>
            {showCharCount && maxLength && (
              <span className="font-numeric-data text-xs text-[var(--color-outline)]">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className={cn(
            'w-full bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] font-body text-sm rounded-[var(--radius-md)] border p-3 transition-all duration-150',
            hasError
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-1 focus:ring-[var(--color-error)]'
              : 'border-[var(--color-border-input)] hover:border-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
            disabled && 'opacity-50 cursor-not-allowed bg-[var(--color-surface-container-low)]',
            className
          )}
          {...props}
        />

        {hasError ? (
          <p id={`${id}-error`} role="alert" className="font-body text-xs text-[var(--color-error)] mt-0.5">
            {errorText}
          </p>
        ) : helperText ? (
          <p id={`${id}-helper`} className="font-body text-xs text-[var(--color-on-surface-variant)] mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
