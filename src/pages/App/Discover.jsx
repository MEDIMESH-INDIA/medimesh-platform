import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filters State
  const activeSpecialty = searchParams.get('specialty') || '';
  const activeLocation = searchParams.get('location') || '';
  const activeType = searchParams.get('type') || '';

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      searchParams.set('q', query);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const setFilter = (key, value) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setQuery('');
  };

  // Derived options for filters from demo data (or real data)
  const locations = [...new Set(demoHospitals.map(h => h.location))];
  const types = [...new Set(demoHospitals.map(h => h.type))];
  const specialties = [...new Set(demoHospitals.flatMap(h => h.specialties || []))];

  // Apply filters
  const filteredHospitals = useMemo(() => {
    return demoHospitals.filter(h => {
      const q = searchParams.get('q')?.toLowerCase();
      if (q) {
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesSpec = h.specialties?.some(s => s.toLowerCase().includes(q));
        const matchesFac = h.facilities?.some(f => f.toLowerCase().includes(q));
        const matchesLoc = h.location?.toLowerCase().includes(q);
        if (!matchesName && !matchesSpec && !matchesFac && !matchesLoc) return false;
      }
      if (activeSpecialty && !h.specialties?.some(s => s.toLowerCase() === activeSpecialty.toLowerCase())) return false;
      if (activeLocation && h.location !== activeLocation) return false;
      if (activeType && h.type !== activeType) return false;
      return true;
    });
  }, [searchParams, activeSpecialty, activeLocation, activeType]);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      {/* Top Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white text-foreground shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base placeholder:text-muted-foreground/70"
              placeholder="Search hospitals, specialties, facilities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="button"
            className="md:hidden px-4 py-3 bg-surface border border-border rounded-xl text-foreground flex items-center gap-2 font-medium"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="flex flex-1 gap-8 min-h-0 relative">
        {/* Desktop Sidebar Filters */}
        <aside className={`
          fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-border shadow-2xl p-6 transform transition-transform duration-300 md:relative md:inset-auto md:w-64 md:border-l-0 md:border-r md:shadow-none md:p-0 md:pr-6 md:transform-none md:translate-x-0 md:bg-transparent overflow-y-auto
          ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="text-xl font-bold font-serif">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 -mr-2 text-muted-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden md:flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h2>
            {searchParams.toString() && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <select 
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={activeLocation}
                onChange={(e) => setFilter('location', e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hospital Type</label>
              <select 
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={activeType}
                onChange={(e) => setFilter('type', e.target.value)}
              >
                <option value="">All Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Specialty</label>
              <select 
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={activeSpecialty}
                onChange={(e) => setFilter('specialty', e.target.value)}
              >
                <option value="">All Specialties</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <div className="mt-8 md:hidden">
            <button 
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Show Results
            </button>
          </div>
        </aside>

        {/* Overlay for mobile filters */}
        {isMobileFiltersOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto pb-12">
          {filteredHospitals.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No hospitals match these filters.</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or clearing some filters.</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="text-sm text-muted-foreground mb-2">
                Showing {filteredHospitals.length} result{filteredHospitals.length !== 1 ? 's' : ''}
              </div>
              {filteredHospitals.map(hospital => (
                <HospitalCard 
                  key={hospital.id} 
                  hospital={hospital} 
                  onCompare={() => navigate(`/app/compare?add=${hospital.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

