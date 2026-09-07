import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const styles = {
  pending: ['Awaiting doctor', Clock3, 'bg-amber-50 text-amber-800 border-amber-200'],
  confirmed: ['Confirmed', CheckCircle2, 'bg-emerald-50 text-emerald-800 border-emerald-200'],
  declined: ['Declined', XCircle, 'bg-rose-50 text-rose-700 border-rose-200'],
  cancelled: ['Cancelled', XCircle, 'bg-slate-50 text-slate-600 border-slate-200'],
  completed: ['Completed', CheckCircle2, 'bg-teal-50 text-teal-800 border-teal-200'],
};

export default function BookingStatusBadge({ status, className }) {
  const [label, Icon, tone] = styles[status] || styles.pending;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', tone, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

