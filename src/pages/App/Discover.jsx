import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, Globe, Database } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase/client';

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

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (dataSource === 'demo') {
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
    const searchRegex = new RegExp(searchParams.get('q') || '', 'i');
    const matchesSearch = searchRegex.test(h.name) || searchRegex.test(h.location) || h.specialties.some(s => searchRegex.test(s));
    
    const matchesSpecialty = activeSpecialty ? h.specialties.includes(activeSpecialty) : true;
    const matchesLocation = activeLocation ? h.location === activeLocation : true;
    const matchesType = activeType ? h.type === activeType : true;

    return matchesSearch && matchesSpecialty && matchesLocation && matchesType;
  });

  const filteredHospitals = dataSource === 'demo' ? demoFiltered : liveHospitals;

  const hasActiveFilters = activeSpecialty || activeLocation || activeType || searchParams.get('q');

  return (
    <AppPageContainer>
      {/* Header & Search */}
      <header className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Discover Hospitals</h1>
            <p className="text-muted-foreground mt-1">Search the MEDIMESH prototype database.</p>
          </div>
          
          <div className="flex bg-surface p-1 rounded-xl border border-border">
            <button
              onClick={() => { setDataSource('demo'); setLiveHospitals([]); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dataSource === 'demo' ? 'bg-white shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Database className="w-4 h-4" />
              MEDIMESH Demo
            </button>
            <button
              onClick={() => { setDataSource('live'); handleSearch(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dataSource === 'live' ? 'bg-white shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-4 h-4" />
              Live Places
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white text-foreground shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/70"
              placeholder="Search by name, specialty, or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                type="button" 
                onClick={() => { setQuery(''); updateFilter('q', ''); }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="hidden">Search</button>
          </form>
          
          <button 
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl bg-white text-foreground font-medium shadow-sm active:scale-95 transition-transform"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex gap-8 flex-1 relative pb-12">
        {/* Desktop Sidebar Filters */}
        <aside className={`fixed inset-y-0 right-0 z-40 w-[280px] bg-white border-l border-border transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:w-64 lg:bg-transparent lg:border-none lg:z-0 ${
          isMobileFiltersOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col p-6 lg:p-0">
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
                    Search: &quot;{searchParams.get('q')}"
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
              <span className="text-xs text-muted-foreground">Results provided by Google</span>
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
                  onCompare={() => {
                    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
                    if (list.length < 3 && !list.includes(hospital.slug)) {
                      list.push(hospital.slug);
                      localStorage.setItem('compareList', JSON.stringify(list));
                      window.dispatchEvent(new Event('compare-updated'));
                    }
                  }}
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
