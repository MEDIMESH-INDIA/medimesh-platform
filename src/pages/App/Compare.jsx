import { useSearchParams, Link } from 'react-router-dom';
import { X, Check, Minus, HelpCircle, Plus } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
   
  
  const addSlugs = searchParams.getAll('add');
  const storedSlugs = JSON.parse(localStorage.getItem('compareList') || '[]');
  
  // For demo, just use addSlugs if present, then storedSlugs, otherwise default to first two
  const hospitalsToCompareSlugs = addSlugs.length > 0 ? addSlugs : storedSlugs.length > 0 ? storedSlugs : ['medi-demo-general', 'illustrative-care-center'];
  
  const hospitals = hospitalsToCompareSlugs
    .map(slug => demoHospitals.find(h => h.slug === slug))
    .filter(Boolean)
    .slice(0, 3); // Max 3

  const removeHospital = (slug) => {
    const newSlugs = hospitalsToCompareSlugs.filter(s => s !== slug);
    localStorage.setItem('compareList', JSON.stringify(newSlugs));
    window.dispatchEvent(new Event('compare-updated'));
    setSearchParams(newSlugs.map(s => ['add', s]));
  };

  if (hospitals.length === 0) {
    return (
      <div className="text-center py-20 px-4 max-w-2xl mx-auto">
        <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Compare Hospitals</h3>
        <p className="text-muted-foreground mb-8">Select up to 3 hospitals to compare their facilities, capacity, and data sources side-by-side.</p>
        <Link to="/app/discover" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add hospitals to compare
        </Link>
      </div>
    );
  }

  const renderValue = (val) => {
    if (val === true || val === 'Yes' || val === 'Available' || val === '24/7') {
      return <span className="inline-flex items-center gap-1 text-green-700 font-medium"><Check className="w-4 h-4" /> {val === true ? 'Yes' : val}</span>;
    }
    if (val === false || val === 'No') {
      return <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="w-4 h-4" /> {val === false ? 'No' : val}</span>;
    }
    if (val === null || val === undefined || val === 'Not provided') {
      return <span className="inline-flex items-center gap-1 text-muted-foreground"><HelpCircle className="w-4 h-4" /> Not provided</span>;
    }
    if (Array.isArray(val)) {
      return val.length > 0 ? val.join(', ') : <span className="text-muted-foreground">None</span>;
    }
    return val;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 overflow-x-auto">
      <div className="flex items-center justify-between mb-8 min-w-[600px]">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Compare Hospitals</h1>
          <p className="text-muted-foreground mt-2">Comparing {hospitals.length} of 3 hospitals</p>
        </div>
        {hospitals.length < 3 && (
          <Link to="/app/discover" className="px-4 py-2 bg-surface border border-border text-foreground text-sm font-medium rounded-lg hover:bg-surface/80 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add another
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden min-w-[600px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="w-48 p-6 bg-surface/30 border-b border-border border-r align-bottom">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Features</span>
              </th>
              {hospitals.map(h => (
                <th key={h.id} className="p-6 bg-white border-b border-border border-r last:border-r-0 w-80 relative">
                  <button 
                    onClick={() => removeHospital(h.slug)}
                    className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link to={`/app/hospitals/${h.slug}`} className="block mt-4">
                    <h3 className="text-lg font-bold text-foreground font-serif hover:text-primary transition-colors">{h.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{h.location}</p>
                  </Link>
                </th>
              ))}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => (
                <th key={`empty-${i}`} className="p-6 bg-surface/10 border-b border-border border-r last:border-r-0 w-80">
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <Link to="/app/discover" className="text-sm font-medium text-primary hover:underline">Add hospital</Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Type */}
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground">Type</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm">{renderValue(h.type)}</td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e1-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
            {/* Specialties */}
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground">Specialties</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm leading-relaxed">{renderValue(h.specialties)}</td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e2-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
            {/* Capacity Group */}
            <tr>
              <td colSpan={4} className="bg-surface/50 p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">Capacity & Emergency</td>
            </tr>
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground pl-6">Total Beds</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm">{renderValue(h.capacity?.totalBeds)}</td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e3-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground pl-6">ICU Beds</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm">{renderValue(h.capacity?.icuBeds)}</td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e4-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground pl-6">Emergency</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm">{renderValue(h.capacity?.emergency)}</td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e5-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground pl-6">Ambulance</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm">{renderValue(h.capacity?.ambulance)}</td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e6-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
            {/* Trust Group */}
            <tr>
              <td colSpan={4} className="bg-surface/50 p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">Data Sources</td>
            </tr>
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground pl-6">Source</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm">{renderValue(h.trustMetadata?.source)}</td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e7-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-surface/30 border-r border-border text-sm font-medium text-foreground pl-6">Review State</td>
              {hospitals.map(h => <td key={h.id} className="p-4 border-r border-border last:border-r-0 text-sm">
                {h.trustMetadata?.reviewState ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    {h.trustMetadata.reviewState}
                  </span>
                ) : renderValue(null)}
              </td>)}
              {Array.from({ length: 3 - hospitals.length }).map((_, i) => <td key={`e8-${i}`} className="p-4 border-r border-border last:border-r-0 bg-surface/10"></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
