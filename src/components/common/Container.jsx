import { cn } from "../../utils/cn";
import { forwardRef } from "react";

const Container = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = "Container";

export default Container;
