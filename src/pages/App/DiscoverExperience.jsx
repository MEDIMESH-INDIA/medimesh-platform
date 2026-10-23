import FilterPanel from '../../components/hospital/FilterPanel';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Activity, BedDouble, Building2, ChevronDown, Filter, MapPin, Search, X } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import SectionEyebrow from '../../components/common/SectionEyebrow';
import EmptyState from '../../components/common/EmptyState';
import HospitalCard from '../../components/hospital/HospitalCard';
import HospitalCardSkeleton from '../../components/hospital/HospitalCardSkeleton';
import CollapsibleFilter from '../../components/hospital/CollapsibleFilter';
import { useHospitalSearch } from '../../hooks/useHospitalSearch';
import { useHospitalFacets } from '../../hooks/useHospitalFacets';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { useCompare } from '../../hooks/useCompare';
import { useAuthGate } from '../../hooks/useAuthGate';
import { formatHospitalType } from '../../lib/utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import Toast from '../../components/common/Toast';

export default function DiscoverExperience({ mode = 'canonical' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { savedSlugs, toggleSave } = useSavedHospitals();
  const { compareList } = useCompare();
  const { requireAuth } = useAuthGate();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const [sort, setSort] = useState('name_asc');
  const [toast, setToast] = useState(null);

  const filters = {
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    locality: searchParams.get('locality') || '',
    specialty: searchParams.get('specialty') || '',
    type: searchParams.get('type') || '',
    facility: searchParams.get('facility') || '',
  };

  const { hospitals, loading, error, hasMore, totalCount, loadMore } = useHospitalSearch({
    filters,
    sort,
    mode,
    pageSize: 12,
  });

  const { facets } = useHospitalFacets({ mode });

  useEffect(() => {
    if (!isMobileFiltersOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = event => { if (event.key === 'Escape') setIsMobileFiltersOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileFiltersOpen]);

  // Deep-link and history sync: prune locality if not valid for selected city once facets load
  useEffect(() => {
    if (!filters.city || !filters.locality || !facets.cityToLocalities) return;
    const validLocalities = facets.cityToLocalities[filters.city];
    if (Array.isArray(validLocalities) && !validLocalities.includes(filters.locality)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('locality');
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters.city, filters.locality, facets.cityToLocalities, searchParams, setSearchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    if (key === 'city') {
      const currentLocality = newParams.get('locality');
      if (currentLocality) {
        if (!value) {
          newParams.delete('locality');
        } else {
          const validLocalities = facets.cityToLocalities?.[value];
          if (Array.isArray(validLocalities)) {
            if (!validLocalities.includes(currentLocality)) {
              newParams.delete('locality');
            }
          } else {
            newParams.delete('locality');
          }
        }
      }
    }

    setSearchParams(newParams);
    if (key === 'q') setQuery(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('q', query);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'q' && v !== '').length;
  const isComparing = compareList.length > 0;

  const handleSave = async (hospital) => {
    requireAuth({
      action: async () => {
        const result = await toggleSave(hospital.slug);
        if (result?.error) {
          setToast({ message: 'We couldn’t update your saved hospitals. Please try again.', tone: 'error' });
        } else if (typeof result?.saved === 'boolean') {
          setToast({
            message: result.saved ? `${hospital.name} saved.` : `${hospital.name} removed from saved hospitals.`,
            tone: 'success',
          });
        }
      },
      message: 'Sign in to save hospitals to your personal shortlist.',
      returnTo: `${location.pathname}${location.search}`,
      resumeAction: async () => {
        const result = await toggleSave(hospital.slug);
        if (typeof result?.saved === 'boolean') {
          setToast({
            message: result.saved ? `${hospital.name} saved.` : `${hospital.name} removed from saved hospitals.`,
            tone: 'success',
          });
        }
      },
    });
  };

  const handleLoadMore = () => {
    requireAuth({
      action: loadMore,
      message: 'Create a free account to continue exploring hospitals and keep your discovery journey organized.',
      returnTo: `${location.pathname}${location.search}`,
      resumeAction: loadMore,
    });
  };

  // Build Results Header chips logic
  const activeChips = [];
  if (filters.city) activeChips.push({ key: 'city', label: filters.city });
  if (filters.locality) activeChips.push({ key: 'locality', label: filters.locality });
  if (filters.specialty) activeChips.push({ key: 'specialty', label: filters.specialty });
  if (filters.type) activeChips.push({ key: 'type', label: formatHospitalType(filters.type) });
  if (filters.facility) activeChips.push({ key: 'facility', label: filters.facility });

  return (
    <AppPageContainer className={`discovery-page ${isComparing ? 'pb-24 sm:pb-28' : ''}`}>
      {/* Search Introduction */}
      <div className="discovery-header mb-6">
        <SectionEyebrow className="mb-2">Healthcare Directory</SectionEyebrow>
        <h1 className="text-3xl md:text-4xl lg:text-[40px] leading-tight font-serif font-bold text-foreground mb-2.5 text-left">
          Explore Hospitals & Medical Centers
        </h1>
        <p className="text-muted-foreground text-left text-sm sm:text-base max-w-2xl mb-5 leading-relaxed">
          Search hospitals, clinical specialties, and healthcare facilities across supported regions using transparent public records.
        </p>

        <div className="w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="discovery-search relative flex items-center group w-full bg-surface border border-border/80 hover:border-primary/40 rounded-xl shadow-[0_2px_12px_rgba(10,122,106,0.04)] focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary transition-all duration-150 h-[52px]"
          >
            <div className="pl-3.5 pr-2 text-muted-foreground group-focus-within:text-primary transition-colors flex items-center justify-center shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              type="search"
              aria-label="Search healthcare directory"
              placeholder="Search by hospital name, city, specialty, or locality..."
              className="flex-1 h-full bg-transparent text-foreground placeholder:text-muted-foreground/65 focus:outline-none text-xs sm:text-sm min-w-0 pr-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center pr-2 shrink-0 gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); updateFilter('q', ''); }}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-elevated transition-colors"
                  aria-label="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 h-[38px] bg-primary text-white font-bold text-xs sm:text-sm rounded-lg hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-sm active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex items-center gap-2.5 mb-5 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 bg-surface border border-border/80 rounded-xl text-xs sm:text-sm font-semibold text-foreground shadow-sm active:scale-95 transition-all"
          aria-expanded={isMobileFiltersOpen}
        >
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex-1 relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full pl-3 pr-7 py-2.5 bg-surface border border-border/80 rounded-xl text-xs sm:text-sm font-semibold text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            aria-label="Sort hospitals"
          >
            <option value="name_asc">Sort: Name A–Z</option>
            <option value="name_desc">Sort: Name Z–A</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 xl:gap-7 items-start relative">
        {/* Sidebar Filters */}
        <FilterPanel open={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} label="Hospital directory filters">
          <div className="flex items-center justify-between lg:hidden mb-4 shrink-0 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-1 hover:bg-surface-elevated rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <div className="hidden lg:flex items-center justify-between mb-3.5">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter Facilities</h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <CollapsibleFilter
                title="City"
                icon={MapPin}
                options={facets.cities}
                value={filters.city}
                onChange={(val) => updateFilter('city', val)}
                defaultOpen={true}
              />
              <CollapsibleFilter
                title="Area / Locality"
                icon={MapPin}
                options={filters.city ? (facets.cityToLocalities?.[filters.city] || []) : (facets.localities || [])}
                value={filters.locality}
                onChange={(val) => updateFilter('locality', val)}
                defaultOpen={true}
              />
              <CollapsibleFilter
                title="Medical Specialty"
                icon={Activity}
                options={facets.specialties}
                value={filters.specialty}
                onChange={(val) => updateFilter('specialty', val)}
                defaultOpen={true}
              />
              <CollapsibleFilter
                title="Hospital Type"
                icon={Building2}
                options={facets.types}
                value={filters.type}
                onChange={(val) => updateFilter('type', val)}
                defaultOpen={true}
                formatOption={formatHospitalType}
              />
              <CollapsibleFilter
                title="Facilities & Care"
                icon={BedDouble}
                options={facets.facilities}
                value={filters.facility}
                onChange={(val) => updateFilter('facility', val)}
              />
            </div>

            {/* Mobile apply and reset actions */}
            <div className="mt-6 pt-3 border-t border-border/70 lg:hidden flex items-center gap-2.5 pb-safe">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 px-3 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-elevated text-xs transition-colors text-center"
                >
                  Reset all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-2.5 px-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover text-xs shadow-sm transition-colors text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </FilterPanel>

        {/* Main Content Area */}
        <section
          className={`discovery-results flex-1 min-w-0 w-full flex flex-col ${isComparing ? 'mb-20 sm:mb-24' : 'mb-6'}`}
          aria-labelledby="hospital-results-heading"
        >
          {/* Results Toolbar */}
          <div className="results-toolbar">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                <h2 id="hospital-results-heading" className="text-xs sm:text-sm font-bold text-foreground">
                  {loading && hospitals.length === 0 ? (
                    'Searching hospitals...'
                  ) : (
                    <>
                      <span className="text-primary font-bold">{totalCount ?? hospitals.length}</span>{' '}
                      {(totalCount ?? hospitals.length) === 1 ? 'hospital' : 'hospitals'} found
                    </>
                  )}
                </h2>
              </div>

              {/* Active Filter Chips */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center gap-1.5 pt-0.5"
                  >
                    {filters.q && (
                      <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[11px] font-semibold">
                        <span>Search: &quot;{filters.q}&quot;</span>
                        <button
                          type="button"
                          onClick={() => { setQuery(''); updateFilter('q', ''); }}
                          className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                          aria-label="Remove search filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {activeChips.map(chip => (
                      <span
                        key={chip.key}
                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[11px] font-semibold"
                      >
                        <span>{chip.label}</span>
                        <button
                          type="button"
                          onClick={() => updateFilter(chip.key, '')}
                          className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                          aria-label={`Remove ${chip.key} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors ml-1 underline decoration-muted-foreground/40 hover:decoration-primary"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="desktop-sort hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground font-semibold">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-2.5 pr-7 py-1.5 bg-surface hover:bg-surface-elevated border border-border/80 rounded-lg text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none appearance-none cursor-pointer shadow-sm transition-all"
                  aria-label="Sort hospitals"
                >
                  <option value="name_asc">Name A–Z</option>
                  <option value="name_desc">Name Z–A</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-6 p-5 text-center bg-red-50/70 rounded-2xl border border-red-200 shadow-sm">
              <h3 className="text-sm font-bold text-red-900 mb-1">We couldn’t load the hospital directory.</h3>
              <p className="text-red-700/80 text-xs mb-3">Please check your connection and try again.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3.5 py-1.5 bg-white border border-red-300 rounded-lg text-xs font-semibold text-red-800 hover:bg-red-50 transition-colors shadow-sm"
              >
                Reload directory
              </button>
            </div>
          ) : null}

          {/* Results Grid - Responsive 1, 2, or 3 columns */}
          <div className="hospital-grid mb-6">
            {loading && hospitals.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <HospitalCardSkeleton key={i} />
              ))
            ) : hospitals.length > 0 ? (
              hospitals.map(hospital => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  isSaved={savedSlugs.has(hospital.slug)}
                  onSave={() => void handleSave(hospital)}
                />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={Building2}
                  eyebrow="Directory Search"
                  title={filters.q ? `No hospitals found for "${filters.q}"` : 'No hospitals match these filters'}
                  description="We couldn't locate any facilities matching your current filter criteria. Try adjusting your location, clearing specific filters, or searching for a broader region."
                  action={
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="px-5 py-2.5 bg-primary text-white font-semibold text-xs rounded-xl hover:bg-primary-hover shadow-sm transition-all active:scale-95"
                    >
                      Reset all filters
                    </button>
                  }
                />
              </div>
            )}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="px-5 py-2.5 bg-surface border border-border/80 rounded-xl text-xs font-bold text-foreground hover:bg-surface-elevated hover:border-primary/40 transition-all shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
              >
                {loading ? 'Loading more hospitals...' : `Load more hospitals (showing ${hospitals.length} of ${totalCount})`}
              </button>
            </div>
          )}
        </section>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </AppPageContainer>
  );
}
