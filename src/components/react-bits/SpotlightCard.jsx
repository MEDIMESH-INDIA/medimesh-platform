import { useRef } from "react";
import { cn } from "../../utils/cn";

export default function SpotlightCard({ children, className }) {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    divRef.current.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  };

  const handleFocus = () => {
    divRef.current?.style.setProperty("--spotlight-opacity", "1");
  };

  const handleBlur = () => {
    divRef.current?.style.setProperty("--spotlight-opacity", "0");
  };

  const handleMouseEnter = () => {
    divRef.current?.style.setProperty("--spotlight-opacity", "1");
  };

  const handleMouseLeave = () => {
    divRef.current?.style.setProperty("--spotlight-opacity", "0");
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border border-border bg-surface overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
      style={{
          opacity: "var(--spotlight-opacity, 0)",
          background: "radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(10, 122, 106, 0.06), transparent 40%)",
        }}
      />
      {children}
    </div>
  );
}
