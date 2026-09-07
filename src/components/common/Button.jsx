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
  const baseStyles = "inline-flex items-center justify-center rounded-[13px] font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-sm hover:-translate-y-px",
    secondary: "border border-border bg-white/75 text-foreground hover:bg-white hover:border-primary/25 hover:-translate-y-px",
    outline: "border border-border bg-white/60 backdrop-blur-md hover:bg-white text-foreground hover:border-primary/25 hover:-translate-y-px",
    ghost: "bg-transparent hover:bg-surface-elevated text-foreground active:bg-border",
  };
  
  const sizes = {
    sm: "h-10 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
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
