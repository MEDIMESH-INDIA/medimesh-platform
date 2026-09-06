import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertCircle, GitCompare, Pencil, Plus, Trash2, X } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import FrostedPanel from '../../components/common/FrostedPanel';
import HospitalChooserModal from '../../components/hospital/HospitalChooserModal';
import { useCompare } from '../../hooks/useCompare';
import { useCompareHospitals } from '../../hooks/useCompareHospitals';
import { formatHospitalType, formatReviewStatus } from '../../lib/utils/formatters';

const fallback = value => value === null || value === undefined || value === '' ? 'Not provided' : value;
const availability = value => value === true ? 'Available' : value === false ? 'No' : 'Not provided';
const formatDate = value => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const route = useLocation();
  const basePath = route.pathname.startsWith('/app') ? '/app' : '';
  const { compareList, removeHospital, clearComparison, canAdd, addHospital } = useCompare();
  const { hospitals, loading, error } = useCompareHospitals(compareList);
  const [chooser, setChooser] = useState({ open: false, replaceSlug: null });

  useEffect(() => {
    const slug = searchParams.get('add');
    if (!slug || !canAdd) return;
    addHospital(slug);
    const next = new URLSearchParams(searchParams);
    next.delete('add');
    setSearchParams(next, { replace: true });
  }, [addHospital, canAdd, searchParams, setSearchParams]);

  useEffect(() => {
    if (loading || error) return;
    const availableSlugs = new Set(hospitals.map(hospital => hospital.slug));
    compareList.forEach(item => {
      if (!availableSlugs.has(item.slug)) removeHospital(item.slug);
    });
  }, [compareList, error, hospitals, loading, removeHospital]);

  const rows = useMemo(() => {
    const definitions = [
      { label: 'Location', value: hospital => [hospital.location.locality, hospital.location.city, hospital.location.state].filter(Boolean).join(', ') || 'Not provided', always: true },
      { label: 'Hospital type', value: hospital => formatHospitalType(hospital.type), always: true },
      { label: 'Specialties', value: hospital => hospital.specialties.length ? hospital.specialties.join(', ') : 'Not provided', available: hospital => hospital.specialties.length > 0 },
      { label: 'Facilities', value: hospital => hospital.facilities.length ? hospital.facilities.join(', ') : 'Not provided', available: hospital => hospital.facilities.length > 0 },
      { label: 'Emergency department', value: hospital => availability(hospital.metrics.emergency), available: hospital => hospital.metrics.emergency !== null },
      { label: 'Ambulance', value: hospital => availability(hospital.metrics.ambulance), available: hospital => hospital.metrics.ambulance !== null },
      { label: 'Total beds', value: hospital => fallback(hospital.metrics.totalBeds), available: hospital => hospital.metrics.totalBeds !== null },
      { label: 'ICU beds', value: hospital => fallback(hospital.metrics.icuBeds), available: hospital => hospital.metrics.icuBeds !== null },
      { label: 'Source', value: hospital => fallback(hospital.provenance?.sourceName), always: true },
      { label: 'Review status', value: hospital => formatReviewStatus(hospital.provenance?.reviewStatus), always: true },
      { label: 'Last checked', value: hospital => formatDate(hospital.provenance?.checkedAt), always: true },
    ];
    return definitions.filter(row => row.always || hospitals.some(row.available));
  }, [hospitals]);

  const closeChooser = () => setChooser({ open: false, replaceSlug: null });

  if (loading) return <AppPageContainer><div className="space-y-4" role="status" aria-label="Loading comparison"><div className="h-20 animate-pulse rounded-2xl bg-muted/40" /><div className="h-96 animate-pulse rounded-[28px] bg-muted/35" /></div></AppPageContainer>;
  if (error) return <AppPageContainer><EmptyState icon={AlertCircle} title="We couldn’t load this comparison" description="The hospital catalog could not be reached. Please try again." action={<Button type="button" onClick={() => window.location.reload()}>Try again</Button>} /></AppPageContainer>;

  if (compareList.length === 0) {
    return (
      <AppPageContainer className="flex min-h-[70vh] items-center justify-center">
        <EmptyState icon={GitCompare} eyebrow="Side-by-side view" title="No hospitals selected" description="Add up to three hospitals to compare the structured information available for each one." action={<div className="flex flex-wrap justify-center gap-3"><Button type="button" onClick={() => setChooser({ open: true, replaceSlug: null })}><Plus className="h-4 w-4" /> Add hospital</Button><Button as={Link} to={`${basePath}/discover`} variant="outline">Discover hospitals</Button></div>} />
        <HospitalChooserModal isOpen={chooser.open} onClose={closeChooser} />
      </AppPageContainer>
    );
  }

  return (
    <AppPageContainer className="!max-w-[1320px]">
      <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Structured comparison</p><h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Compare hospitals</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Review known differences side by side. MEDIMESH does not rank providers or declare a winner.</p></div>
        <div className="flex flex-wrap gap-2"><Button type="button" variant="ghost" onClick={clearComparison} className="gap-2 text-sm"><Trash2 className="h-4 w-4" /> Clear all</Button>{canAdd && <Button type="button" variant="outline" onClick={() => setChooser({ open: true, replaceSlug: null })} className="gap-2 text-sm"><Plus className="h-4 w-4" /> Add hospital</Button>}</div>
      </header>

      <div className="w-full overflow-x-auto pb-4 [scrollbar-color:rgba(10,122,106,.35)_transparent] snap-x snap-mandatory">
        <FrostedPanel variant="elevated" className="min-w-[760px] overflow-hidden rounded-[28px]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 w-48 border-b border-r border-border bg-[#F8F7F2] p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Compare</th>
                {hospitals.map(hospital => <th key={hospital.id} className="sticky top-0 z-10 min-w-[260px] snap-start border-b border-border bg-white p-5 align-top"><div className="flex items-start justify-between gap-3"><div><Link to={`${basePath}/hospitals/${hospital.slug}`} className="font-serif text-lg font-semibold leading-tight text-foreground hover:text-primary">{hospital.name}</Link><p className="mt-2 text-xs font-medium text-muted-foreground">{formatHospitalType(hospital.type)}</p></div><button type="button" onClick={() => removeHospital(hospital.slug)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${hospital.name}`}><X className="h-4 w-4" /></button></div><button type="button" onClick={() => setChooser({ open: true, replaceSlug: hospital.slug })} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Pencil className="h-3 w-3" /> Replace</button></th>)}
                {hospitals.length < 3 && <th className="min-w-[240px] border-b border-border bg-surface/20 p-5 align-middle"><button type="button" onClick={() => setChooser({ open: true, replaceSlug: null })} className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-sm font-semibold text-primary hover:border-primary/30 hover:bg-primary/[0.03]"><Plus className="h-5 w-5" /> Add hospital</button></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const values = hospitals.map(row.value);
                const differs = new Set(values.map(String)).size > 1;
                return <tr key={row.label}><th scope="row" className="sticky left-0 z-10 border-r border-t border-border bg-[#F8F7F2] p-5 text-sm font-semibold text-foreground">{row.label}</th>{values.map((value, index) => <td key={hospitals[index].id} className={`border-t border-border p-5 text-sm leading-6 text-foreground ${differs ? 'bg-primary/[0.025]' : 'bg-white'}`}>{value}</td>)}{hospitals.length < 3 && <td className="border-t border-border bg-surface/10" />}</tr>;
              })}
            </tbody>
          </table>
        </FrostedPanel>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground sm:hidden">Swipe horizontally to review each hospital.</p>
      <HospitalChooserModal isOpen={chooser.open} onClose={closeChooser} replaceSlug={chooser.replaceSlug} />
    </AppPageContainer>
  );
}
