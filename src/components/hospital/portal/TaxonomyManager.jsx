import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Search, Trash2 } from 'lucide-react';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import FrostedPanel from '../../common/FrostedPanel';
import Toast from '../../common/Toast';
import { addHospitalRelationship, canManageHospital, getTaxonomy, removeHospitalRelationship } from '../../../lib/data/hospitalPortalRepository';

export default function TaxonomyManager({ kind, workspace, onChanged, title, description, emptyText }) {
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);
  const selected = useMemo(() => workspace[kind] || [], [kind, workspace]);
  const canEdit = canManageHospital(workspace);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getTaxonomy(kind)
      .then(items => { if (active) setCatalog(items); })
      .catch(error => {
        console.error(`Could not load ${kind} taxonomy:`, error);
        if (active) setToast({ tone: 'error', message: `The ${kind} catalog could not be loaded.` });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind]);

  const selectedIds = useMemo(() => new Set(selected.map(item => item.id)), [selected]);
  const available = useMemo(() => catalog.filter(item => {
    const term = query.trim().toLowerCase();
    return !selectedIds.has(item.id) && (!term || item.name.toLowerCase().includes(term));
  }), [catalog, query, selectedIds]);

  const add = async item => {
    setSavingId(item.id);
    try {
      await addHospitalRelationship(kind, workspace.hospital.id, item.id);
      await onChanged();
      setToast({ tone: 'success', message: `${item.name} added.` });
    } catch (error) {
      console.error(`Could not add hospital ${kind}:`, error);
      setToast({ tone: 'error', message: `Could not add ${item.name}. Please try again.` });
    } finally {
      setSavingId(null);
    }
  };

  const remove = async item => {
    if (item.sourceBacked) return;
    setSavingId(item.id);
    try {
      const removed = await removeHospitalRelationship(kind, workspace.hospital.id, item.id);
      if (!removed) throw new Error('Row was not removable.');
      await onChanged();
      setToast({ tone: 'success', message: `${item.name} removed.` });
    } catch (error) {
      console.error(`Could not remove hospital ${kind}:`, error);
      setToast({ tone: 'error', message: `Could not remove ${item.name}. Source-backed records cannot be removed here.` });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <FrostedPanel className="p-5 sm:p-6">
          <div className="border-b border-border/70 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Current profile</p>
            <h2 className="mt-1 font-serif text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {selected.length ? (
            <ul className="mt-4 grid gap-2">
              {selected.map(item => (
                <li key={item.id} className="flex min-h-14 items-center gap-3 rounded-xl border border-border/70 bg-white/60 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/7 text-primary"><Check className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sourceBacked ? 'Source-backed record' : 'Provider supplied'}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!canEdit || item.sourceBacked || savingId === item.id}
                    onClick={() => void remove(item)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={item.sourceBacked ? `${item.name} is source-backed and cannot be removed` : `Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={emptyText} description="Choose an item from the canonical MEDIMESH taxonomy when you are ready." className="mt-4 py-8" />
          )}
        </FrostedPanel>

        <FrostedPanel className="p-5 sm:p-6">
          <h2 className="font-serif text-xl font-semibold">Add from taxonomy</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Only normalized MEDIMESH terms can be added.</p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="medimesh-field pl-10" value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${kind}…`} aria-label={`Search ${kind} taxonomy`} />
          </div>
          <div className="custom-scrollbar mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading taxonomy…</p> : null}
            {!loading && available.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No available matches.</p> : null}
            {available.map(item => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/45 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  {item.description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p>}
                </div>
                <Button size="sm" variant="secondary" disabled={!canEdit || savingId === item.id} onClick={() => void add(item)} className="gap-1.5 px-3"><Plus className="h-4 w-4" /> Add</Button>
              </div>
            ))}
          </div>
        </FrostedPanel>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </>
  );
}
