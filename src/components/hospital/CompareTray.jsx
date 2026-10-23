import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitCompare, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../../hooks/useCompare';
import { useAuthGate } from '../../hooks/useAuthGate';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompareTray() {
  const navigate = useNavigate();
  const location = useLocation();
  const { compareList, removeHospital, clearComparison } = useCompare();
  const { requireAuth } = useAuthGate();

  const isAppRoute = location.pathname.startsWith('/app');

  useEffect(() => {
    if (compareList.length > 0 && location.pathname !== '/app/compare' && location.pathname !== '/compare') {
      document.body.classList.add('has-compare-tray');
    } else {
      document.body.classList.remove('has-compare-tray');
    }
    return () => { document.body.classList.remove('has-compare-tray'); };
  }, [compareList.length, location.pathname]);

  if (compareList.length === 0 || location.pathname === '/app/compare' || location.pathname === '/compare') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`fixed inset-x-0 bottom-3 md:bottom-5 z-40 pointer-events-none flex justify-center px-3 sm:px-4 w-full ${isAppRoute ? 'md:left-64 md:w-[calc(100%-256px)]' : ''}`}
      >
        <div className="compare-tray bg-surface/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(10,122,106,0.12)] border border-border/90 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 w-full max-w-[760px] pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 transition-all">
          <div className="flex items-center justify-between w-full sm:w-auto sm:shrink-0 sm:pr-3.5 sm:border-r border-border/70">
            <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-primary shrink-0" />
              <span>Compare</span>
            </h3>
            <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full ml-2">
              {compareList.length} / 3
            </span>
          </div>

          <div className="flex-1 flex items-center gap-1.5 w-full overflow-x-auto pb-0.5 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0">
            <AnimatePresence>
              {compareList.map(item => {
                const slug = typeof item === 'string' ? item : item.slug;
                const name = typeof item === 'string' ? slug : item.name;
                return (
                  <motion.div
                    key={slug}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-1.5 bg-surface-elevated/75 border border-border/80 px-2.5 py-1 rounded-xl shrink-0 transition-colors hover:bg-surface-elevated"
                  >
                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px] sm:max-w-[160px]">
                      {name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHospital(slug)}
                      className="text-muted-foreground hover:text-red-600 rounded-full p-0.5 hover:bg-red-50 transition-colors ml-0.5"
                      title="Remove from comparison"
                      aria-label={`Remove ${name} from comparison`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {compareList.length < 3 && (
              <div className="text-[11px] text-muted-foreground/60 border border-dashed border-border/70 px-2.5 py-1 rounded-xl shrink-0 hidden md:block">
                +{3 - compareList.length} more
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-border/50">
            <button
              type="button"
              onClick={clearComparison}
              className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const target = isAppRoute ? '/app/compare' : '/compare';
                requireAuth({
                  title: 'Compare Hospitals',
                  message: 'Sign in or create an account to compare hospitals side-by-side.',
                  returnTo: target,
                  action: () => navigate(target),
                });
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 ${
                compareList.length >= 2
                  ? 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-px'
                  : 'bg-foreground/5 text-foreground/40 cursor-not-allowed'
              }`}
              disabled={compareList.length < 2}
            >
              <span>Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
