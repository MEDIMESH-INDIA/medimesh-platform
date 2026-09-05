import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const FormField = forwardRef(({
  label,
  id,
  helpText,
  error,
  success,
  className,
  inputClassName,
  as: Component = 'input',
  children,
  ...props
}, ref) => {
  const message = error || success || helpText;
  const messageId = message ? `${id}-message` : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label htmlFor={id} className="block text-sm font-semibold text-foreground">{label}</label>}
      <Component
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          'min-h-12 w-full rounded-[13px] border border-border bg-white/75 px-4 py-3 text-sm text-foreground shadow-sm outline-none backdrop-blur-md transition duration-200 placeholder:text-muted-foreground/55 hover:border-foreground/20 focus:-translate-y-px focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-elevated disabled:text-muted-foreground',
          error && 'border-destructive/50 focus:border-destructive focus:ring-destructive/10',
          inputClassName,
        )}
        {...props}
      >
        {children}
      </Component>
      {message && (
        <p id={messageId} className={cn('text-xs leading-5 text-muted-foreground', error && 'text-destructive', success && 'text-primary')}>
          {message}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
