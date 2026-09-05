import { cn } from "../../utils/cn";
import { forwardRef } from "react";

const Button = forwardRef(({ 
  as: Component = "button",
  className, 
  variant = "primary", 
  size = "md", 
  disabled, 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[13px] font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-[0_8px_22px_rgba(10,122,106,0.16)] hover:shadow-[0_11px_28px_rgba(10,122,106,0.22)] hover:-translate-y-0.5",
    secondary: "bg-secondary-accent text-white hover:bg-[#c2655d] shadow-sm hover:shadow hover:-translate-y-0.5",
    outline: "border border-border bg-white/60 backdrop-blur-md hover:bg-white text-foreground hover:border-primary/25 hover:-translate-y-0.5",
    ghost: "bg-transparent hover:bg-surface-elevated text-foreground active:bg-border",
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-base",
    lg: "h-14 px-8 text-lg",
  };
  
  return (
    <Component
      ref={ref}
      disabled={Component === "button" ? disabled : undefined}
      aria-disabled={Component !== "button" && disabled ? true : undefined}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
});

Button.displayName = "Button";

export default Button;
