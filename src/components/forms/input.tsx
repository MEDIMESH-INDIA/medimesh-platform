import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      disabled,
      required,
      id: customId,
      className,
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
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[var(--color-outline)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            className={cn(
              'w-full bg-[var(--color-surface-container-lowest,#ffffff)] text-[var(--color-on-surface)] font-body text-sm rounded-[var(--radius-md)] border transition-all duration-150',
              'py-2 px-3',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              hasError
                ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-1 focus:ring-[var(--color-error)]'
                : 'border-[var(--color-border-input)] hover:border-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--color-surface-container-low)]',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[var(--color-outline)]">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
