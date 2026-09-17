import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@/components/global/icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  options?: SelectOption[];
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      errorText,
      options,
      disabled,
      required,
      id: customId,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorText);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="font-label-md text-xs md:text-sm font-semibold text-[var(--color-on-surface)] select-none"
          >
            {label}
            {required && <span className="text-[var(--color-error)] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            className={cn(
              'w-full appearance-none bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] font-body text-sm rounded-[var(--radius-md)] border transition-all duration-150',
              'py-2 pl-3 pr-10 cursor-pointer',
              hasError
                ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-1 focus:ring-[var(--color-error)]'
                : 'border-[var(--color-border-input)] hover:border-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--color-surface-container-low)]',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3 pointer-events-none text-[var(--color-outline)]">
            <ChevronDownIcon size={16} />
          </div>
        </div>

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

Select.displayName = 'Select';
