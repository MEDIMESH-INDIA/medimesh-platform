import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, CheckCircle2, Home, MapPin, ShieldAlert, Stethoscope } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import FormField from '../../../components/common/FormField';
import FrostedPanel from '../../../components/common/FrostedPanel';
import LoadingState from '../../../components/common/LoadingState';
import { useAuth } from '../../../hooks/useAuth';
import { useDoctorDetail } from '../../../hooks/useDoctorDetail';
import {
  createHomeVisitBooking,
  getUnavailableHomeVisitSlots,
} from '../../../lib/data/homeVisitBookingRepository';

const STEPS = ['Date', 'Time', 'Address', 'Review'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toDateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const timeToMinutes = value => {
  const [hours, minutes] = String(value || '').split(':').map(Number);
  return (hours * 60) + minutes;
};

const minutesToTime = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

function availableDates(days) {
  const result = [];
  const today = new Date();
  for (let index = 0; index < 28; index += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + index);
    if (days.includes(WEEKDAYS[candidate.getDay()])) result.push(candidate);
  }
  return result.slice(0, 10);
}

function displayDate(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function displayTime(time) {
  return new Date(`2020-01-01T${time}:00`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export default function HomeVisitBooking() {
  const { slug } = useParams();
  const { user, profile } = useAuth();
  const { doctor, loading, error } = useDoctorDetail(slug);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [unavailable, setUnavailable] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [address, setAddress] = useState({
    line1: '', line2: '', locality: profile?.city || '', city: 'Navi Mumbai', postalCode: '', landmark: '',
  });
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);

  const isBookable = Boolean(
    doctor?.homeVisit?.enabled
    && doctor?.homeVisit?.days?.length
    && doctor?.homeVisit?.startTime
    && doctor?.homeVisit?.endTime,
  );
  const dates = useMemo(() => availableDates(doctor?.homeVisit?.days || []), [doctor?.homeVisit?.days]);
  const times = useMemo(() => {
    if (!doctor?.homeVisit?.startTime || !doctor?.homeVisit?.endTime) return [];
    const start = timeToMinutes(doctor.homeVisit.startTime);
    const end = timeToMinutes(doctor.homeVisit.endTime);
    const result = [];
    for (let cursor = start; cursor + 30 <= end; cursor += 30) result.push(minutesToTime(cursor));
    return result;
  }, [doctor?.homeVisit?.endTime, doctor?.homeVisit?.startTime]);

  useEffect(() => {
    if (!date || !doctor?.id) return undefined;
    let active = true;
    setCheckingSlots(true);
    setTime('');
    getUnavailableHomeVisitSlots(doctor.id, date)
      .then(slots => active && setUnavailable(slots))
      .catch(() => active && setUnavailable([]))
      .finally(() => active && setCheckingSlots(false));
    return () => { active = false; };
  }, [date, doctor?.id]);

  const addressValid = address.line1.trim().length >= 3
    && address.locality.trim().length >= 2
    && address.city.trim().length >= 2
    && (!address.postalCode || /^[0-9]{6}$/.test(address.postalCode));

  const next = () => {
    if (step === 0 && !date) return;
    if (step === 1 && !time) return;
    if (step === 2 && !addressValid) return;
    setStep(current => Math.min(current + 1, STEPS.length - 1));
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const booking = await createHomeVisitBooking({ patientId: user.id, doctorId: doctor.id, date, startTime: time, address, note });
      setCreatedBooking(booking);
    } catch (nextError) {
      setSubmitError(nextError.message);
      if (nextError.code === 'SLOT_CONFLICT' || nextError.code === 'INVALID_SLOT') setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AppPageContainer><LoadingState label="Preparing the visit calendar…" /></AppPageContainer>;
  if (error || !doctor) return <AppPageContainer><EmptyState icon={Stethoscope} eyebrow="Home visits" title="Doctor unavailable" description="This practitioner profile could not be loaded." action={<Button as={Link} to="/app/home-visits">Browse home visits</Button>} /></AppPageContainer>;
  if (!isBookable) return <AppPageContainer><EmptyState icon={CalendarDays} eyebrow="Schedule unavailable" title="Online booking is not open yet" description="This doctor has not published a complete, claimed home-visit schedule. MEDIMESH will not invent appointment times." action={<Button as={Link} to={`/app/doctors/${doctor.slug}`}>Return to profile</Button>} /></AppPageContainer>;

  if (createdBooking) {
    return (
      <AppPageContainer className="flex min-h-[70vh] items-center justify-center">
        <FrostedPanel className="w-full max-w-2xl rounded-[28px] p-7 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-8 w-8" /></span>
          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Request {createdBooking.reference}</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">Your request is with the doctor</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">This is not confirmed yet. You’ll see the status change when {doctor.name} accepts or declines the request.</p>
          <div className="mx-auto mt-6 grid max-w-md gap-3 rounded-2xl border border-border/70 bg-white/70 p-5 text-left text-sm">
            <span className="flex gap-2"><CalendarDays className="h-4 w-4 text-primary" />{dates.find(item => toDateKey(item) === date) ? displayDate(dates.find(item => toDateKey(item) === date)) : date} · {displayTime(time)}</span>
            <span className="flex gap-2"><MapPin className="h-4 w-4 text-primary" />{address.line1}, {address.locality}</span>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to={`/app/home-visit-bookings/${createdBooking.id}`}>View request</Button>
            <Button as={Link} to="/app/home-visit-bookings" variant="secondary">All bookings</Button>
          </div>
        </FrostedPanel>
      </AppPageContainer>
    );
  }

  return (
    <AppPageContainer className="space-y-6">
      <Link to={`/app/doctors/${doctor.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Back to doctor profile</Link>
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Scheduled non-emergency visit</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Request a home consultation</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Choose from the doctor’s published schedule. Your request remains pending until the doctor accepts it.</p>

          <ol className="mt-7 grid grid-cols-4 gap-2" aria-label="Booking progress">
            {STEPS.map((label, index) => (
              <li key={label} className={`border-t-2 pt-3 text-xs font-semibold ${index <= step ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`} aria-current={index === step ? 'step' : undefined}>
                <span className="hidden sm:inline">0{index + 1} · </span>{label}
              </li>
            ))}
          </ol>

          <FrostedPanel className="mt-6 rounded-[24px] p-5 sm:p-7">
            {step === 0 && <div><h2 className="font-serif text-2xl font-semibold">Select a visit date</h2><p className="mt-2 text-sm text-muted-foreground">Only days published by the doctor are shown.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{dates.map(item => { const value = toDateKey(item); return <button key={value} type="button" onClick={() => setDate(value)} className={`min-h-20 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${date === value ? 'border-primary bg-primary text-white shadow-lg' : 'border-border bg-white/70 hover:border-primary/30'}`}><span className="block text-xs opacity-75">{item.toLocaleDateString('en-IN', { weekday: 'long' })}</span><span className="mt-1 block font-serif text-lg font-semibold">{item.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></button>; })}</div></div>}

            {step === 1 && <div><h2 className="font-serif text-2xl font-semibold">Choose a 30-minute window</h2><p className="mt-2 text-sm text-muted-foreground">Unavailable requests are disabled without revealing patient information.</p>{checkingSlots ? <LoadingState label="Checking this date…" /> : <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{times.map(item => { const disabled = unavailable.includes(item); return <button key={item} type="button" disabled={disabled} onClick={() => setTime(item)} className={`min-h-12 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:border-border/50 disabled:bg-surface disabled:text-muted-foreground/50 ${time === item ? 'border-primary bg-primary text-white' : 'border-border bg-white/70 hover:border-primary/30'}`}>{displayTime(item)}{disabled && <span className="block text-[9px] font-medium">Unavailable</span>}</button>; })}</div>}</div>}

            {step === 2 && <div><h2 className="font-serif text-2xl font-semibold">Where should the doctor visit?</h2><p className="mt-2 text-sm text-muted-foreground">Your full address is private and visible only to you and the assigned doctor.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><FormField id="visit-address" label="Address line 1" value={address.line1} onChange={event => setAddress(current => ({ ...current, line1: event.target.value }))} className="sm:col-span-2" required maxLength={240} /><FormField id="visit-address-2" label="Address line 2 (optional)" value={address.line2} onChange={event => setAddress(current => ({ ...current, line2: event.target.value }))} className="sm:col-span-2" maxLength={240} /><FormField id="visit-locality" label="Locality" value={address.locality} onChange={event => setAddress(current => ({ ...current, locality: event.target.value }))} required maxLength={120} /><FormField id="visit-city" label="City" value={address.city} onChange={event => setAddress(current => ({ ...current, city: event.target.value }))} required maxLength={120} /><FormField id="visit-postal" label="PIN code (optional)" inputMode="numeric" pattern="[0-9]{6}" value={address.postalCode} onChange={event => setAddress(current => ({ ...current, postalCode: event.target.value.replace(/\D/g, '').slice(0, 6) }))} error={address.postalCode && !/^[0-9]{6}$/.test(address.postalCode) ? 'Enter a 6-digit PIN code.' : undefined} /><FormField id="visit-landmark" label="Landmark (optional)" value={address.landmark} onChange={event => setAddress(current => ({ ...current, landmark: event.target.value }))} maxLength={160} /><FormField id="visit-note" as="textarea" rows={4} label="Note for the doctor (optional)" helpText={`${note.length}/1000 · Avoid sharing emergency or highly sensitive details here.`} value={note} onChange={event => setNote(event.target.value)} maxLength={1000} className="sm:col-span-2" /></div></div>}

            {step === 3 && <div><h2 className="font-serif text-2xl font-semibold">Review your request</h2><p className="mt-2 text-sm text-muted-foreground">Submitting does not confirm the visit. The doctor still needs to accept.</p><div className="mt-6 divide-y divide-border/60 rounded-2xl border border-border/70 bg-white/65 px-5">{[[Stethoscope, 'Doctor', `${doctor.name} · ${doctor.specialization}`], [CalendarDays, 'Visit', `${dates.find(item => toDateKey(item) === date) ? displayDate(dates.find(item => toDateKey(item) === date)) : date} · ${displayTime(time)}`], [MapPin, 'Address', `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.locality}, ${address.city}${address.postalCode ? ` – ${address.postalCode}` : ''}`]].map(([Icon, label, value]) => <div key={label} className="flex gap-3 py-4"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium text-foreground">{value}</p></div></div>)}</div>{submitError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{submitError}</p>}<div className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldAlert className="h-4 w-4 shrink-0" /><p>Not for emergencies. Call 112 or seek the nearest emergency department for urgent symptoms.</p></div></div>}

            <div className="mt-7 flex items-center justify-between border-t border-border/60 pt-5">
              <Button type="button" variant="ghost" onClick={() => setStep(current => Math.max(0, current - 1))} disabled={step === 0 || submitting}>Back</Button>
              {step < 3 ? <Button type="button" onClick={next} disabled={(step === 0 && !date) || (step === 1 && !time) || (step === 2 && !addressValid)}>Continue</Button> : <Button type="button" onClick={submit} disabled={submitting}>{submitting ? 'Sending request…' : 'Request home visit'}</Button>}
            </div>
          </FrostedPanel>
        </section>

        <aside className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[24px] border border-primary/15 bg-[#173f38] p-6 text-white shadow-xl">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><Home className="h-5 w-5" /></span>
            <p className="mt-5 text-xs font-semibold text-white/65">Requesting with</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">{doctor.name}</h2>
            <p className="mt-1 text-sm text-white/70">{doctor.specialization}</p>
            <dl className="mt-6 space-y-4 border-t border-white/15 pt-5 text-sm">
              <div><dt className="text-xs text-white/55">Service areas</dt><dd className="mt-1 font-medium">{doctor.homeVisit.serviceAreas.join(', ') || 'Not specified'}</dd></div>
              <div><dt className="text-xs text-white/55">Published hours</dt><dd className="mt-1 font-medium">{doctor.homeVisit.days.join(', ')} · {displayTime(String(doctor.homeVisit.startTime).slice(0, 5))}–{displayTime(String(doctor.homeVisit.endTime).slice(0, 5))}</dd></div>
              <div><dt className="text-xs text-white/55">Fee</dt><dd className="mt-1 font-medium">{doctor.homeVisit.fee ? `₹${Number(doctor.homeVisit.fee).toLocaleString('en-IN')}` : 'Not provided'}</dd></div>
            </dl>
            <p className="mt-6 flex gap-2 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/75"><Check className="mt-0.5 h-4 w-4 shrink-0" />Your slot is held only after the request is successfully submitted.</p>
          </div>
        </aside>
      </div>
    </AppPageContainer>
  );
}
