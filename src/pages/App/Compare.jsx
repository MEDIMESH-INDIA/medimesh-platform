import { useState, useEffect } from 'react';
import { ArrowLeft, Check, GitCompare, Info, X, Plus, Minus, HelpCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { demoHospitals } from '../../data/sihDemoHospitals';
import PageTransition from '../../components/layout/PageTransition';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [compareList, setCompareList] = useState([]);
  
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
    
    if (list.length === 0) {
      // Default demo state for empty compare
      const defaultList = ['harbourview-medical-centre', 'navicare-multispeciality'];
      localStorage.setItem('compareList', JSON.stringify(defaultList));
      setCompareList(defaultList);
      window.dispatchEvent(new Event('compare-updated'));
    } else {
      setCompareList(list);
    }
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
      <PageTransition className="text-center py-20 px-4 max-w-2xl mx-auto">
        <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Compare Hospitals</h3>
        <p className="text-muted-foreground mb-8">Select up to 3 hospitals to compare their facilities, capacity, and data sources side-by-side.</p>
        <Link to="/app/discover" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add hospitals to compare
        </Link>
      </PageTransition>
    );
  }

  // All known features for comparison rows
  const allFacilities = [...new Set(hospitals.flatMap(h => h.facilities || []))];

  return (
    <PageTransition className="max-w-7xl mx-auto pb-12 overflow-x-auto">
      <div className="mb-6 flex items-center justify-between min-w-[600px]">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Compare</h1>
          <p className="text-muted-foreground mt-1">Comparing {hospitals.length} of 3 hospitals</p>
        </div>
        {hospitals.length < 3 && (
          <Link to="/app/discover" className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors">
            + Add another
          </Link>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden min-w-[800px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="w-48 p-4 border-b border-r border-border bg-surface/50"></th>
              {hospitals.map(h => (
                <th key={h.id} className="p-6 border-b border-border relative align-top w-1/3">
                  <button 
                    onClick={() => removeHospital(h.slug)}
                    className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="pr-8">
                    <h3 className="text-lg font-bold font-serif text-foreground leading-tight mb-2">{h.name}</h3>
                    <p className="text-sm text-muted-foreground">{h.type}</p>
                    <p className="text-sm text-muted-foreground">{h.location}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            
            {/* Overview */}
            <tr className="bg-surface/30">
              <td colSpan={hospitals.length + 1} className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                Data Provenance
              </td>
            </tr>
            <tr>
              <td className="p-4 border-b border-r border-border text-sm font-medium text-foreground bg-surface/50">
                Source
              </td>
              {hospitals.map(h => (
                <td key={h.id} className="p-4 border-b border-border text-sm">
                  {h.trustMetadata?.source || 'Unknown'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b border-r border-border text-sm font-medium text-foreground bg-surface/50">
                Review State
              </td>
              {hospitals.map(h => (
                <td key={h.id} className="p-4 border-b border-border text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    h.trustMetadata?.reviewState?.includes('Live') ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {h.trustMetadata?.reviewState || 'Unverified'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Capacity */}
            <tr className="bg-surface/30">
              <td colSpan={hospitals.length + 1} className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                Capacity
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
              return (
                <tr key={metric}>
                  <td className="p-4 border-b border-r border-border text-sm font-medium text-foreground bg-surface/50">
                    {metric}
                  </td>
                  {hospitals.map(h => (
                    <td key={h.id} className="p-4 border-b border-border text-sm">
                      {h.capacity?.[prop] ?? <span className="text-muted-foreground italic">Not provided</span>}
                    </td>
                  ))}
                </tr>
              )
            })}

            {/* Facilities */}
            <tr className="bg-surface/30">
              <td colSpan={hospitals.length + 1} className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                Key Facilities
              </td>
            </tr>
            {allFacilities.map(facility => (
              <tr key={facility}>
                <td className="p-4 border-b border-r border-border text-sm font-medium text-foreground bg-surface/50">
                  {facility}
                </td>
                {hospitals.map(h => {
                  const has = h.facilities?.includes(facility);
                  return (
                    <td key={h.id} className="p-4 border-b border-border">
                      {has ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <Minus className="w-5 h-5 text-border" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </PageTransition>
  );
}
