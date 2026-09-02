import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, GitCompare } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';

export default function CompareTray() {
  const [compareList, setCompareList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem('compareList') || '[]');
      setCompareList(stored);
    };
    handleStorageChange();
    window.addEventListener('compare-updated', handleStorageChange);
    return () => window.removeEventListener('compare-updated', handleStorageChange);
  }, []);

  const removeHospital = (slug) => {
    const updated = compareList.filter(s => s !== slug);
    localStorage.setItem('compareList', JSON.stringify(updated));
    window.dispatchEvent(new Event('compare-updated'));
  };

  if (compareList.length === 0 || location.pathname === '/app/compare') {
    return null;
  }

  const hospitals = compareList.map(slug => demoHospitals.find(h => h.slug === slug)).filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto bg-white border border-border shadow-2xl rounded-t-2xl md:rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex items-center gap-4 flex-1 w-full overflow-x-auto">
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Compare:</span>
          {hospitals.map(h => (
            <div key={h.id} className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border shrink-0">
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{h.name}</span>
              <button onClick={() => removeHospital(h.slug)} className="text-muted-foreground hover:text-red-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {hospitals.length < 3 && (
            <div className="text-sm text-muted-foreground italic shrink-0 px-2">
              Add {3 - hospitals.length} more
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
          <button 
            onClick={() => {
              localStorage.setItem('compareList', '[]');
              window.dispatchEvent(new Event('compare-updated'));
            }}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={() => navigate('/app/compare')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            <GitCompare className="w-4 h-4" /> Compare now
          </button>
        </div>
      </div>
    </div>
  );
}
