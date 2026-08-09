import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const initParticles = async (engine) => {
  await loadSlim(engine);
};

export default function ParticleMesh() {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const options = useMemo(() => {
    // 60-110 for desktop, 25-40 for mobile
    const particleCount = isMobile ? 35 : 90;
    
    // Connection distance 120-180
    const linkDistance = isMobile ? 100 : 150;

    return {
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      
      // Allow window-level mouse detection so it works even when pointer-events-none
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: { 
            enable: !isMobile && !isReducedMotion, 
            mode: "grab" 
          },
          resize: true,
        },
        modes: {
          grab: { 
            distance: 200, 
            links: { opacity: 0.4 } 
          },
        },
      },
      
      particles: {
        color: { value: "#0A7A6A" }, // Muted MEDIMESH teal
        links: {
          color: "#1A332F", // Darker muted teal/grey
          distance: linkDistance,
          enable: true,
          opacity: 0.25, // 0.12 - 0.30
          width: 1.5,
        },
        move: {
          direction: "none",
          enable: !isReducedMotion,
          outModes: { default: "bounce" },
          random: true,
          speed: 0.4, // Slow movement
          straight: false,
        },
        number: {
          density: { enable: true, area: 800 },
          value: particleCount,
        },
        opacity: {
          value: { min: 0.35, max: 0.65 }, // 0.35 - 0.65
        },
        shape: { type: "circle" },
        size: {
          value: { min: 2, max: 4 }, // 2px - 4px
        },
      },
    };
  }, [isReducedMotion, isMobile]);

  return (
    <ParticlesProvider init={initParticles}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          id="tsparticles-medimesh"
          options={options}
          className="w-full h-full"
        />
      </div>
    </ParticlesProvider>
  );
}
