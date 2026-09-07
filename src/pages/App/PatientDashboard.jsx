import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bookmark, CheckCircle2, GitCompare, Search, ShieldCheck, Stethoscope, UserRound, Home } from 'lucide-react';
import { useState } from 'react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import { useAuth } from '../../hooks/useAuth';
import { useCompare } from '../../hooks/useCompare';
import { useHospitalsBySlugs } from '../../hooks/useHospitalsBySlugs';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { useHomeVisitBookings } from '../../hooks/useHomeVisitBookings';
import BookingCard from '../../components/booking/BookingCard';

const quickActions = [
  { label: 'Discover hospitals', description: 'Search the published catalog', href: '/app/discover', icon: Search },
  { label: 'Find doctors', description: 'Explore professional profiles', href: '/app/doctors', icon: Stethoscope },
  { label: 'Find a Home Visit Doctor', description: 'Connect with doctors who provide non-emergency home consultations.', href: '/app/home-visits', icon: Home },
  { label: 'Compare', description: 'Review hospitals side by side', href: '/app/compare', icon: GitCompare },
  { label: 'Saved hospitals', description: 'Open your private shortlist', href: '/app/saved', icon: Bookmark },
];

export default function PatientDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { compareList } = useCompare();
  const { savedSlugs, loading: savedLoading } = useSavedHospitals();
  const savedList = Array.from(savedSlugs);
  const { hospitals: savedHospitals, loading: recordsLoading } = useHospitalsBySlugs(savedList.slice(0, 3));
  const profileFields = [profile?.display_name, profile?.phone, profile?.city, profile?.country];
  const completedFields = profileFields.filter(Boolean).length;
  const completion = Math.round((completedFields / profileFields.length) * 100);
  const firstName = profile?.first_name || profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const { bookings: visitBookings, loading: visitsLoading } = useHomeVisitBookings();
  const activeVisits = visitBookings.filter(item => ['pending', 'confirmed'].includes(item.status) && new Date(`${item.date}T${item.startTime}`) >= new Date()).slice(0, 2);

  const submitSearch = event => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/app/discover?q=${encodeURIComponent(query)}` : '/app/discover');
  };

  return (
    <AppPageContainer className="space-y-7">
      <section className="overflow-hidden rounded-[20px] border border-white/80 bg-white/72 p-6 shadow-[0_3px_14px_rgba(15,40,35,0.035)] backdrop-blur-xl sm:p-7">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Your MEDIMESH home</p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-5xl">Welcome, {firstName}.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Continue discovering healthcare options with structured facts and clear source context.</p>
            <form onSubmit={submitSearch} className="relative mt-7 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-2xl border border-border bg-white py-4 pl-12 pr-28 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Search hospital, city, or locality" aria-label="Search hospitals" />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">Search</Button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatusTile icon={Bookmark} label="Saved" value={savedLoading ? '…' : savedList.length} href="/app/saved" />
            <StatusTile icon={GitCompare} label="Comparing" value={compareList.length} href="/app/compare" />
            <FrostedPanel className="col-span-2 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-foreground">Profile completeness</span><span className="text-sm font-bold text-primary">{completion}%</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${completion}%` }} /></div>
              <Link to="/app/profile" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Review profile <ArrowRight className="h-3 w-3" /></Link>
            </FrostedPanel>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-actions-heading">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Continue your journey</p><h2 id="quick-actions-heading" className="mt-2 font-serif text-2xl font-semibold text-foreground">Quick actions</h2></div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map(action => <Link key={action.label} to={action.href} className="group relative rounded-[18px] border border-border/60 bg-white/68 p-4 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><action.icon className="h-5 w-5" /></span><h3 className="mt-3 font-sans text-sm font-semibold text-foreground group-hover:text-primary">{action.label}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{action.description}</p><ArrowRight className="absolute right-4 top-5 h-4 w-4 text-primary transition-transform duration-200 group-hover:translate-x-1" /></Link>)}
        </div>
      </section>

      <section aria-labelledby="home-visits-preview-heading">
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Scheduled care</p><h2 id="home-visits-preview-heading" className="mt-2 font-serif text-2xl font-semibold">Home visit activity</h2></div><Link to="/app/home-visit-bookings" className="text-sm font-semibold text-primary hover:underline">View all</Link></div>
        {visitsLoading ? <div className="h-28 animate-pulse rounded-[20px] bg-muted/30" /> : activeVisits.length ? <div className="grid gap-4 lg:grid-cols-2">{activeVisits.map(item => <BookingCard key={item.id} booking={item} to={`/app/home-visit-bookings/${item.id}`} />)}</div> : <FrostedPanel className="rounded-[20px] p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-foreground">No active home visits</p><p className="mt-1 text-sm text-muted-foreground">Request a non-emergency consultation from a doctor with a published schedule.</p></div><Button as={Link} to="/app/home-visits" variant="secondary">Find a doctor</Button></div></FrostedPanel>}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_.55fr]">
        <section aria-labelledby="saved-preview-heading">
          <FrostedPanel className="h-full rounded-[20px] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Your shortlist</p><h2 id="saved-preview-heading" className="mt-2 font-serif text-2xl font-semibold text-foreground">Saved hospitals</h2></div><Link to="/app/saved" className="text-sm font-semibold text-primary hover:underline">View all</Link></div>
            {savedLoading || recordsLoading ? <div className="mt-6 space-y-3" role="status" aria-label="Loading saved hospital preview">{[1, 2].map(item => <div key={item} className="h-16 animate-pulse rounded-2xl bg-muted/35" />)}</div> : savedHospitals.length ? <div className="mt-6 divide-y divide-border/70">{savedHospitals.map(hospital => <Link key={hospital.id} to={`/app/hospitals/${hospital.slug}`} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><span><strong className="block text-sm text-foreground">{hospital.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{[hospital.location.locality, hospital.location.city].filter(Boolean).join(', ') || 'Location not provided'}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-primary" /></Link>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center"><Bookmark className="mx-auto h-6 w-6 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">No saved hospitals yet</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Save a hospital from Discover to see it here.</p><Button as={Link} to="/app/discover" variant="outline" size="sm" className="mt-4">Discover hospitals</Button></div>}
          </FrostedPanel>
        </section>

        <section aria-labelledby="trust-heading">
          <FrostedPanel className="h-full rounded-[20px] p-6 sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></span>
            <h2 id="trust-heading" className="mt-5 font-serif text-xl font-semibold text-foreground">Understand the source</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">MEDIMESH shows where provider information came from and when it was checked. Missing facts stay marked as not provided.</p>
            <div className="mt-5 space-y-3 text-xs text-muted-foreground"><p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />No hospital rankings</p><p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />No invented availability</p><p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" />Your shortlist stays private</p></div>
          </FrostedPanel>
        </section>
      </div>
    </AppPageContainer>
  );
}

function StatusTile({ icon: Icon, label, value, href }) {
  return <Link to={href} className="rounded-2xl border border-white/80 bg-white/68 p-5 shadow-[0_12px_35px_rgba(15,40,35,0.055)] backdrop-blur-xl transition hover:border-primary/20 hover:bg-white"><Icon className="h-5 w-5 text-primary" /><span className="mt-2 block font-sans text-2xl font-semibold text-foreground">{value}</span><span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span></Link>;
}
