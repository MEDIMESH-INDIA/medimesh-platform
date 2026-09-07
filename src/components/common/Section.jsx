import { cn } from "../../utils/cn";
import { forwardRef } from "react";
import Container from "./Container";

const Section = forwardRef(({ 
  className, 
  containerClassName,
  children, 
  withContainer = true,
  background = "transparent",
  ...props 
}, ref) => {
  const backgrounds = {
    transparent: "bg-transparent",
    muted: "bg-surface-elevated/40 backdrop-blur-sm",
    primary: "bg-primary text-white",
    white: "bg-surface/30 backdrop-blur-sm"
  };

  const content = withContainer ? (
    <Container className={containerClassName}>
      {children}
    </Container>
  ) : children;

  return (
    <section
      ref={ref}
      className={cn(
        "py-10 md:py-12 lg:py-14",
        backgrounds[background],
        className
      )}
      {...props}
    >
      {content}
    </section>
  );
});

Section.displayName = "Section";

export default Section;
