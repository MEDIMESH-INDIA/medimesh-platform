import { useLocation } from 'react-router-dom';
import GridBackground from "../effects/GridBackground";
import ParticleMesh from "../effects/ParticleMesh";

export default function MEDIMESHBackground() {
  const location = useLocation();
  const path = location.pathname;

  // Configuration for different authenticated routes
  let gridOpacity = 0.8;
  let meshOpacity = 0.4; // relative to landing page
  let showNodes = true;

  if (path === '/app') {
    meshOpacity = 0.5;
  } else if (path.includes('/app/discover')) {
    meshOpacity = 0.5;
  } else if (path.includes('/app/hospitals')) {
    meshOpacity = 0.3;
  } else if (path.includes('/app/compare') || path.includes('/app/saved')) {
    meshOpacity = 0.15;
  } else {
    // Settings, Profile
    meshOpacity = 0;
    showNodes = false;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background color base */}
      <div className="absolute inset-0 bg-[#FDFBF7]" />
      
      {/* Engineering Notebook Grid */}
      <div className="absolute inset-0" style={{ opacity: gridOpacity }}>
        <GridBackground />
      </div>
      
      {/* Dynamic Particle Mesh */}
      {meshOpacity > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{ opacity: meshOpacity }}>
          <ParticleMesh />
        </div>
      )}

      {/* Floating conceptual nodes */}
      {showNodes && (
        <>
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#0A7A6A] opacity-[0.02] blur-3xl pointer-events-none" />
          <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-[#0A7A6A] opacity-[0.015] blur-3xl pointer-events-none" />
          <div className="absolute top-[50%] left-[30%] w-80 h-80 rounded-full bg-[#339989] opacity-[0.02] blur-3xl pointer-events-none" />
        </>
      )}
    </div>
  );
}
