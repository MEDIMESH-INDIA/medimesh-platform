import { useState } from 'react';
import { ArrowLeft, CalendarDays, Home, MapPin, MessageSquareText, Stethoscope } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import BookingStatusBadge from '../../../components/booking/BookingStatusBadge';
import ConfirmationDialog from '../../../components/booking/ConfirmationDialog';
import { formatVisitDate } from '../../../lib/utils/homeVisitFormatters';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import FrostedPanel from '../../../components/common/FrostedPanel';
import LoadingState from '../../../components/common/LoadingState';
import Toast from '../../../components/common/Toast';
import { useHomeVisitBookings } from '../../../hooks/useHomeVisitBookings';
import { cancelHomeVisitBooking } from '../../../lib/data/homeVisitBookingRepository';

export default function PatientHomeVisitBookingDetail() {
  const { id } = useParams();
  const { booking, setBooking, loading, error } = useHomeVisitBookings({ bookingId: id });
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  if (loading) return <AppPageContainer><LoadingState label="Loading visit details…" /></AppPageContainer>;
  if (error || !booking) return <AppPageContainer><EmptyState icon={Home} eyebrow="Home visit" title="Request not found" description="This request does not exist or is not available to your account." /></AppPageContainer>;
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && new Date(`${booking.date}T${booking.startTime}`) > new Date();
  const fullAddress = [booking.address.line1, booking.address.line2, booking.address.locality, booking.address.city, booking.address.postalCode].filter(Boolean).join(', ');
  const cancel = async () => { setBusy(true); try { setBooking(await cancelHomeVisitBooking(booking.id)); setConfirming(false); setToast({ tone: 'success', message: 'The home visit was cancelled.' }); } catch (nextError) { setToast({ tone: 'error', message: nextError.message }); } finally { setBusy(false); } };
  return <AppPageContainer className="space-y-6">{toast && <Toast {...toast} onClose={() => setToast(null)} />}<Link to="/app/home-visit-bookings" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />All home visits</Link><FrostedPanel className="rounded-[26px] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">{booking.reference}</p><h1 className="mt-2 font-serif text-3xl font-semibold">Home visit with {booking.doctor?.name}</h1><p className="mt-2 text-sm text-muted-foreground">{booking.doctor?.specialization}</p></div><BookingStatusBadge status={booking.status} /></div>{booking.status === 'pending' && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">The doctor has not confirmed this request yet. Please do not treat it as a scheduled appointment.</p>}<div className="mt-7 grid gap-4 sm:grid-cols-2"><Detail icon={CalendarDays} label="Date and time" value={formatVisitDate(booking.date, booking.startTime)} /><Detail icon={MapPin} label="Visit address" value={fullAddress} /><Detail icon={Stethoscope} label="Practitioner" value={booking.doctor?.name} /><Detail icon={MessageSquareText} label="Your note" value={booking.note || 'No note provided'} /></div>{booking.status === 'declined' && booking.declineReason && <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800"><strong>Doctor’s note:</strong> {booking.declineReason}</div>}<div className="mt-7 flex flex-wrap gap-3 border-t border-border/60 pt-5"><Button as={Link} to={`/app/doctors/${booking.doctor?.slug}`} variant="secondary">View doctor profile</Button>{canCancel && <Button type="button" variant="ghost" className="text-rose-700" onClick={() => setConfirming(true)}>Cancel visit</Button>}</div></FrostedPanel><ConfirmationDialog open={confirming} title="Cancel this home visit?" description="The doctor will no longer see this as an active appointment. This action cannot be undone." confirmLabel="Cancel visit" tone="danger" busy={busy} onClose={() => setConfirming(false)} onConfirm={cancel} /></AppPageContainer>;
}

function Detail({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-border/60 bg-white/65 p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</p><p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p></div>; }
