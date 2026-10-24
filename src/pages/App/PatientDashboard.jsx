import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  GitCompare,
  ShieldCheck,
  CheckCircle2,
  UserRound,
  Calendar,
  ArrowRight,
  User,
  LayoutGrid
} from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import BookingCard from '../../components/booking/BookingCard';
import PatientWelcomeHeader from '../../components/patient/PatientWelcomeHeader';
import PatientDiscoveryActions from '../../components/patient/PatientDiscoveryActions';
import PatientProfileEditor from '../../components/patient/PatientProfileEditor';
import { useAuth } from '../../hooks/useAuth';
import { useCompare } from '../../hooks/useCompare';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { useHospitalsBySlugs } from '../../hooks/useHospitalsBySlugs';
import { useHomeVisitBookings } from '../../hooks/useHomeVisitBookings';
import { calculateProfileCompleteness } from '../../lib/profile/profileCompleteness';

export default function PatientDashboard({ initialTab = 'overview' }) {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state synchronized with URL query parameter ?tab=overview|profile
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(tabParam || initialTab);

  useEffect(() => {
    if (tabParam && (tabParam === 'overview' || tabParam === 'profile')) {
      setActiveTabState(tabParam);
    }
  }, [tabParam]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const nextParams = new URLSearchParams(searchParams);
    if (tab === 'overview') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', tab);
    }
    setSearchParams(nextParams, { replace: true });
  };

  // State from core hooks
  const { compareList } = useCompare();
  const { savedSlugs, loading: savedLoading } = useSavedHospitals();
  const savedList = Array.from(savedSlugs);
  const { hospitals: savedHospitals, loading: recordsLoading } = useHospitalsBySlugs(savedList.slice(0, 3));
  const { bookings: visitBookings, loading: visitsLoading, error: visitsError, refresh: refreshVisits } = useHomeVisitBookings();

  const activeVisits = visitBookings.filter(
    item => ['pending', 'confirmed'].includes(item.status) &&
    new Date(`${item.date}T${item.startTime}`) >= new Date()
  ).slice(0, 2);

  const completeness = calculateProfileCompleteness(profile);

  const handleSearch = (query) => {
    const clean = query?.trim();
    navigate(clean ? `/app/discover?q=${encodeURIComponent(clean)}` : '/app/discover');
  };

  return (
    <AppPageContainer className="space-y-7">
      {/* 1. Patient Identity and Welcome Header */}
      <PatientWelcomeHeader
        profile={profile}
        user={user}
        completeness={completeness}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
      />

      {/* 2. Top-level View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-border/70 pb-1">
        <div className="flex items-center gap-2" role="tablist" aria-label="Patient workspace tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-white/80 hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Healthcare Overview</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-white/80 hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Health Records</span>
            {completeness.percentage < 100 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                activeTab === 'profile' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}>
                {completeness.percentage}%
              </span>
            )}
          </button>
        </div>

        {activeTab === 'profile' && (
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Back to healthcare discovery <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* TAB 1: Healthcare Discovery & Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Metrics / Status Grid */}
          <section aria-label="Account status overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatusTile
              icon={Bookmark}
              label="Saved Hospitals"
              value={savedLoading ? '…' : savedList.length}
              description="In private shortlist"
              href="/app/saved"
            />
            <StatusTile
              icon={GitCompare}
              label="Comparing"
              value={compareList.length}
              description="Active in comparison"
              href="/app/compare"
            />
            <StatusTile
              icon={Calendar}
              label="Home Visits"
              value={visitsLoading ? '…' : activeVisits.length}
              description="Active consultations"
              href="/app/home-visit-bookings"
            />
            <FrostedPanel className="rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Profile Status</span>
                  <span className="text-xs font-bold text-primary">{completeness.percentage}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-200"
                    style={{ width: `${completeness.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-1">
                  {completeness.isComplete ? 'All core details set' : `${completeness.missingFields.length} details missing`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="mt-3 text-left text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Review profile <ArrowRight className="h-3 w-3" />
              </button>
            </FrostedPanel>
          </section>

          {/* Quick Actions (Care Finder, Discover, Doctors, Home Visits, Compare, Saved) */}
          <PatientDiscoveryActions />

          {/* Scheduled Care: Home Visit Activity */}
          <section aria-labelledby="home-visits-preview-heading" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Scheduled care</p>
                <h2 id="home-visits-preview-heading" className="mt-1 font-serif text-2xl font-semibold text-foreground">
                  Home Visit Activity
                </h2>
              </div>
              <Link to="/app/home-visit-bookings" className="text-xs sm:text-sm font-semibold text-primary hover:underline">
                View all bookings
              </Link>
            </div>

            {visitsLoading ? (
              <div className="h-28 animate-pulse rounded-[20px] bg-muted/30" />
            ) : visitsError ? (
              <FrostedPanel className="rounded-[20px] p-5 sm:p-6 border-coral/30 bg-coral/[0.04]">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-rose-950 text-sm sm:text-base">Could not load home visits</p>
                    <p className="mt-0.5 text-xs text-rose-800/80">
                      {visitsError.message || 'Please check your connection and try again.'}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => refreshVisits()} className="whitespace-nowrap shrink-0 text-xs">
                    Try again
                  </Button>
                </div>
              </FrostedPanel>
            ) : activeVisits.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {activeVisits.map(item => (
                  <BookingCard
                    key={item.id}
                    booking={item}
                    to={`/app/home-visit-bookings/${item.id}`}
                  />
                ))}
              </div>
            ) : (
              <FrostedPanel className="rounded-[20px] p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">No active home visits</p>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Request non-emergency house consultations from verified medical practitioners.
                    </p>
                  </div>
                  <Button as={Link} to="/app/home-visits" variant="secondary" size="sm" className="whitespace-nowrap">
                    Find home visit doctor
                  </Button>
                </div>
              </FrostedPanel>
            )}
          </section>

          {/* Shortlist & Trust Section */}
          <div className="grid gap-6 lg:grid-cols-[1.45fr_.55fr]">
            <section aria-labelledby="saved-preview-heading">
              <FrostedPanel className="h-full rounded-[20px] p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Your shortlist</p>
                    <h2 id="saved-preview-heading" className="mt-1 font-serif text-2xl font-semibold text-foreground">
                      Saved Hospitals
                    </h2>
                  </div>
                  <Link to="/app/saved" className="text-xs sm:text-sm font-semibold text-primary hover:underline">
                    View all ({savedList.length})
                  </Link>
                </div>

                {savedLoading || recordsLoading ? (
                  <div className="mt-6 space-y-3" role="status" aria-label="Loading saved hospital preview">
                    {[1, 2].map(item => (
                      <div key={item} className="h-16 animate-pulse rounded-2xl bg-muted/35" />
                    ))}
                  </div>
                ) : savedHospitals.length ? (
                  <div className="mt-6 divide-y divide-border/70">
                    {savedHospitals.map(hospital => (
                      <Link
                        key={hospital.id}
                        to={`/app/hospitals/${hospital.slug}`}
                        className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 group"
                      >
                        <span className="min-w-0 pr-2">
                          <strong className="block text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {hospital.name}
                          </strong>
                          <span className="mt-0.5 block text-xs text-muted-foreground truncate">
                            {[hospital.location.locality, hospital.location.city].filter(Boolean).join(', ') || 'Location not provided'}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-border/80 p-6 text-center">
                    <Bookmark className="mx-auto h-6 w-6 text-primary" />
                    <p className="mt-3 text-sm font-semibold text-foreground">No saved hospitals yet</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Save a hospital from Discover or Care Finder to review here.
                    </p>
                    <Button as={Link} to="/app/discover" variant="outline" size="sm" className="mt-4">
                      Discover hospitals
                    </Button>
                  </div>
                )}
              </FrostedPanel>
            </section>

            <section aria-labelledby="trust-heading">
              <FrostedPanel className="h-full rounded-[20px] p-6 sm:p-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 id="trust-heading" className="mt-4 font-serif text-xl font-semibold text-foreground">
                  Understand the source
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  MEDIMESH shows where provider information came from and when it was verified. Missing facts stay marked as not provided.
                </p>
                <div className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> No sponsored hospital rankings
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Verified coordinates only for ranking
                  </p>
                  <p className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-primary shrink-0" /> Shortlists stay strictly private
                  </p>
                </div>
              </FrostedPanel>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: Integrated Profile & Health Management */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                Account & Health Management
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
                Manage Profile & Health Records
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update personal details, upload a profile photo, and manage optional health facts.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="text-xs font-semibold gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Overview
            </Button>
          </div>

          <PatientProfileEditor
            profile={profile}
            user={user}
            refreshProfile={refreshProfile}
            onSaveSuccess={() => {
              // Notification remains visible inside editor
            }}
          />
        </div>
      )}
    </AppPageContainer>
  );
}

function StatusTile({ icon: Icon, label, value, description, href }) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-white/80 bg-white/70 p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,40,35,0.035)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
      <span className="mt-2 block font-sans text-2xl sm:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors">
        {value}
      </span>
      <span className="mt-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {description && (
        <span className="mt-0.5 block text-[11px] text-muted-foreground/75 truncate">
          {description}
        </span>
      )}
    </Link>
  );
}
