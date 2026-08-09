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
    muted: "bg-surface-elevated",
    primary: "bg-primary text-white",
    white: "bg-surface"
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
        "py-16 md:py-24 lg:py-32",
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
