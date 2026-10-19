import FilterPanel from '../../components/hospital/FilterPanel';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Stethoscope, Building2, X, Filter, ChevronDown, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AppPageContainer from '../../components/layout/AppPageContainer';
import SectionEyebrow from '../../components/common/SectionEyebrow';
import EmptyState from '../../components/common/EmptyState';
import DoctorCard from '../../components/doctor/DoctorCard';
import DoctorCardSkeleton from '../../components/doctor/DoctorCardSkeleton';
import CollapsibleFilter from '../../components/hospital/CollapsibleFilter';
import { useDoctorSearch } from '../../hooks/useDoctorSearch';
import { getDoctorFacets } from '../../lib/data/doctorRepository';

export default function DoctorDiscoverExperience() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('name_asc');
  const [facets, setFacets] = useState({
    cities: [],
    localities: [],
    cityToLocalities: {},
    specializations: [],
    hospitals: [],
  });

  const filters = {
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    locality: searchParams.get('locality') || '',
    specialization: searchParams.get('specialization') || '',
    hospital: searchParams.get('hospital') || '',
    language: searchParams.get('language') || '',
    homeVisitsOnly: searchParams.get('homeVisitsOnly') === 'true',
  };

  const { doctors, totalCount, loading, error, hasMore, loadMore } = useDoctorSearch({
    filters,
    sort,
    pageSize: 12,
  });

  useEffect(() => {
    let mounted = true;
    getDoctorFacets().then(data => {
      if (mounted && data) setFacets(data);
    });
    return () => { mounted = false; };
  }, []);

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
          const validLocalities = facets.cityToLocalities?.[value] || [];
          if (!validLocalities.includes(currentLocality)) {
            newParams.delete('locality');
          }
        }
      }
    }

    setSearchParams(newParams);
    if (key === 'q') setQuery(value);
  };

  useEffect(() => {
    if (!filters.city || !filters.locality) return;
    if (!facets.cityToLocalities || Object.keys(facets.cityToLocalities).length === 0) return;
    const valid = facets.cityToLocalities[filters.city] || [];
    if (!valid.includes(filters.locality)) {
      const next = new URLSearchParams(searchParams);
      next.delete('locality');
      setSearchParams(next, { replace: true });
    }
  }, [facets.cityToLocalities, filters.city, filters.locality, searchParams, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('q', query);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'q' && v !== '' && v !== false).length;

  const activeChips = [];
  if (filters.city) activeChips.push({ key: 'city', label: filters.city });
  if (filters.locality) activeChips.push({ key: 'locality', label: filters.locality });
  if (filters.specialization) activeChips.push({ key: 'specialization', label: filters.specialization });
  if (filters.hospital) activeChips.push({ key: 'hospital', label: filters.hospital });
  if (filters.language) activeChips.push({ key: 'language', label: `Language: ${filters.language} (unsupported)` });
  if (filters.homeVisitsOnly) activeChips.push({ key: 'homeVisitsOnly', label: 'Home Visits Only' });

  return (
    <AppPageContainer className="discovery-page">
      {/* Search Introduction */}
      <div className="discovery-header mb-8">
        <SectionEyebrow className="mb-2">Practitioner Directory</SectionEyebrow>
        <h1 className="text-3xl md:text-4xl lg:text-[42px] leading-tight font-serif font-bold text-foreground mb-3 text-left">
          Find Qualified Doctors
        </h1>
        <p className="text-muted-foreground text-left text-base md:text-lg max-w-2xl mb-6 leading-relaxed">
          Search medical specialists, clinical consultants, and hospital affiliations across supported healthcare networks with verified credentials.
        </p>

        <div className="w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="discovery-search relative flex items-center group w-full bg-surface border border-border/80 hover:border-primary/40 rounded-2xl shadow-[0_4px_20px_rgba(10,122,106,0.05)] focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-200 h-[58px]"
          >
            <div className="pl-4 pr-2 text-muted-foreground group-focus-within:text-primary transition-colors flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="search"
              aria-label="Search healthcare directory"
              placeholder="Search by doctor name, medical specialty, or affiliated hospital..."
              className="flex-1 h-full bg-transparent text-foreground placeholder:text-muted-foreground/65 focus:outline-none text-sm sm:text-base min-w-0 pr-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center pr-2 shrink-0 gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); updateFilter('q', ''); }}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-elevated transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-5 h-[42px] bg-primary text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-sm active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-border/80 rounded-xl text-sm font-semibold text-foreground shadow-sm active:scale-95 transition-all"
          aria-expanded={isMobileFiltersOpen}
        >
          <Filter className="w-4 h-4 text-primary" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex-1 relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full pl-3.5 pr-8 py-3 bg-surface border border-border/80 rounded-xl text-sm font-semibold text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            aria-label="Sort doctors"
          >
            <option value="name_asc">Sort: Name A–Z</option>
            <option value="name_desc">Sort: Name Z–A</option>
            <option value="experience_desc">Sort: Experience (High to Low)</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
        {/* Sidebar Filters */}
        <FilterPanel open={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} label="Doctor directory filters">
          <div className="flex items-center justify-between lg:hidden mb-5 shrink-0 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-1.5 hover:bg-surface-elevated rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter Doctors</h2>
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

            <div className="space-y-2.5">
              {/* Home Visits Only Toggle Card */}
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between transition-colors hover:border-primary/30">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
                    <Home className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Home Visits Only</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Doctors offering home visits</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean(filters.homeVisitsOnly)}
                    onChange={(e) => updateFilter('homeVisitsOnly', e.target.checked ? 'true' : '')}
                  />
                  <div className="w-10 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-colors"></div>
                </label>
              </div>

              <CollapsibleFilter
                title="Specialization"
                icon={Stethoscope}
                options={facets.specializations}
                value={filters.specialization}
                onChange={(val) => updateFilter('specialization', val)}
                defaultOpen={true}
              />
              <CollapsibleFilter
                title="Hospital Affiliation"
                icon={Building2}
                options={facets.hospitals}
                value={filters.hospital}
                onChange={(val) => updateFilter('hospital', val)}
                defaultOpen={true}
              />
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
            </div>

            {/* Mobile apply and reset actions */}
            <div className="mt-8 pt-4 border-t border-border/70 lg:hidden flex items-center gap-3 pb-safe">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-3 px-4 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-elevated text-xs transition-colors text-center"
                >
                  Reset all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover text-xs shadow-sm transition-colors text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </FilterPanel>

        {/* Main Content */}
        <section className="discovery-results flex-1 min-w-0 w-full flex flex-col" aria-labelledby="doctor-results-heading">
          {/* Results Toolbar */}
          <div className="results-toolbar">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <h2 id="doctor-results-heading" className="text-sm font-bold text-foreground">
                  {loading && doctors.length === 0 ? (
                    'Searching medical professionals...'
                  ) : (
                    <>
                      <span className="text-primary font-bold">{totalCount ?? doctors.length}</span>{' '}
                      {(totalCount ?? doctors.length) === 1 ? 'doctor' : 'doctors'} found
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
                    className="flex flex-wrap items-center gap-1.5 pt-1"
                  >
                    {filters.q && (
                      <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
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
                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold"
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
                      className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors ml-1.5 underline decoration-muted-foreground/40 hover:decoration-primary"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="desktop-sort hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground font-semibold">Sort by:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-surface hover:bg-surface-elevated border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none appearance-none cursor-pointer shadow-sm transition-all"
                  aria-label="Sort doctors"
                >
                  <option value="name_asc">Name A–Z</option>
                  <option value="name_desc">Name Z–A</option>
                  <option value="experience_desc">Experience (High to Low)</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-6 p-6 text-center bg-red-50/70 rounded-2xl border border-red-200 shadow-sm">
              <h3 className="text-base font-bold text-red-900 mb-1">We couldn’t load the doctor directory.</h3>
              <p className="text-red-700/80 text-xs sm:text-sm mb-4">Please check your connection and try again.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white border border-red-300 rounded-xl text-xs font-semibold text-red-800 hover:bg-red-50 transition-colors shadow-sm"
              >
                Reload directory
              </button>
            </div>
          ) : null}

          {/* Results Grid */}
          <div className="doctor-grid mb-8">
            {loading && doctors.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))
            ) : doctors.length > 0 ? (
              doctors.map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={Stethoscope}
                  eyebrow="Doctor Directory"
                  title={filters.q ? `No doctors found for "${filters.q}"` : 'No doctors match these filters'}
                  description="We couldn't locate any practitioners matching your current filter criteria. Try adjusting your specialization, clearing the hospital filter, or expanding your location."
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
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-surface border border-border/80 rounded-xl text-xs font-bold text-foreground hover:bg-surface-elevated hover:border-primary/40 transition-all shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
              >
                {loading ? 'Loading more doctors...' : `Load more doctors (showing ${doctors.length} of ${totalCount})`}
              </button>
            </div>
          )}
        </section>
      </div>
    </AppPageContainer>
  );
}
