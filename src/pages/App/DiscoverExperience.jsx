import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Building2, X, Filter, Heart } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import HospitalCard from '../../components/hospital/HospitalCard';
import { useHospitalSearch } from '../../hooks/useHospitalSearch';
import { useHospitalFacets } from '../../hooks/useHospitalFacets';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { AnimatePresence, motion } from 'framer-motion';

export default function DiscoverExperience({ mode = 'canonical' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { savedSlugs, toggleSave } = useSavedHospitals();
  
  // Local state for filters
  const [query, setQuery] = useState(searchParams.get('q') || '');
  
  const filters = {
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    specialty: searchParams.get('specialty') || '',
  };

  const [sort, setSort] = useState('name_asc');

  // We explicitly manage mode for the whole page (e.g. if Supabase fails)
  const [activeMode, setActiveMode] = useState(mode);

  const { facets } = useHospitalFacets({ mode: activeMode });
  const { hospitals, loading, error, hasMore, loadMore } = useHospitalSearch({ 
    mode: activeMode, 
    filters, 
    sort 
  });

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setQuery('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('q', query);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <AppPageContainer>
      {/* Header Area */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 mb-8 border border-border">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">Explore Healthcare</h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
          Find and compare structured healthcare information from verified sources and live providers.
        </p>
        
        <form onSubmit={handleSearch} className="relative max-w-3xl flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search hospitals by name, city, or locality..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm text-foreground"
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm hidden sm:block"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-foreground"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground"
          >
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>

        {/* Sidebar Filters */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-full max-w-xs bg-background border-r border-border shadow-2xl lg:shadow-none p-6 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0 lg:border-r-0 lg:p-0 lg:bg-transparent overflow-y-auto lg:overflow-visible
          ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="text-lg font-bold text-foreground">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-surface rounded-lg">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="sticky top-6">
            <h2 className="text-xl font-bold text-foreground mb-6 hidden lg:block">Filters</h2>
            
            <div className="space-y-8">
              {/* Location */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Location
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio"
                      className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                      checked={filters.location === ''}
                      onChange={() => updateFilter('location', '')}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">Any location</span>
                  </label>
                  {facets.locations.map(loc => (
                    <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                        checked={filters.location === loc}
                        onChange={() => updateFilter('location', loc)}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" /> Specialty
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio"
                      className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                      checked={filters.specialty === ''}
                      onChange={() => updateFilter('specialty', '')}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">Any specialty</span>
                  </label>
                  {facets.specialties.map(s => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                        checked={filters.specialty === s}
                        onChange={() => updateFilter('specialty', s)}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Hospital Type
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio"
                      className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                      checked={filters.type === ''}
                      onChange={() => updateFilter('type', '')}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">Any type</span>
                  </label>
                  {facets.types.map(t => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                        checked={filters.type === t}
                        onChange={() => updateFilter('type', t)}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border lg:hidden">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-foreground text-background font-semibold rounded-xl"
              >
                Show Results
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
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Active Filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 mb-4 overflow-hidden"
              >
                <span className="text-sm text-muted-foreground mr-1">Active filters:</span>
                {filters.q && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    Search: &quot;{filters.q}&quot;
                    <button onClick={() => { setQuery(''); updateFilter('q', ''); }}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                )}
                {filters.location && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    {filters.location}
                    <button onClick={() => updateFilter('location', '')}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                )}
                {filters.specialty && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    {filters.specialty}
                    <button onClick={() => updateFilter('specialty', '')}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                )}
                {filters.type && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    {filters.type}
                    <button onClick={() => updateFilter('type', '')}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                )}
                <button 
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-primary hover:underline ml-2"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              {loading && hospitals.length === 0 ? 'Searching...' : 
               `${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''} found`}
               {filters.location ? ` • ${filters.location}` : ''}
            </h2>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="name_asc">Name (A-Z)</option>
              </select>
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

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
            {loading && hospitals.length === 0 ? (
              // Skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 bg-surface rounded-[22px] border border-border animate-pulse p-5">
                  <div className="w-2/3 h-6 bg-muted rounded mb-3"></div>
                  <div className="w-1/2 h-4 bg-muted rounded mb-8"></div>
                  <div className="flex gap-2 mb-6">
                    <div className="w-16 h-5 bg-muted rounded"></div>
                    <div className="w-20 h-5 bg-muted rounded"></div>
                  </div>
                  <div className="w-full h-10 bg-muted rounded"></div>
                </div>
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
              <div className="col-span-full py-16 text-center bg-surface/30 rounded-2xl border border-dashed border-border/60">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No hospitals match these filters.</h3>
                <p className="text-sm text-muted-foreground mb-6">Try expanding your location or clearing specific facility requirements.</p>
                <button 
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-surface transition-colors shadow-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pb-20">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="px-8 py-3 bg-surface border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-surface/80 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : `Load more hospitals`}
              </button>
            </div>
          )}
        </main>
      </div>
    </AppPageContainer>
  );
}
