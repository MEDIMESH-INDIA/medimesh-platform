import FilterPanel from '../../components/hospital/FilterPanel';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Stethoscope, Activity, X, Filter, ChevronDown, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AppPageContainer from '../../components/layout/AppPageContainer';
import DoctorCard from '../../components/doctor/DoctorCard';
import DoctorCardSkeleton from '../../components/doctor/DoctorCardSkeleton';
import CollapsibleFilter from '../../components/hospital/CollapsibleFilter';
import { useDoctorSearch } from '../../hooks/useDoctorSearch';
import { getDoctorFacets } from '../../lib/data/doctorRepository';

export default function HomeVisitDoctorExperience() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('name_asc');
  const [facets, setFacets] = useState({ locations: [], specializations: [], hospitals: [] });

  const filters = {
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    specialization: searchParams.get('specialization') || '',
    hospital: searchParams.get('hospital') || '',
    language: searchParams.get('language') || '',
    serviceArea: searchParams.get('serviceArea') || '',
    homeVisitsOnly: true,
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

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
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

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => k !== 'homeVisitsOnly' && v !== '' && v !== false);

  const activeChips = [];
  if (filters.serviceArea) activeChips.push({ key: 'serviceArea', label: filters.serviceArea });
  if (filters.specialization) activeChips.push({ key: 'specialization', label: filters.specialization });
  if (filters.language) activeChips.push({ key: 'language', label: filters.language });

  return (
    <AppPageContainer className="discovery-page">
      {/* Hero Header & Search */}
      <div className="discovery-header mb-8">
        <h1 className="text-[30px] md:text-[36px] lg:text-[42px] leading-tight font-serif font-bold text-foreground mb-3 text-left flex items-center justify-start gap-3">
          Home Visit Doctors
        </h1>
        <div className="flex w-fit items-center gap-2 px-3 py-2 bg-amber-50/70 text-amber-800 text-xs font-medium rounded-xl mb-3 border border-amber-200/50">
          <Activity className="w-3.5 h-3.5" /> Home visits are intended for non-emergency care.
        </div>
        <p className="text-muted-foreground text-left text-[16px] md:text-[18px] max-w-[700px] mb-6 leading-relaxed mx-0">
          Find doctors who offer non-emergency home consultations across supported areas.
        </p>


        <div className="w-full">
          <form onSubmit={handleSearchSubmit} className="discovery-search relative flex items-center group w-full bg-white border border-border/80 hover:border-primary/30 rounded-[16px] shadow-[0_2px_12px_rgba(18,49,43,0.04)] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 h-[56px]">
            <div className="pl-4 pr-3 text-muted-foreground group-focus-within:text-primary transition-colors flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="search"
              aria-label="Search healthcare directory"
              placeholder="Search home visit doctors by name, specialty, or area..."
              className="flex-1 h-full bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none text-[15px] min-w-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center pr-2 shrink-0 gap-1">
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); updateFilter('q', ''); }}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="ml-1 px-5 h-[40px] bg-primary text-white font-semibold text-[14px] rounded-[10px] hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Filters Trigger */}
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-foreground"
        >
          <Filter className="w-4 h-4" /> Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
        </button>
        <div className="flex-1 relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Sort doctors"
          >
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="experience_desc">Experience (High to Low)</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
        {/* Sidebar Filters */}
        <FilterPanel open={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} label="Healthcare filters">
          <div className="flex items-center justify-between lg:hidden mb-6 shrink-0">
            <h2 className="text-lg font-bold text-foreground">Filters</h2>
            <button type="button" onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-surface rounded-lg" aria-label="Close filters">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 hidden lg:block">Filter by</h2>

            <div className="space-y-3">
              <CollapsibleFilter
                title="Specialization"
                icon={Stethoscope}
                options={facets.specializations}
                value={filters.specialization}
                onChange={(val) => updateFilter('specialization', val)}
                defaultOpen={true}
              />
              <CollapsibleFilter
                title="Service Area"
                icon={MapPin}
                options={facets.serviceAreas || []}
                value={filters.serviceArea}
                onChange={(val) => updateFilter('serviceArea', val)}
                defaultOpen={true}
              />
              <CollapsibleFilter
                title="Language"
                icon={Globe}
                options={facets.languages || []}
                value={filters.language}
                onChange={(val) => updateFilter('language', val)}
                defaultOpen={true}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-border lg:hidden pb-safe">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </FilterPanel>

        {/* Mobile Filter Backdrop */}


        {/* Main Content */}
        <section className="discovery-results flex-1 min-w-0 w-full flex flex-col" aria-labelledby="doctor-results-heading">
          {/* Results Header */}
          <div className="results-toolbar">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50 w-full">
              <h2 id="doctor-results-heading" className="text-sm font-semibold text-foreground">
                {loading && doctors.length === 0 ? 'Searching...' :
                 `${totalCount ?? doctors.length} doctor${(totalCount ?? doctors.length) !== 1 ? 's' : ''} found`}
              </h2>

              {/* Active Filter Chips */}
              </div>
            <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {filters.q && (
                      <span className="flex items-center gap-1.5 pl-3 pr-1 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full text-[13px] font-medium">
                        Search: &quot;{filters.q}&quot;
                        <button type="button" onClick={() => { setQuery(''); updateFilter('q', ''); }} className="p-0.5 hover:bg-border/60 rounded-full"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {activeChips.map(chip => (
                      <span key={chip.key} className="flex items-center gap-1.5 pl-3 pr-1 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full text-[13px] font-medium">
                        {chip.label}
                        <button type="button" onClick={() => updateFilter(chip.key, '')} className="p-0.5 hover:bg-border/60 rounded-full"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[12px] font-medium text-primary hover:underline ml-1"
                    >
                      Clear all
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            <div className="desktop-sort hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-surface/50 hover:bg-surface border border-border/80 rounded-lg text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer transition-colors"
                  aria-label="Sort doctors"
                >
                  <option value="name_asc">Name A–Z</option>
                  <option value="name_desc">Name Z–A</option>
                  <option value="experience_desc">Experience (High to Low)</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 py-6 px-4 text-center bg-red-50/50 rounded-2xl border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-1">Could not load medical professionals</h3>
              <p className="text-red-600/80 text-sm mb-4">Please refresh or try again in a moment.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Doctors Grid */}
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
              <div className="col-span-full py-10 text-center bg-surface/30 rounded-[20px] border border-dashed border-border/60">
                <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50 shadow-sm">
                  <Stethoscope className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {filters.q ? `No home visit doctors found for "${filters.q}".` : 'No home visit doctors match these filters.'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">Try expanding your service area or clearing other criteria.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-5 py-2 bg-white border border-border/80 rounded-xl text-sm font-semibold text-foreground hover:bg-surface hover:border-border transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-surface border border-border/80 rounded-xl text-sm font-semibold text-foreground hover:bg-surface/80 hover:border-border transition-all shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {loading ? 'Loading...' : 'Load more doctors'}
              </button>
            </div>
          )}
        </section>
      </div>
    </AppPageContainer>
  );
}
