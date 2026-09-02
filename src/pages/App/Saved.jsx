import { Link } from 'react-router-dom';
import { Search, Loader2, Bookmark, GitCompare, AlertCircle } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { motion } from 'framer-motion';

export default function Saved() {
  const { savedSlugs, loading, error, toggleSave } = useSavedHospitals();

  const savedHospitalsList = Array.from(savedSlugs)
    .map(slug => demoHospitals.find(h => h.slug === slug))
    .filter(Boolean);

  return (
    <AppPageContainer>
      {/* Header - Always visible */}
      <header className="mb-10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">YOUR SHORTLIST</p>
            <h1 className="text-3xl font-serif font-bold text-foreground">Saved hospitals</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Keep healthcare options together and compare them when you&apos;re ready.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 border border-primary/20 px-5 py-2.5 rounded-xl">
            <Bookmark className="w-4 h-4 fill-primary/20" />
            {loading ? '...' : `${savedHospitalsList.length} saved`}
          </div>
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your saved shortlist...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-red-50/70 border border-red-200 text-center max-w-xl mx-auto space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Unable to load saved hospitals</h3>
            <p className="text-sm text-red-600/80 mt-1">Please check your connection and refresh the page.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && savedHospitalsList.length === 0 && (
        <div className="text-center py-16 px-4 max-w-xl mx-auto space-y-6 bg-white rounded-2xl border border-dashed border-border/80 p-8 shadow-sm">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto border border-border text-muted-foreground/60">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold text-foreground">No hospitals saved yet</h3>
            <p className="text-muted-foreground mt-2">
              Save hospitals while exploring to quickly access them later and run side-by-side comparisons.
            </p>
          </div>
          <Link
            to="/app/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm text-sm"
          >
            <Search className="w-4 h-4" /> Discover hospitals
          </Link>
        </div>
      )}

      {/* Content Grid */}
      {!loading && !error && savedHospitalsList.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="grid md:grid-cols-2 gap-6">
              {savedHospitalsList.map(hospital => (
                <motion.div 
                  key={hospital.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <HospitalCard 
                    hospital={hospital}
                    isSaved={true}
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
                </motion.div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <aside className="lg:w-[300px] shrink-0">
            <div className="sticky top-24 bg-surface/50 border border-border p-6 rounded-2xl">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Your Next Step</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <GitCompare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Compare Options</h4>
                    <p className="text-xs text-muted-foreground mt-1">See capacity and data sources side-by-side.</p>
                  </div>
                </div>
                <Link to="/app/compare" className="block w-full py-2.5 text-center text-sm font-semibold bg-white border border-border rounded-xl hover:bg-surface transition-colors shadow-sm">
                  Go to Compare
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppPageContainer>
  );
}

