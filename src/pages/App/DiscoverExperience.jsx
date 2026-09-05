import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Building2, X, Filter, Activity, ChevronDown } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import HospitalCard from '../../components/hospital/HospitalCard';
import HospitalCardSkeleton from '../../components/hospital/HospitalCardSkeleton';
import CollapsibleFilter from '../../components/hospital/CollapsibleFilter';
import CompareTray from '../../components/hospital/CompareTray';
import { useHospitalSearch } from '../../hooks/useHospitalSearch';
import { useHospitalFacets } from '../../hooks/useHospitalFacets';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { formatHospitalType } from '../../lib/utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';

export default function DiscoverExperience({ requireAuth, activeMode, setActiveMode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedSlugs, toggleSave } = useSavedHospitals(requireAuth);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  
  const [sort, setSort] = useState('name_asc');

  const filters = {
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    specialty: searchParams.get('specialty') || '',
    type: searchParams.get('type') || ''
  };

  const { hospitals, loading, error, hasMore, loadMore } = useHospitalSearch({
    filters,
    sort,
    mode: activeMode,
    pageSize: 12
  });

  const { facets } = useHospitalFacets(activeMode);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    if (key === 'q') setQuery(value); // Sync local state
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

  // Build Results Header chips logic
  const activeChips = [];
  if (filters.location) activeChips.push({ key: 'location', label: filters.location });
  if (filters.specialty) activeChips.push({ key: 'specialty', label: filters.specialty });
  if (filters.type) activeChips.push({ key: 'type', label: formatHospitalType(filters.type) });

  return (
    <AppPageContainer className="!max-w-[1240px]">
      {/* Hero Search Area */}
      <div className="mb-6 lg:mb-8 pt-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 text-center lg:text-left">
          Explore Healthcare
        </h1>
        <p className="text-muted-foreground text-center lg:text-left text-sm md:text-base max-w-2xl mb-6">
          Find and compare structured healthcare information from verified sources across supported regions.
        </p>
        
        <div className="max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by hospital name, city, or locality..."
              className="w-full pl-12 pr-[140px] py-3.5 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); updateFilter('q', ''); }}
                className="absolute right-[130px] p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              type="submit"
              className="absolute right-2 px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:shadow-sm active:scale-95 transition-all duration-150"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-foreground"
        >
          <Filter className="w-4 h-4" /> Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
        <div className="flex-1 relative">
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
        {/* Sidebar Filters */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-0
          w-full sm:w-[320px] lg:w-[260px] 
          bg-background lg:bg-transparent
          border-r border-border lg:border-none
          p-6 lg:p-0
          overflow-y-auto lg:overflow-visible
          transition-transform duration-300 ease-in-out
          ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
          <div className="flex items-center justify-between lg:hidden mb-6 shrink-0">
            <h2 className="text-lg font-bold text-foreground">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-surface rounded-lg">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 hidden lg:block">Filter by</h2>
            
            <div className="space-y-4">
              <CollapsibleFilter
                title="Location"
                icon={MapPin}
                options={facets.locations}
                value={filters.location}
                onChange={(val) => updateFilter('location', val)}
                defaultOpen={true}
              />
              <CollapsibleFilter
                title="Specialty"
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
            </div>
            
            {/* Mobile apply button */}
            <div className="mt-8 pt-6 border-t border-border lg:hidden pb-safe">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Backdrop */}
        {isMobileFiltersOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full flex flex-col pb-24 lg:pb-32">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-foreground">
                {loading && hospitals.length === 0 ? 'Searching...' : 
                 `${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''} found`}
              </h2>
              {/* Active Filter Chips */}
              <AnimatePresence>
                {activeChips.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {filters.q && (
                      <span className="flex items-center gap-1 pl-2.5 pr-1 py-1 bg-surface border border-border/60 rounded-full text-[12px] font-medium text-muted-foreground">
                        Search: &quot;{filters.q}&quot;
                        <button onClick={() => { setQuery(''); updateFilter('q', ''); }} className="p-0.5 hover:bg-border/60 rounded-full"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {activeChips.map(chip => (
                      <span key={chip.key} className="flex items-center gap-1 pl-2.5 pr-1 py-1 bg-surface border border-border/60 rounded-full text-[12px] font-medium text-muted-foreground">
                        {chip.label}
                        <button onClick={() => updateFilter(chip.key, '')} className="p-0.5 hover:bg-border/60 rounded-full"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <button 
                      onClick={clearAllFilters}
                      className="text-[12px] font-medium text-primary hover:underline ml-1"
                    >
                      Clear all
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 shrink-0 self-start">
              <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
              <div className="relative">
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-surface/50 hover:bg-surface border border-border/80 rounded-lg text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="name_asc">Name A–Z</option>
                  <option value="name_desc">Name Z–A</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          
          {error && activeMode === 'canonical' ? (
            <div className="mb-6 py-6 px-4 text-center bg-red-50/50 rounded-2xl border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-1">Database Unavailable</h3>
              <p className="text-red-600/80 text-sm mb-4">Unable to reach the canonical hospital catalog.</p>
              <button 
                onClick={() => setActiveMode('demo')}
                className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
              >
                Switch to Demo Mode
              </button>
            </div>
          ) : null}

          {/* Grid setup based on rules: Desktop (lg): 2 cols, Medium/Tablet: 1 col, Mobile: 1 col */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6 mb-8">
            {loading && hospitals.length === 0 ? (
              // Skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <HospitalCardSkeleton key={i} />
              ))
            ) : hospitals.length > 0 ? (
              hospitals.map(hospital => (
                <HospitalCard 
                  key={hospital.id} 
                  hospital={hospital}
                  isSaved={savedSlugs.has(hospital.slug)}
                  onSave={() => toggleSave(hospital.slug)}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-surface/30 rounded-[24px] border border-dashed border-border/60">
                <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50 shadow-sm">
                  <Search className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {filters.q ? `No hospitals found for "${filters.q}".` : 'No hospitals match these filters.'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">Try expanding your location or clearing specific requirements.</p>
                <button 
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-white border border-border/80 rounded-xl text-sm font-semibold text-foreground hover:bg-surface hover:border-border transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-surface border border-border/80 rounded-xl text-sm font-semibold text-foreground hover:bg-surface/80 hover:border-border transition-all shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {loading ? 'Loading...' : `Load more hospitals`}
              </button>
            </div>
          )}
        </main>
      </div>
      <CompareTray />
    </AppPageContainer>
  );
}
