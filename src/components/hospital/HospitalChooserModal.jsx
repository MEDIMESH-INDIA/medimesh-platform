import { useEffect, useRef, useState } from 'react';
import { Check, MapPin, Search, X } from 'lucide-react';
import FrostedPanel from '../common/FrostedPanel';
import { useCompare } from '../../hooks/useCompare';
import { useHospitalSearch } from '../../hooks/useHospitalSearch';
import { formatHospitalType } from '../../lib/utils/formatters';

export default function HospitalChooserModal({ isOpen, onClose, replaceSlug = null, mode = 'canonical' }) {
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const { isCompared, addHospital, replaceHospital, canAdd } = useCompare();
  const { hospitals, loading, error } = useHospitalSearch({ mode, filters: { q: query }, pageSize: 50 });

  useEffect(() => {
    if (!isOpen) return undefined;
    searchRef.current?.focus();
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const choose = hospital => {
    const changed = replaceSlug ? replaceHospital(replaceSlug, hospital) : addHospital(hospital);
    if (changed) {
      setQuery('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="hospital-chooser-title">
      <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} aria-label="Close hospital chooser" />
      <FrostedPanel variant="floating" className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[26px]">
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface/40 p-5 sm:p-6">
          <div><h2 id="hospital-chooser-title" className="font-serif text-xl font-semibold text-foreground">{replaceSlug ? 'Replace hospital' : 'Add hospital to comparison'}</h2><p className="mt-1 text-sm text-muted-foreground">Choose from hospitals in the published MEDIMESH catalog.</p></div>
          <button type="button" onClick={onClose} className="rounded-xl border border-border bg-white p-2 text-muted-foreground hover:bg-surface" aria-label="Close"><X className="h-5 w-5" /></button>
        </header>
        <div className="border-b border-border bg-white p-4">
          <div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search hospital, city, or locality" className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" /></div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading hospitals…</p> : error ? <p className="p-8 text-center text-sm text-red-700">We couldn’t load the hospital catalog.</p> : hospitals.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No hospitals match this search.</p> : (
            <ul className="space-y-1">
              {hospitals.map(hospital => {
                const selected = isCompared(hospital.slug);
                const unavailable = selected || (!replaceSlug && !canAdd);
                const location = [hospital.location.locality, hospital.location.city].filter(Boolean).join(', ') || 'Location not provided';
                return <li key={hospital.id}><button type="button" disabled={unavailable} onClick={() => choose(hospital)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-transparent p-4 text-left transition hover:border-border hover:bg-surface disabled:cursor-not-allowed disabled:opacity-55"><span className="min-w-0"><strong className="block truncate text-sm text-foreground">{hospital.name}</strong><span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span><span>{formatHospitalType(hospital.type)}</span></span></span><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${selected ? 'bg-primary/10 text-primary' : 'border border-border bg-white text-muted-foreground'}`}>{selected ? <Check className="h-4 w-4" /> : '+'}</span></button></li>;
              })}
            </ul>
          )}
        </div>
      </FrostedPanel>
    </div>
  );
}
