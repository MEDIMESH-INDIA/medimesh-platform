import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, X, Check, Minus, GitCompare, Info, Database } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [compareList, setCompareList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('compareList') || '[]');
    } catch {
      return [];
    }
  });
  
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    
    const addSlug = searchParams.get('add');
    if (addSlug && !list.includes(addSlug) && list.length < 3) {
      list.push(addSlug);
      localStorage.setItem('compareList', JSON.stringify(list));
      window.dispatchEvent(new Event('compare-updated'));
      
      // Remove add parameter from URL quietly
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
    
    setCompareList(list);
  }, [searchParams, setSearchParams]);

  const removeHospital = (slug) => {
    const updated = compareList.filter(s => s !== slug);
    localStorage.setItem('compareList', JSON.stringify(updated));
    setCompareList(updated);
    window.dispatchEvent(new Event('compare-updated'));
  };

  const hospitals = compareList
    .map(slug => demoHospitals.find(h => h.slug === slug))
    .filter(Boolean);

  if (hospitals.length === 0) {
    return (
      <AppPageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4 max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-2 border border-border">
            <GitCompare className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">SIDE-BY-SIDE VIEW</p>
            <h1 className="text-3xl font-serif font-bold text-foreground">Compare hospitals</h1>
            <p className="text-muted-foreground mt-2">Evaluate capacity, facilities, and data sources.</p>
          </div>
          <Link to="/app/discover" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Discover hospitals
          </Link>
        </div>
      </AppPageContainer>
    );
  }

  // All known features for comparison rows
  const allFacilities = [...new Set(hospitals.flatMap(h => h.facilities || []))];

  return (
    <AppPageContainer>
      {/* Header */}
      <header className="mb-10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">SIDE-BY-SIDE VIEW</p>
            <h1 className="text-3xl font-serif font-bold text-foreground">Compare hospitals</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Evaluate differences in facilities, capacity and source information.
            </p>
          </div>
          {hospitals.length < 3 && (
            <Link to="/app/discover" className="shrink-0 flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 px-5 py-2.5 rounded-xl transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add another
            </Link>
          )}
        </div>
      </header>

      {/* Comparison Table */}
      <div className="w-full overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden min-w-[720px] md:min-w-[800px] mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="w-56 p-6 border-b border-r border-border bg-surface/30"></th>
                {hospitals.map(h => (
                  <th key={h.id} className="p-6 border-b border-border relative align-top w-1/3 bg-white">
                    <button 
                      onClick={() => removeHospital(h.slug)}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                    <div className="pr-8">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                        {h.trustMetadata?.sourceLabel || 'MEDIMESH Demo'}
                      </div>
                      <h3 className="text-xl font-bold font-serif text-foreground leading-tight mb-2">{h.name}</h3>
                      <p className="text-sm font-medium text-foreground mb-0.5">{h.type}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        {h.location}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              
              {/* Data Provenance */}
              <tr className="bg-surface/50 border-y border-border">
                <td colSpan={hospitals.length + 1} className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold uppercase tracking-wider text-foreground">Data Provenance</span>
                  </div>
                </td>
              </tr>
              <tr className="group">
                <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                  Source
                </td>
                {hospitals.map(h => (
                  <td key={h.id} className="px-6 py-4 border-b border-border text-sm font-medium">
                    {h.trustMetadata?.source || 'Unknown Source'}
                  </td>
                ))}
              </tr>
              <tr className="group">
                <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                  Review State
                </td>
                {hospitals.map(h => {
                  const state = h.trustMetadata?.reviewState || 'Unverified';
                  const isVerified = state.includes('Live') || state.includes('Verified');
                  return (
                    <td key={h.id} className="px-6 py-4 border-b border-border text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        isVerified ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isVerified && <Check className="w-3 h-3" />}
                        {state}
                      </span>
                    </td>
                  )
                })}
              </tr>

              {/* Capacity */}
              <tr className="bg-surface/50 border-y border-border">
                <td colSpan={hospitals.length + 1} className="px-6 py-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground">Capacity</span>
                </td>
              </tr>
              {['Total Beds', 'ICU Beds', 'Emergency', 'Ambulance'].map(metric => {
                const keyMap = {
                  'Total Beds': 'totalBeds',
                  'ICU Beds': 'icuBeds',
                  'Emergency': 'emergency',
                  'Ambulance': 'ambulance'
                };
                const prop = keyMap[metric];
                
                // Highlight row if different
                const values = hospitals.map(h => h.capacity?.[prop]);
                const isDifferent = new Set(values.map(v => String(v))).size > 1;

                return (
                  <tr key={metric} className={isDifferent ? "bg-teal-50/30" : ""}>
                    <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                      {metric}
                    </td>
                    {hospitals.map(h => {
                      const val = h.capacity?.[prop];
                      return (
                        <td key={h.id} className="px-6 py-4 border-b border-border text-sm">
                          {val !== undefined && val !== null ? (
                            <span className="font-medium text-foreground">{val}</span>
                          ) : (
                            <span className="text-muted-foreground italic flex items-center gap-1"><Info className="w-3.5 h-3.5"/> Not provided</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}

              {/* Facilities */}
              <tr className="bg-surface/50 border-y border-border">
                <td colSpan={hospitals.length + 1} className="px-6 py-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground">Key Facilities</span>
                </td>
              </tr>
              {allFacilities.map(facility => {
                const values = hospitals.map(h => h.facilities?.includes(facility));
                const isDifferent = new Set(values).size > 1;

                return (
                  <tr key={facility} className={isDifferent ? "bg-amber-50/20" : ""}>
                    <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                      {facility}
                    </td>
                    {hospitals.map(h => {
                      const has = h.facilities?.includes(facility);
                      return (
                        <td key={h.id} className="px-6 py-4 border-b border-border">
                          {has ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary" />
                              </div>
                              Available
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
                                <Minus className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="italic">Not listed</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>
    </AppPageContainer>
  );
}
