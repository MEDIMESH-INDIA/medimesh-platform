import { useState } from 'react';
import { Search, ShieldCheck, Mail, Phone, MapPin, Edit3, ArrowRight, CheckCircle2 } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import Button from '../common/Button';

export default function PatientWelcomeHeader({
  profile,
  user,
  completeness,
  activeTab,
  setActiveTab,
  onSearch,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const firstName =
    profile?.first_name ||
    profile?.display_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  const displayName = profile?.display_name || (user?.email ? user.email.split('@')[0] : 'Patient');
  const email = profile?.email || user?.email || '';
  const phone = profile?.phone || '';
  const locationStr = [profile?.city, profile?.country].filter(Boolean).join(', ');

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Recent';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/75 p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,40,35,0.04)] backdrop-blur-xl">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr] items-center">
        {/* Left column: Identity & Welcome */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <UserAvatar
              src={profile?.avatar_url}
              alt={displayName}
              name={displayName}
              size="xl"
              className="ring-4 ring-primary/10 border-2 border-white shadow-md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  Patient Account
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-surface px-2 py-0.5 rounded-full border border-border/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Member since {memberSince}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Welcome, {firstName}.
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Your unified MEDIMESH healthcare home for verified hospital discovery and health records.
              </p>
            </div>
          </div>

          {/* Quick Account Info Strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 truncate max-w-[220px]" title={email}>
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{email}</span>
              <span className="text-[10px] font-medium bg-muted px-1.5 py-0.2 rounded text-muted-foreground/80">Read-only</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{phone || 'No phone added'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{locationStr || 'Location not set'}</span>
            </span>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative mt-2 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-white/90 py-3 pl-11 pr-28 text-xs sm:text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
              placeholder="Search hospital, specialty, or locality..."
              aria-label="Search hospitals"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-bold"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Right column: Profile Completeness & Action Card */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile completeness</span>
              <span className="text-base font-extrabold text-primary">{completeness.percentage}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completeness.completedCount} of {completeness.totalCount} core details completed
              </span>
              {completeness.isComplete && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All core fields set
                </span>
              )}
            </div>

            {completeness.missingFields.length > 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed">
                Add <span className="font-semibold text-foreground">{completeness.missingFields.join(', ')}</span> to reach 100%. Health records are optional.
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'profile' ? 'overview' : 'profile')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                {activeTab === 'profile' ? (
                  <>Back to healthcare overview <ArrowRight className="w-3.5 h-3.5" /></>
                ) : (
                  <><Edit3 className="w-3.5 h-3.5" /> Manage & Edit Profile</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

