import { cn } from '../../utils/cn';

export default function SectionEyebrow({ children, className }) {
  return (
    <p className={cn('text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary', className)}>
      {children}
    </p>
  );
}
