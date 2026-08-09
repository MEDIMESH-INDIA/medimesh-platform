import GridBackground from "./GridBackground";
import ParticleMesh from "./ParticleMesh";
import AmbientGlow from "./AmbientGlow";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function InteractiveBackground({ variant = "default", withGrid = true }) {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <AmbientGlow variant={variant} />
      {withGrid && <GridBackground />}
      
      {/* 
        The particle canvas needs pointer-events-auto to capture mouse interactions 
        if we want hover effects. However, if we do that, we must ensure it doesn't 
        block clicks on the content above it. We'll set pointer-events-auto but ensure
        z-index is lower than content.
      */}
      {!isReducedMotion && (
        <div className="absolute inset-0 z-0" style={{ pointerEvents: "auto" }}>
          <ParticleMesh variant={variant} />
        </div>
      )}
    </div>
  );
}
