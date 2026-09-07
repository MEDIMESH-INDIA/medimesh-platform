import { useMemo, useState } from 'react';
import { CalendarCheck2, Inbox } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import BookingCard from '../../../components/booking/BookingCard';
import EmptyState from '../../../components/common/EmptyState';
import LoadingState from '../../../components/common/LoadingState';
import { useHomeVisitBookings } from '../../../hooks/useHomeVisitBookings';

export default function DoctorHomeVisitRequests() {
  const { bookings, loading, error } = useHomeVisitBookings({ audience: 'doctor' });
  const [view, setView] = useState('pending');
  const filtered = useMemo(() => bookings.filter(item => view === 'pending' ? item.status === 'pending' : item.status === 'confirmed' && new Date(`${item.date}T${item.startTime}`) >= new Date()), [bookings, view]);
  return (
    <AppPageContainer className="space-y-7">
      <header><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Home consultation desk</p><h1 className="mt-2 font-serif text-3xl font-semibold">Visit requests</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Review patient requests before they become appointments. Private addresses are shown only on requests assigned to you.</p></header>
      <div className="inline-flex rounded-full border border-border bg-white/70 p-1" role="tablist" aria-label="Request view"><button type="button" role="tab" aria-selected={view === 'pending'} onClick={() => setView('pending')} className={`min-h-10 rounded-full px-5 text-sm font-semibold ${view === 'pending' ? 'bg-primary text-white' : 'text-muted-foreground'}`}>Pending requests</button><button type="button" role="tab" aria-selected={view === 'upcoming'} onClick={() => setView('upcoming')} className={`min-h-10 rounded-full px-5 text-sm font-semibold ${view === 'upcoming' ? 'bg-primary text-white' : 'text-muted-foreground'}`}>Upcoming visits</button></div>
      {loading ? <LoadingState label="Loading assigned requests…" /> : error ? <EmptyState icon={Inbox} eyebrow="Could not load" title="Requests are unavailable" description={error.message} /> : filtered.length ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map(item => <BookingCard key={item.id} booking={item} audience="doctor" to={`/doctor/home-visit-requests/${item.id}`} />)}</div> : <EmptyState icon={view === 'pending' ? Inbox : CalendarCheck2} eyebrow={view} title={view === 'pending' ? 'No requests waiting' : 'No confirmed visits ahead'} description={view === 'pending' ? 'New patient requests will appear here for review.' : 'Accepted visits will be arranged here by date.'} />}
    </AppPageContainer>
  );
}

