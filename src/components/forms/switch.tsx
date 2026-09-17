import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  helperText?: string;
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  helperText,
  id: customId,
  className,
}: SwitchProps) {
  const generatedId = useId();
  const id = customId || generatedId;

  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (checked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <div className="inline-flex items-center gap-3">
        <button
          type="button"
          role="switch"
          id={id}
          aria-checked={isChecked}
          disabled={disabled}
          onClick={toggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
            isChecked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-container-high)]',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            className
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
              isChecked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>

        {label && (
          <label
            htmlFor={id}
            onClick={toggle}
            className={cn(
              'font-body text-xs md:text-sm text-[var(--color-on-surface)] cursor-pointer select-none leading-tight',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>

      {helperText && (
        <span className="font-body text-xs text-[var(--color-on-surface-variant)] pl-14">
          {helperText}
        </span>
      )}
    </div>
  );
}
