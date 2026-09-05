import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, Globe, Database } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase/client';
import PageHeader from '../../components/common/PageHeader';
import FrostedPanel from '../../components/common/FrostedPanel';
import SourceBadge from '../../components/common/SourceBadge';

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [dataSource, setDataSource] = useState('demo'); // 'demo' | 'live'
  const [liveHospitals, setLiveHospitals] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  
  const { savedSlugs, toggleSave } = useSavedHospitals();

  const activeSpecialty = searchParams.get('specialty') || '';
  const activeLocation = searchParams.get('location') || '';
  const activeType = searchParams.get('type') || '';

  const handleSearch = async (e, source = dataSource) => {
    if (e) e.preventDefault();
    if (source === 'demo') {
      if (query.trim()) {
        setSearchParams(prev => { prev.set('q', query); return prev; });
      } else {
        setSearchParams(prev => { prev.delete('q'); return prev; });
      }
    } else {
      // Live search
      setLiveLoading(true);
      setLiveError(null);
      try {
        const { data, error } = await supabase.functions.invoke('google-places-proxy', {
          body: { query: query.trim() || 'hospitals in Navi Mumbai, Maharashtra' }
        });
        
        if (error) throw new Error(error.message || 'API request failed');
        if (data?.error) throw new Error(data.error);
        
        setLiveHospitals(data?.hospitals || []);
      } catch (err) {
        setLiveError("Live hospital search unavailable in this environment.");
        console.error(err);
      } finally {
        setLiveLoading(false);
      }
    }
  };

  const updateFilter = (key, value) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setQuery('');
  };

  const locations = [...new Set(demoHospitals.map(h => h.location))];
  const specialties = [...new Set(demoHospitals.flatMap(h => h.specialties))];
  const types = [...new Set(demoHospitals.map(h => h.type))];

  const demoFiltered = demoHospitals.filter(h => {
    const normalizedQuery = (searchParams.get('q') || '').trim().toLowerCase();
    const matchesSearch = !normalizedQuery || h.name.toLowerCase().includes(normalizedQuery) || h.location.toLowerCase().includes(normalizedQuery) || h.specialties.some(s => s.toLowerCase().includes(normalizedQuery));
    
    const matchesSpecialty = activeSpecialty ? h.specialties.some(s => s.toLowerCase() === activeSpecialty.toLowerCase()) : true;
    const matchesLocation = activeLocation ? h.location.toLowerCase() === activeLocation.toLowerCase() : true;
    const matchesType = activeType ? h.type.toLowerCase() === activeType.toLowerCase() : true;

    return matchesSearch && matchesSpecialty && matchesLocation && matchesType;
  });

  const filteredHospitals = dataSource === 'demo' ? demoFiltered : liveHospitals;

  const hasActiveFilters = activeSpecialty || activeLocation || activeType || searchParams.get('q');

  return (
    <AppPageContainer>
      {/* Header & Search */}
      <header className="relative z-10 mb-10">
        <PageHeader
          eyebrow="Explore healthcare"
          title="Discover hospitals"
          description="Search healthcare providers, refine options and understand the source behind each record."
          actions={<div className="flex rounded-[14px] border border-white/80 bg-white/65 p-1 shadow-sm backdrop-blur-xl">
            <button
              onClick={() => { setDataSource('demo'); setLiveHospitals([]); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                dataSource === 'demo' ? 'bg-white shadow-sm border border-border/50 text-primary ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
            >
              <Database className="w-4 h-4" />
              MEDIMESH Demo
            </button>
            <button
              onClick={() => { setDataSource('live'); void handleSearch(null, 'live'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                dataSource === 'live' ? 'bg-white shadow-sm border border-border/50 text-primary ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              Live Places
            </button>
          </div>}
        />

        <FrostedPanel variant="elevated" className="max-w-3xl rounded-[22px] p-2">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
          <div className="relative flex h-[58px] items-center rounded-[15px] border border-border bg-white/75 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="w-5 h-5 text-muted-foreground ml-5 shrink-0" />
            <input 
              type="text" 
              placeholder="Search hospitals, specialties or locations..." 
              className="w-full h-full bg-transparent border-none focus:ring-0 px-4 text-foreground text-lg placeholder:text-muted-foreground/60 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                type="button"
                onClick={() => { setQuery(''); updateFilter('q', ''); }}
                className="p-2 text-muted-foreground hover:text-foreground mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button 
              type="submit"
              className="h-[44px] px-6 mr-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </form>
        </FrostedPanel>
        
        <div className="lg:hidden mt-4">
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl bg-white text-foreground font-medium shadow-sm active:scale-95 transition-transform"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="w-5 h-5" /> Filters
          </button>
        </div>
      </header>

      <div className="flex gap-8 flex-1 relative pb-12">
        {/* Desktop Sidebar Filters */}
        <aside className={`fixed inset-y-0 right-0 z-40 w-[280px] border-l border-white/80 bg-white/90 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:sticky lg:top-8 lg:self-start lg:transform-none lg:w-72 lg:border lg:rounded-[22px] lg:shadow-[0_14px_40px_rgba(15,40,35,0.06)] lg:z-0 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto ${
          isMobileFiltersOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-[calc(100%+1rem)] lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col p-6 lg:p-6">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h2>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-muted-foreground hover:bg-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-8 pr-2">
              {/* Location */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Location</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                      checked={activeLocation === ''}
                      onChange={() => updateFilter('location', '')}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">Any location</span>
                  </label>
                  {locations.map(loc => (
                    <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                        checked={activeLocation === loc}
                        onChange={() => updateFilter('location', loc)}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Specialty</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                      checked={activeSpecialty === ''}
                      onChange={() => updateFilter('specialty', '')}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">Any specialty</span>
                  </label>
                  {specialties.map(spec => (
                    <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                        checked={activeSpecialty === spec}
                        onChange={() => updateFilter('specialty', spec)}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Facility Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                      checked={activeType === ''}
                      onChange={() => updateFilter('type', '')}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">Any type</span>
                  </label>
                  {types.map(t => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-border checked:ring-primary"
                        checked={activeType === t}
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
                {searchParams.get('q') && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    Search: &quot;{searchParams.get('q')}&quot;
                    <button onClick={() => { setQuery(''); updateFilter('q', ''); }}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                )}
                {activeLocation && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    {activeLocation}
                    <button onClick={() => updateFilter('location', '')}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                )}
                {activeSpecialty && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    {activeSpecialty}
                    <button onClick={() => updateFilter('specialty', '')}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                  </span>
                )}
                {activeType && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm font-medium text-foreground">
                    {activeType}
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
              {liveLoading ? 'Searching live places...' : `${filteredHospitals.length} result${filteredHospitals.length !== 1 ? 's' : ''}`}
            </h2>
            {dataSource === 'live' && (
              <SourceBadge>Results provided by Google</SourceBadge>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 pb-20">
            {liveLoading ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Contacting Google Places API...</p>
              </div>
            ) : liveError ? (
              <div className="col-span-full py-16 text-center bg-red-50/50 rounded-2xl border border-red-200">
                <Globe className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-1">Search Unavailable</h3>
                <p className="text-red-600/80">{liveError}</p>
                <button 
                  onClick={() => setDataSource('demo')}
                  className="mt-6 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                >
                  Return to Demo Database
                </button>
              </div>
            ) : filteredHospitals.length > 0 ? (
              filteredHospitals.map(hospital => (
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
                <h3 className="text-lg font-semibold text-foreground mb-1">No hospitals found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-6 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppPageContainer>
  );
}
