import ParticleMesh from '../effects/ParticleMesh';
import { cn } from '../../utils/cn';

const opacityClasses = {
  full: 'opacity-100',
  medium: 'opacity-50',
  light: 'opacity-25',
  minimal: 'opacity-10',
  none: 'hidden',
};

export default function MeshOverlay({ intensity = 'light', className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0 pointer-events-none', opacityClasses[intensity], className)}
    >
      <ParticleMesh />
    </div>
  );
}
