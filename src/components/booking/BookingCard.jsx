import { CalendarDays, MapPin, Stethoscope, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';
import { formatVisitDate } from '../../lib/utils/homeVisitFormatters';

export default function BookingCard({ booking, audience = 'patient', to }) {
  const subject = audience === 'doctor' ? booking.patientName : booking.doctor?.name;
  const SubjectIcon = audience === 'doctor' ? UserRound : Stethoscope;
  return (
    <Link to={to} className="group block rounded-[20px] border border-border/70 bg-white/80 p-5 shadow-[0_10px_32px_rgba(31,70,61,0.04)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_16px_40px_rgba(31,70,61,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{booking.reference}</p>
          <h3 className="mt-1 flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
            <SubjectIcon className="h-4 w-4 text-primary" aria-hidden="true" />
            {subject || 'Home visit'}
          </h3>
          {audience === 'patient' && booking.doctor?.specialization && <p className="mt-1 text-xs text-muted-foreground">{booking.doctor.specialization}</p>}
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      <div className="mt-5 grid gap-2 border-t border-border/50 pt-4 text-sm text-muted-foreground sm:grid-cols-2">
        <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{formatVisitDate(booking.date, booking.startTime)}</span>
        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{booking.address.locality}, {booking.address.city}</span>
      </div>
    </Link>
  );
}
