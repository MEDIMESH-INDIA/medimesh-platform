import { Link } from 'react-router-dom';
import { Heart, Search, Loader2 } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import PageTransition from '../../components/layout/PageTransition';

export default function Saved() {
  
  const { savedSlugs, loading, error, toggleSave } = useSavedHospitals();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading saved hospitals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading saved hospitals</h3>
        <p className="text-muted-foreground mb-6">Please try refreshing the page.</p>
      </div>
    );
  }

  const savedHospitalsList = Array.from(savedSlugs)
    .map(slug => demoHospitals.find(h => h.slug === slug))
    .filter(Boolean);

  if (savedHospitalsList.length === 0) {
    return (
      <div className="text-center py-20 px-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-foreground mb-4">You haven&apos;t saved any hospitals yet.</h3>
        <p className="text-muted-foreground mb-8 text-lg">Save hospitals to easily find them later and compare them.</p>
        <Link to="/app/discover" className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
          <Search className="w-5 h-5" /> Discover hospitals
        </Link>
      </div>
    );
  }

  return (
    <PageTransition className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Saved Hospitals</h1>
        <p className="text-muted-foreground mt-2">You have {savedHospitalsList.length} saved hospital{savedHospitalsList.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-6">
        {savedHospitalsList.map(hospital => (
          <HospitalCard 
            key={hospital.id} 
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
        ))}
      </div>
    </PageTransition>
  );
}
