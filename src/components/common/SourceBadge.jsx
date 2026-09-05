import { Database } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function SourceBadge({ children = 'Source not provided', className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white/65 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground backdrop-blur-md', className)}>
      <Database className="h-3 w-3 text-primary" />
      {children}
    </span>
  );
}
