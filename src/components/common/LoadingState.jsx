import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex min-h-48 flex-col items-center justify-center gap-3 text-center ${className}`} role="status">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
