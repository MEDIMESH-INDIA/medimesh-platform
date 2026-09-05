import { Link } from 'react-router-dom';
import { Search, Bookmark, GitCompare, AlertCircle } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';

export default function Saved() {
  const { savedSlugs, loading, error, toggleSave } = useSavedHospitals();

  const savedHospitalsList = Array.from(savedSlugs)
    .map(slug => demoHospitals.find(h => h.slug === slug))
    .filter(Boolean);

  return (
    <AppPageContainer>
      {/* Header - Always visible */}
      <PageHeader eyebrow="Your shortlist" title="Saved hospitals" description="Keep healthcare options together and compare them when you’re ready." actions={<div className="flex items-center gap-2 rounded-[12px] border border-primary/15 bg-white/65 px-4 py-2 text-sm font-semibold text-primary backdrop-blur-lg"><Bookmark className="h-4 w-4 fill-primary/20" />{loading ? '…' : `${savedHospitalsList.length} saved`}</div>} />

      {/* Loading State */}
      {loading && (
        <LoadingState label="Loading your saved shortlist…" />
      )}

      {/* Error State */}
      {!loading && error && (
        <FrostedPanel className="p-8 rounded-[24px] text-center max-w-xl mx-auto space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Unable to load saved hospitals</h3>
            <p className="text-sm text-red-600/80 mt-1">Please check your connection and refresh the page.</p>
          </div>
        </FrostedPanel>
      )}

      {/* Empty State */}
      {!loading && !error && savedHospitalsList.length === 0 && (
        <EmptyState icon={Bookmark} title="No hospitals saved yet" description="Save hospitals while exploring to quickly access them later and run side-by-side comparisons." action={<Button as={Link} to="/app/discover" className="gap-2"><Search className="h-4 w-4" /> Discover hospitals</Button>} />
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
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <aside className="lg:w-[300px] shrink-0">
            <FrostedPanel className="sticky top-24 p-6 rounded-[22px]">
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
            </FrostedPanel>
          </aside>
        </div>
      )}
    </AppPageContainer>
  );
}
