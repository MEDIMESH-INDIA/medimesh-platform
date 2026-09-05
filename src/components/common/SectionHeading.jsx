import { cn } from "../../utils/cn";

export default function SectionHeading({ 
  eyebrow, 
  title, 
  description, 
  alignment = "left", 
  className 
}) {
  const alignments = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto"
  };

  return (
    <div className={cn("max-w-3xl mb-8 md:mb-10", alignments[alignment], className)}>
      {eyebrow && (
        <span className="inline-block mb-3 text-sm font-semibold tracking-wider uppercase text-primary">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-lg md:text-xl text-muted-foreground text-balance">
          {description}
        </p>
      )}
    </div>
  );
}
