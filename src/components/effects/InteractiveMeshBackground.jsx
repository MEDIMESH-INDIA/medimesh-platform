import GridBackground from "./GridBackground";
import ParticleMesh from "./ParticleMesh";

export default function InteractiveMeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background color base */}
      <div className="absolute inset-0 bg-[#FDFBF7]" />
      
      {/* Engineering Notebook Grid */}
      <GridBackground />
      
      {/* Dynamic Particle Mesh */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <ParticleMesh />
      </div>

      {/* Floating conceptual nodes (abstract large faint circles) */}
      <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-[#0A7A6A] opacity-[0.03] blur-3xl pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[30%] right-[10%] w-96 h-96 rounded-full bg-[#0A7A6A] opacity-[0.02] blur-3xl pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[60%] left-[40%] w-80 h-80 rounded-full bg-[#339989] opacity-[0.03] blur-3xl pointer-events-none mix-blend-multiply" />
    </div>
  );
}
