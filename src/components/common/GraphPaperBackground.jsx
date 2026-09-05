import { cn } from '../../utils/cn';

const opacityClasses = {
  full: 'opacity-100',
  medium: 'opacity-70',
  light: 'opacity-45',
};

export default function GraphPaperBackground({ intensity = 'medium', className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0 bg-graph-paper', opacityClasses[intensity], className)}
    />
  );
}
