import { Link } from 'react-router-dom';
import { Heart, Search, Loader2, Bookmark, GitCompare } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { motion } from 'framer-motion';

export default function Saved() {
  const { savedSlugs, loading, error, toggleSave } = useSavedHospitals();

  if (loading) {
    return (
      <AppPageContainer className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </AppPageContainer>
    );
  }

  if (error) {
    return (
      <AppPageContainer className="flex items-center justify-center min-h-[400px]">
        <div className="text-center px-4 max-w-2xl mx-auto bg-red-50 p-8 rounded-2xl border border-red-200">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading saved hospitals</h3>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </AppPageContainer>
    );
  }

  const savedHospitalsList = Array.from(savedSlugs)
    .map(slug => demoHospitals.find(h => h.slug === slug))
    .filter(Boolean);

  if (savedHospitalsList.length === 0) {
    return (
      <AppPageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4 max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-2 border border-border">
            <Bookmark className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-foreground">No hospitals saved</h3>
            <p className="text-muted-foreground mt-3 text-lg">Save hospitals to easily find them later and compare them.</p>
          </div>
          <Link to="/app/discover" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
            <Search className="w-5 h-5" /> Discover hospitals
          </Link>
        </div>
      </AppPageContainer>
    );
  }

  return (
    <AppPageContainer>
      {/* Header */}
      <header className="mb-10 space-y-4">
        <h2 className="text-xs font-bold text-primary tracking-[0.2em] uppercase">
          Your Shortlist
        </h2>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground leading-tight">Saved hospitals</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
              Keep healthcare options together and compare them when you're ready.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 border border-primary/20 px-5 py-2.5 rounded-xl">
            <Bookmark className="w-4 h-4 fill-primary/20" />
            {savedHospitalsList.length} saved
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="grid md:grid-cols-2 gap-6">
            {savedHospitalsList.map(hospital => (
              <motion.div 
                key={hospital.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
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

        {/* Optional Side Panel */}
        {savedHospitalsList.length > 0 && (
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
                <Link to="/app/compare" className="block w-full py-2.5 text-center text-sm font-semibold bg-white border border-border rounded-xl hover:bg-surface transition-colors">
                  Go to Compare
                </Link>
              </div>
            </div>
          </aside>
        )}
      </div>
    </AppPageContainer>
  );
}
