import { useMemo, useState } from 'react';
import { CalendarDays, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import BookingCard from '../../../components/booking/BookingCard';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import LoadingState from '../../../components/common/LoadingState';
import { useHomeVisitBookings } from '../../../hooks/useHomeVisitBookings';

const FILTERS = [
  ['upcoming', 'Upcoming'],
  ['pending', 'Pending'],
  ['past', 'Past'],
];

export default function PatientHomeVisitBookings() {
  const { bookings, loading, error } = useHomeVisitBookings();
  const [filter, setFilter] = useState('upcoming');
  const filtered = useMemo(() => {
    const now = new Date();
    return bookings.filter(item => {
      const visit = new Date(`${item.date}T${item.startTime}`);
      if (filter === 'pending') return item.status === 'pending';
      if (filter === 'past') return visit < now || ['declined', 'cancelled', 'completed'].includes(item.status);
      return visit >= now && item.status === 'confirmed';
    });
  }, [bookings, filter]);

  return (
    <AppPageContainer className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Care at home</p><h1 className="mt-2 font-serif text-3xl font-semibold">Your home visits</h1><p className="mt-2 text-sm text-muted-foreground">Track requests, confirmations, and previous consultations.</p></div>
        <Button as={Link} to="/app/home-visits"><Home className="mr-2 h-4 w-4" />Find a doctor</Button>
      </header>
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-3" role="tablist" aria-label="Booking filters">{FILTERS.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${filter === value ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:text-foreground'}`}>{label}</button>)}</div>
      {loading ? <LoadingState label="Loading your home visits…" /> : error ? <EmptyState icon={CalendarDays} eyebrow="Could not load" title="Bookings are unavailable" description={error.message} /> : filtered.length ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map(item => <BookingCard key={item.id} booking={item} to={`/app/home-visit-bookings/${item.id}`} />)}</div> : <EmptyState icon={CalendarDays} eyebrow={filter} title={`No ${filter} home visits`} description={filter === 'pending' ? 'New requests will appear here while the doctor reviews them.' : 'There is nothing in this view yet.'} action={<Button as={Link} to="/app/home-visits" variant="secondary">Browse home-visit doctors</Button>} />}
    </AppPageContainer>
  );
}

