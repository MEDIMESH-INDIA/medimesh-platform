import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@/components/global/icons';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  helperText?: string;
  errorText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      errorText,
      disabled,
      checked,
      defaultChecked,
      id: customId,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          className={cn(
            'inline-flex items-start gap-2.5 cursor-pointer select-none group',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={id}
              checked={checked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                'w-4 h-4 rounded-[var(--radius-sm)] border border-[var(--color-border-input)] bg-[var(--color-surface-container-lowest,#ffffff)] transition-all duration-150',
                'group-hover:border-[var(--color-primary)]',
                'peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] peer-checked:text-[var(--color-on-primary)]',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-primary)]',
                errorText && 'border-[var(--color-error)]',
                className
              )}
            />
            <CheckIcon
              size={12}
              className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
            />
          </div>

          {label && (
            <div className="flex flex-col">
              <span className="font-body text-xs md:text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                {label}
              </span>
              {helperText && (
                <span className="font-body text-xs text-[var(--color-on-surface-variant)] mt-0.5 leading-snug">
                  {helperText}
                </span>
              )}
            </div>
          )}
        </label>

        {errorText && (
          <p role="alert" className="font-body text-xs text-[var(--color-error)] pl-6">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
