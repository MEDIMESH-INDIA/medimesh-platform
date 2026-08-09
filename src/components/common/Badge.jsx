import { cn } from "../../utils/cn";

export default function Badge({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-primary/10 text-primary hover:bg-primary/20",
    success: "bg-success/10 text-success hover:bg-success/20",
    neutral: "bg-surface-elevated text-foreground hover:bg-border",
    outline: "border border-border text-foreground",
  };
  
  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
