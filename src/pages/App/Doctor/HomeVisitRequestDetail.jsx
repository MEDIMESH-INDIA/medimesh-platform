import { useState } from 'react';
import { ArrowLeft, CalendarDays, Home, MapPin, MessageSquareText, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import BookingStatusBadge from '../../../components/booking/BookingStatusBadge';
import ConfirmationDialog from '../../../components/booking/ConfirmationDialog';
import { formatVisitDate } from '../../../lib/utils/homeVisitFormatters';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import FormField from '../../../components/common/FormField';
import FrostedPanel from '../../../components/common/FrostedPanel';
import LoadingState from '../../../components/common/LoadingState';
import Toast from '../../../components/common/Toast';
import { useHomeVisitBookings } from '../../../hooks/useHomeVisitBookings';
import { respondToHomeVisitBooking } from '../../../lib/data/homeVisitBookingRepository';

export default function DoctorHomeVisitRequestDetail() {
  const { id } = useParams();
  const { booking, setBooking, loading, error } = useHomeVisitBookings({ audience: 'doctor', bookingId: id });
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  if (loading) return <AppPageContainer><LoadingState label="Opening request…" /></AppPageContainer>;
  if (error || !booking) return <AppPageContainer><EmptyState icon={Home} eyebrow="Visit request" title="Request not found" description="This request does not exist or is not assigned to your practitioner record." /></AppPageContainer>;
  const respond = async () => { setBusy(true); try { setBooking(await respondToHomeVisitBooking(booking.id, action, reason)); setAction(null); setToast({ tone: 'success', message: action === 'accept' ? 'Visit confirmed.' : 'Request declined.' }); } catch (nextError) { setToast({ tone: 'error', message: nextError.message }); } finally { setBusy(false); } };
  const fullAddress = [booking.address.line1, booking.address.line2, booking.address.locality, booking.address.city, booking.address.postalCode, booking.address.landmark ? `Landmark: ${booking.address.landmark}` : null].filter(Boolean).join(', ');
  return <AppPageContainer className="space-y-6">{toast && <Toast {...toast} onClose={() => setToast(null)} />}<Link to="/doctor/home-visit-requests" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />All requests</Link><FrostedPanel className="rounded-[26px] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">{booking.reference}</p><h1 className="mt-2 font-serif text-3xl font-semibold">Visit for {booking.patientName}</h1><p className="mt-2 text-sm text-muted-foreground">Submitted {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><BookingStatusBadge status={booking.status} /></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><Detail icon={CalendarDays} label="Requested time" value={formatVisitDate(booking.date, booking.startTime)} /><Detail icon={MapPin} label="Private visit address" value={fullAddress} /><Detail icon={UserRound} label="Patient" value={booking.patientName} /><Detail icon={MessageSquareText} label="Patient note" value={booking.note || 'No note provided'} /></div><p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">This is a scheduled, non-emergency request. The patient’s address is private and must be used only to coordinate this visit.</p>{booking.status === 'pending' && <div className="mt-7 flex flex-wrap gap-3 border-t border-border/60 pt-5"><Button type="button" onClick={() => setAction('accept')}>Accept request</Button><Button type="button" variant="secondary" className="text-rose-700" onClick={() => setAction('decline')}>Decline</Button></div>}</FrostedPanel><ConfirmationDialog open={action === 'accept'} title="Confirm this home visit?" description="The patient will see this request as confirmed. Make sure the date and area work for your schedule." confirmLabel="Accept and confirm" cancelLabel="Review again" busy={busy} onClose={() => setAction(null)} onConfirm={respond} /><ConfirmationDialog open={action === 'decline'} title="Decline this request?" description="The slot will be released for another request. You may add a brief reason for the patient." confirmLabel="Decline request" cancelLabel="Go back" tone="danger" busy={busy} onClose={() => setAction(null)} onConfirm={respond}><FormField id="decline-reason" as="textarea" rows={3} label="Reason (optional)" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} /></ConfirmationDialog></AppPageContainer>;
}

function Detail({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-border/60 bg-white/65 p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</p><p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p></div>; }
