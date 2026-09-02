import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useCompare } from '../../hooks/useCompare';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompareTray() {
  const navigate = useNavigate();
  const location = useLocation();
  const { compareList, removeHospital, clearComparison } = useCompare();

  if (compareList.length === 0 || location.pathname === '/app/compare') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-3 left-3 right-3 md:bottom-5 md:left-[256px] md:right-0 z-40 pointer-events-none flex justify-center px-4 md:px-8"
      >
        <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-border rounded-2xl p-3 md:p-3.5 w-full max-w-[960px] pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto sm:shrink-0 sm:pr-4 sm:border-r border-border">
            <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
              <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Compare
            </h3>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground bg-surface px-2 py-0.5 rounded-full ml-2">
              {compareList.length} / 3
            </span>
          </div>
          
          <div className="flex-1 flex items-center gap-2 w-full overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0">
            <AnimatePresence>
              {compareList.map(slug => {
                const hospital = demoHospitals.find(h => h.slug === slug);
                return (
                  <motion.div 
                    key={slug}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0, width: 0, marginRight: 0 }}
                    className="flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1.5 rounded-xl shrink-0"
                  >
                    <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[160px]">
                      {hospital?.name || slug}
                    </span>
                    <button 
                      onClick={() => removeHospital(slug)}
                      className="text-muted-foreground hover:text-red-600 rounded-full p-0.5 hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {compareList.length < 3 && (
              <div className="text-xs text-muted-foreground/60 border border-dashed border-border/70 px-2.5 py-1.5 rounded-xl shrink-0 hidden md:block">
                +{3 - compareList.length} more
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
            <button 
              onClick={clearComparison}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={() => navigate('/app/compare')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
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

