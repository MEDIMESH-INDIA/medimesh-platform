import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompareTray() {
  const [compareList, setCompareList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateList = () => {
      const list = JSON.parse(localStorage.getItem('compareList') || '[]');
      setCompareList(list);
    };
    updateList();
    window.addEventListener('compare-updated', updateList);
    return () => window.removeEventListener('compare-updated', updateList);
  }, []);

  const removeHospital = (slug) => {
    const list = compareList.filter(s => s !== slug);
    localStorage.setItem('compareList', JSON.stringify(list));
    setCompareList(list);
    window.dispatchEvent(new Event('compare-updated'));
  };

  if (compareList.length === 0 || location.pathname === '/app/compare') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 md:bottom-4 left-0 right-0 md:pl-64 z-50 p-4 pointer-events-none flex justify-center"
      >
        <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-border rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center justify-between w-full md:w-auto md:shrink-0 pr-4 md:border-r border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-primary" />
              Compare
            </h3>
            <span className="text-sm font-medium text-muted-foreground bg-surface px-2 py-0.5 rounded-full">
              {compareList.length} / 3
            </span>
          </div>
          
          <div className="flex-1 flex items-center gap-3 w-full overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <AnimatePresence>
              {compareList.map(slug => {
                const hospital = demoHospitals.find(h => h.slug === slug);
                return (
                  <motion.div 
                    key={slug}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0, width: 0, marginRight: 0 }}
                    className="flex items-center gap-2 bg-surface border border-border px-3 py-2 rounded-xl shrink-0"
                  >
                    <span className="text-sm font-medium truncate max-w-[140px]">
                      {hospital?.name || slug}
                    </span>
                    <button 
                      onClick={() => removeHospital(slug)}
                      className="text-muted-foreground hover:text-foreground bg-white/50 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {compareList.length < 3 && (
              <div className="text-sm text-muted-foreground/60 border border-dashed border-border/60 px-3 py-2 rounded-xl shrink-0 hidden md:block">
                Add up to {3 - compareList.length} more
              </div>
            )}
          </div>

          <div className="w-full md:w-auto shrink-0 flex items-center gap-2 justify-end">
            <button 
              onClick={() => {
                localStorage.removeItem('compareList');
                setCompareList([]);
                window.dispatchEvent(new Event('compare-updated'));
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
            <button 
              onClick={() => navigate('/app/compare')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                compareList.length >= 2 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5'
                  : 'bg-foreground text-background hover:bg-foreground/90'
              }`}
            >
              Compare now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
