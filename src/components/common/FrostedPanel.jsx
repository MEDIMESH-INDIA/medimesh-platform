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
    subtle: "bg-white/65 border-white/70 shadow-[0_8px_30px_rgba(15,40,35,0.045)]",
    elevated: "bg-white/78 border-white/80 shadow-[0_18px_50px_rgba(15,40,35,0.07)]",
    floating: "bg-white/82 border-white/90 shadow-[0_24px_70px_rgba(15,40,35,0.1)]",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "border backdrop-blur-xl supports-[backdrop-filter]:bg-white/70",
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
