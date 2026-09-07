import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const FrostedPanel = forwardRef(({
  as: Component = "div",
  variant = "subtle",
  className,
  children,
  ...props
}, ref) => {
  const variants = {
    subtle: "bg-white/65 border-border/70 shadow-[0_2px_8px_rgba(15,40,35,0.025)]",
    elevated: "bg-white/78 border-border/75 shadow-[0_3px_14px_rgba(15,40,35,0.035)]",
    floating: "bg-white/82 border-white/90 shadow-[0_8px_28px_rgba(15,40,35,0.08)]",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "min-w-0 rounded-[20px] border backdrop-blur-xl supports-[backdrop-filter]:bg-white/70",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

FrostedPanel.displayName = "FrostedPanel";

export default FrostedPanel;
