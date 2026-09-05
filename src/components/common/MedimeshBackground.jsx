import GraphPaperBackground from './GraphPaperBackground';
import MeshOverlay from './MeshOverlay';

export default function MedimeshBackground({ graph = 'medium', mesh = 'light' }) {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      <GraphPaperBackground intensity={graph} />
      <MeshOverlay intensity={mesh} />
      <div className="absolute -left-24 top-[14%] h-80 w-80 rounded-full bg-primary/[0.025] blur-3xl" />
      <div className="absolute -right-24 bottom-[12%] h-96 w-96 rounded-full bg-accent/[0.02] blur-3xl" />
    </div>
  );
}
