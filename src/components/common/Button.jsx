import { cn } from "../../utils/cn";
import { forwardRef } from "react";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  disabled, 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-secondary-accent text-white hover:opacity-90",
    outline: "border border-border bg-transparent hover:bg-surface-elevated text-foreground",
    ghost: "bg-transparent hover:bg-surface-elevated text-foreground",
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-base",
    lg: "h-14 px-8 text-lg",
  };
  
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
