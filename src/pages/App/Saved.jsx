import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Bookmark, GitCompare, Search } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import FrostedPanel from '../../components/common/FrostedPanel';
import Toast from '../../components/common/Toast';
import HospitalCard from '../../components/hospital/HospitalCard';
import HospitalCardSkeleton from '../../components/hospital/HospitalCardSkeleton';
import { useHospitalsBySlugs } from '../../hooks/useHospitalsBySlugs';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';

export default function Saved() {
  const { savedSlugs, loading: savedLoading, error: savedError, toggleSave, refreshSaved } = useSavedHospitals();
  const slugs = Array.from(savedSlugs);
  const { hospitals, loading: recordsLoading, error: recordsError } = useHospitalsBySlugs(slugs);
  const [toast, setToast] = useState(null);
  const loading = savedLoading || recordsLoading;
  const error = savedError || recordsError;

  const remove = async hospital => {
    const result = await toggleSave(hospital.slug);
    if (result?.error) setToast({ message: 'We couldn’t remove this hospital. Please try again.', tone: 'error' });
    else setToast({ message: `${hospital.name} removed from saved hospitals.`, tone: 'success' });
  };

  return (
    <AppPageContainer>
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Your shortlist</p><h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Saved hospitals</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Keep healthcare options together and compare them when you’re ready.</p></div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary/15 bg-white/65 px-4 py-2 text-sm font-semibold text-primary backdrop-blur-lg"><Bookmark className="h-4 w-4 fill-primary/15" />{loading ? 'Loading…' : `${hospitals.length} saved`}</div>
      </header>

      {loading && <div className="grid gap-6 md:grid-cols-2" role="status" aria-label="Loading saved hospitals">{Array.from({ length: 4 }).map((_, index) => <HospitalCardSkeleton key={index} />)}</div>}

      {!loading && error && (
        <EmptyState icon={AlertCircle} title="We couldn’t load your saved hospitals" description="Your shortlist is still private. Try loading it again." action={<Button type="button" onClick={() => void refreshSaved()}>Try again</Button>} />
      )}

      {!loading && !error && hospitals.length === 0 && (
        <EmptyState icon={Bookmark} title="No saved hospitals yet" description="Save hospitals while exploring to build a private shortlist for comparison." action={<Button as={Link} to="/app/discover" className="gap-2"><Search className="h-4 w-4" /> Discover hospitals</Button>} />
      )}

      {!loading && !error && hospitals.length > 0 && (
        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="grid min-w-0 flex-1 gap-6 md:grid-cols-2">
            {hospitals.map(hospital => <HospitalCard key={hospital.id} hospital={hospital} isSaved onSave={() => void remove(hospital)} showSaveLabel />)}
          </div>
          <aside className="xl:w-[290px] xl:shrink-0">
            <FrostedPanel className="rounded-[22px] p-6 xl:sticky xl:top-24">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><GitCompare className="h-5 w-5" /></span>
              <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">Compare your shortlist</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Add saved hospitals to the shared comparison and review available facts side by side.</p>
              <Button as={Link} to="/app/compare" variant="outline" className="mt-5 w-full">Open Compare</Button>
            </FrostedPanel>
          </aside>
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </AppPageContainer>
  );
}
