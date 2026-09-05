import { useNavigate, useLocation } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { useCompare } from '../../hooks/useCompare';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompareTray() {
  const navigate = useNavigate();
  const location = useLocation();
  const { compareList, removeHospital, clearComparison } = useCompare();

  // If in an app route, check for app shell sidebar, etc., but here we can just do a center or bottom fixed.
  // The user says:
  // "Public version: center in viewport/content."
  // "App version: offset for AppShell sidebar."
  
  const isAppRoute = location.pathname.startsWith('/app');

  if (compareList.length === 0 || location.pathname === '/app/compare' || location.pathname === '/compare') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed bottom-4 md:bottom-8 z-40 pointer-events-none flex justify-center px-4 w-full ${isAppRoute ? 'md:pl-[256px]' : ''}`}
      >
        <div className="bg-white/95 backdrop-blur-md shadow-2xl shadow-primary/10 border border-border rounded-2xl p-3 md:p-3 w-full max-w-[860px] pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 transition-all">
          <div className="flex items-center justify-between w-full sm:w-auto sm:shrink-0 sm:pr-4 sm:border-r border-border">
            <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
              <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Compare
            </h3>
            <span className="text-xs font-medium text-muted-foreground bg-surface border border-border/50 px-2 py-0.5 rounded-full ml-2">
              {compareList.length} / 3
            </span>
          </div>
          
          <div className="flex-1 flex items-center gap-2 w-full overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0">
            <AnimatePresence>
              {compareList.map(item => {
                const slug = typeof item === 'string' ? item : item.slug;
                const name = typeof item === 'string' ? slug : item.name;
                return (
                  <motion.div 
                    key={slug}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0, width: 0, marginRight: 0 }}
                    className="flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 rounded-xl shrink-0 transition-colors hover:bg-surface/80"
                  >
                    <span className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-[180px]">
                      {name}
                    </span>
                    <button 
                      onClick={() => removeHospital(slug)}
                      className="text-muted-foreground hover:text-red-600 rounded-full p-0.5 hover:bg-red-50 transition-colors"
                      title="Remove"
                      aria-label={`Remove ${name} from comparison`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {compareList.length < 3 && (
              <div className="text-xs text-muted-foreground/50 border border-dashed border-border/70 px-3 py-1.5 rounded-xl shrink-0 hidden md:block">
                +{3 - compareList.length} more
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
            <button 
              onClick={clearComparison}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Clear
            </button>
            <button 
              onClick={() => navigate(isAppRoute ? '/app/compare' : '/compare')}
              className={`px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                compareList.length >= 2 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                  : 'bg-foreground/5 text-foreground/50 cursor-not-allowed'
              }`}
              disabled={compareList.length < 2}
            >
              Compare →
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
