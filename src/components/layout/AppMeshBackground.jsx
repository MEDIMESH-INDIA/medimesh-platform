import { useMemo } from 'react';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useLocation } from 'react-router-dom';

const initParticles = async (engine) => {
  await loadSlim(engine);
};

export default function AppMeshBackground() {
  const location = useLocation();

  // Determine intensity based on route
  const getRouteConfig = () => {
    const path = location.pathname;
    if (path === '/app') return { count: 35, opacity: 0.15, speed: 0.3 };
    if (path.includes('/app/discover')) return { count: 45, opacity: 0.2, speed: 0.4 };
    if (path.includes('/app/hospital')) return { count: 20, opacity: 0.1, speed: 0.2 };
    return { count: 30, opacity: 0.15, speed: 0.3 };
  };

  const routeConfig = getRouteConfig();

  const options = useMemo(() => ({
    fullScreen: { enable: true, zIndex: 0 },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: true, mode: "grab" },
        resize: true,
      },
      modes: {
        grab: { distance: 150, links: { opacity: routeConfig.opacity * 1.5 } },
      },
    },
    particles: {
      color: { value: "#0A7A6A" },
      links: {
        color: "#1A332F",
        distance: 120,
        enable: true,
        opacity: routeConfig.opacity,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: true,
        speed: routeConfig.speed,
        straight: false,
      },
      number: {
        density: { enable: true, area: 800 },
        value: routeConfig.count,
      },
      opacity: {
        value: { min: routeConfig.opacity * 0.8, max: routeConfig.opacity * 1.2 },
      },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2.5 } },
    },
  }), [routeConfig.count, routeConfig.opacity, routeConfig.speed]);

  return (
    <ParticlesProvider init={initParticles}>
      <Particles id="app-mesh-tsparticles" options={options} className="fixed inset-0 pointer-events-none z-0" />
    </ParticlesProvider>
  );
}
