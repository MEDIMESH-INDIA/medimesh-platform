import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, Database, GitCompare, HelpCircle, MapPin, Pencil, Plus, Search, ShieldCheck, SlidersHorizontal, Trash2, X } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import HospitalChooserModal from '../../components/hospital/HospitalChooserModal';
import { useCompare } from '../../hooks/useCompare';
import { useCompareHospitals } from '../../hooks/useCompareHospitals';
import { useHospitalFacets } from '../../hooks/useHospitalFacets';
import { useHospitalSearch } from '../../hooks/useHospitalSearch';
import { formatHospitalType, formatReviewStatus } from '../../lib/utils/formatters';

const EMPTY = { q: '', location: '', specialty: '', facility: '' };
const WAITING = { ...EMPTY, q: '__waiting_for_compare_search__' };
const NEEDS = [
  [['cardiac', 'cardiology', 'heart'], 'Cardiology'],
  [['kidney', 'nephric', 'nephrology', 'renal', 'dialysis'], 'Nephrology'],
  [['liver', 'hepatic', 'hepatology'], 'Gastroenterology'],
  [['brain', 'neurology', 'neuro'], 'Neurology'],
  [['bone', 'joint', 'orthopedic', 'orthopaedic'], 'Orthopedics'],
  [['child', 'pediatric', 'paediatric'], 'Pediatrics'],
  [['maternity', 'pregnancy', 'gynecology', 'gynaecology'], 'Gynecology'],
  [['cancer', 'oncology'], 'Oncology'],
  [['eye', 'vision', 'ophthalmology'], 'Ophthalmology'],
];

const place = hospital => [hospital.location.locality, hospital.location.city, hospital.location.state].filter(Boolean).join(', ') || 'Unknown';
const known = value => value === null || value === undefined || value === '' ? 'Unknown' : value;
const available = value => value === true ? 'Available' : value === false ? 'Unavailable' : 'Unknown';
const date = value => {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
function inferNeed(query, specialties) {
  const input = String(query || '').trim().toLowerCase();
  if (!input) return null;
  const exact = specialties.find(item => item.toLowerCase() === input);
  if (exact) return { specialty: exact, term: query };
  for (const [words, specialty] of NEEDS) {
    const term = words.find(word => input.includes(word));
    if (term) return { specialty, term };
  }
  return null;
}
function Value({ children }) {
  const value = String(children);
  if (value === 'Available' || value === 'Matches area') return <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"><Check className="h-3.5 w-3.5" />{value}</span>;
  if (value === 'Unavailable' || value === 'Outside area') return <span className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-bold text-[#A85047]">{value}</span>;
  if (value === 'Unknown' || value === 'Not listed') return <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground"><HelpCircle className="h-3.5 w-3.5 text-amber" />{value}</span>;
  return value;
}

export default function Compare() {
  const route = useLocation();
  const basePath = route.pathname.startsWith('/app') ? '/app' : '';
  const [params, setParams] = useSearchParams();
  const mode = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'canonical' : 'demo';
  const { compareList, addHospital, removeHospital, clearComparison, isCompared, canAdd } = useCompare();
  const { hospitals, loading, error } = useCompareHospitals(compareList, { mode });
  const { facets, loading: facetsLoading } = useHospitalFacets({ mode });
  const [draft, setDraft] = useState(EMPTY);
  const [search, setSearch] = useState(null);
  const [chooser, setChooser] = useState({ open: false, replaceSlug: null });
  const [differences, setDifferences] = useState(false);
  const [focused, setFocused] = useState(false);
  const inferred = useMemo(() => inferNeed(search?.q, facets.specialties), [search?.q, facets.specialties]);
  const filters = useMemo(() => search ? { ...search, q: inferred ? '' : search.q, specialty: search.specialty || inferred?.specialty || '' } : WAITING, [inferred, search]);
  const discovery = useHospitalSearch({ mode, filters, pageSize: 9 });
  const selectedNeed = filters.specialty;

  useEffect(() => {
    const slug = params.get('add');
    if (!slug || !canAdd) return;
    addHospital(slug);
    const next = new URLSearchParams(params);
    next.delete('add');
    setParams(next, { replace: true });
  }, [addHospital, canAdd, params, setParams]);

  const rows = useMemo(() => {
    const list = [];
    if (selectedNeed) list.push({ group: 'Your priorities', label: `${selectedNeed} listed`, priority: true, get: h => h.specialties.some(item => item.toLowerCase() === selectedNeed.toLowerCase()) ? 'Available' : 'Unknown' });
    if (search?.location) list.push({ group: 'Your priorities', label: `In ${search.location}`, priority: true, get: h => [h.location.locality, h.location.city].some(item => item?.toLowerCase() === search.location.toLowerCase()) ? 'Matches area' : 'Outside area' });
    list.push(
      { group: 'Overview', label: 'Location', priority: true, get: place },
      { group: 'Overview', label: 'Hospital type', priority: true, get: h => formatHospitalType(h.type) },
      { group: 'Care & services', label: 'Specialties', priority: Boolean(selectedNeed), get: h => h.specialties.length ? h.specialties.join(', ') : 'Not listed' },
      { group: 'Care & services', label: 'Facilities', get: h => h.facilities.length ? h.facilities.join(', ') : 'Not listed' },
      { group: 'Care & services', label: 'Emergency department', priority: true, get: h => available(h.metrics.emergency) },
      { group: 'Care & services', label: 'Ambulance', get: h => available(h.metrics.ambulance) },
      { group: 'Capacity', label: 'Total beds', get: h => known(h.metrics.totalBeds) },
      { group: 'Capacity', label: 'ICU beds', priority: true, get: h => known(h.metrics.icuBeds) },
      { group: 'Trust & freshness', label: 'Source', priority: true, get: h => known(h.provenance?.sourceName) },
      { group: 'Trust & freshness', label: 'Review status', priority: true, get: h => formatReviewStatus(h.provenance?.reviewStatus) },
      { group: 'Trust & freshness', label: 'Last checked', priority: true, get: h => date(h.provenance?.checkedAt) },
    );
    return list.map(row => {
      const values = hospitals.map(row.get);
      return { ...row, values, differs: new Set(values.map(String)).size > 1 };
    });
  }, [hospitals, search?.location, selectedNeed]);
  const visible = rows.filter(row => (!differences || row.differs) && (!focused || row.priority || row.group === 'Trust & freshness'));
  const groups = visible.reduce((result, row) => ({ ...result, [row.group]: [...(result[row.group] || []), row] }), {});
  const runSearch = event => { event.preventDefault(); setSearch({ ...draft, q: draft.q.trim() }); };
  const quickSearch = specialty => { const next = { ...draft, q: specialty, specialty }; setDraft(next); setSearch(next); };

  return <AppPageContainer className="">
    <header className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Guided hospital comparison</p>{mode === 'demo' && <span className="rounded-full bg-lavender/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#675890]">Demonstration catalog</span>}</div><h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Find the right options to compare</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Search by hospital name or healthcare need, choose an area, then compare up to three hospitals using known, source-linked information. MEDIMESH does not diagnose, rank providers, or declare a winner.</p></div>
      {compareList.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={clearComparison} className="w-fit gap-2"><Trash2 className="h-4 w-4" /> Clear comparison</Button>}
    </header>

    <FrostedPanel variant="elevated" className="mb-7 overflow-hidden rounded-[20px]">
      <div className="border-b border-border bg-gradient-to-r from-primary/[0.06] via-white/40 to-lavender/[0.1] p-5 sm:p-7">
        <div className="mb-5 flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white"><Search className="h-5 w-5" /></div><div><h2 className="font-serif text-xl font-semibold">What kind of hospital are you looking for?</h2><p className="mt-1 text-sm text-muted-foreground">Try “cardiac care”, “kidney hospital”, a hospital name, or a locality.</p></div></div>
        <form onSubmit={runSearch} className="grid gap-3 lg:grid-cols-[1.5fr_.75fr_.75fr_auto]">
          <label className="relative"><span className="sr-only">Hospital name or healthcare need</span><Search className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" /><input type="search" value={draft.q} onChange={e => setDraft(value => ({ ...value, q: e.target.value }))} placeholder="Hospital name or healthcare need" className="h-12 w-full rounded-xl border border-border bg-white/90 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
          <label className="relative"><span className="sr-only">Location</span><MapPin className="absolute left-3.5 top-4 h-4 w-4 text-muted-foreground" /><select disabled={facetsLoading} value={draft.location} onChange={e => setDraft(value => ({ ...value, location: e.target.value }))} className="h-12 w-full appearance-none rounded-xl border border-border bg-white/90 pl-10 pr-6 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"><option value="">Any location</option>{facets.locations.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="relative"><span className="sr-only">Specialty</span><SlidersHorizontal className="absolute left-3.5 top-4 h-4 w-4 text-muted-foreground" /><select disabled={facetsLoading} value={draft.specialty} onChange={e => setDraft(value => ({ ...value, specialty: e.target.value }))} className="h-12 w-full appearance-none rounded-xl border border-border bg-white/90 pl-10 pr-6 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"><option value="">Any specialty</option>{facets.specialties.map(item => <option key={item}>{item}</option>)}</select></label>
          <Button type="submit" className="h-12 gap-2 px-6 text-sm">Find hospitals</Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-muted-foreground">Popular needs:</span>{(facets.specialties.length ? facets.specialties.slice(0, 5) : ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics']).map(item => <button key={item} type="button" onClick={() => quickSearch(item)} className="rounded-full border border-border bg-white/75 px-3 py-1.5 text-xs font-semibold transition hover:border-primary/30 hover:text-primary">{item}</button>)}</div>
      </div>
      {search && <div className="p-5 sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Matching hospitals</p><h3 className="mt-1 text-lg font-semibold">{discovery.loading ? 'Searching the catalog…' : `${discovery.totalCount ?? discovery.hospitals.length} options found`}</h3>{inferred && !search.specialty && <p className="mt-1 text-xs text-muted-foreground">“{inferred.term}” was interpreted as <strong className="text-foreground">{inferred.specialty}</strong>. This organizes results; it is not medical advice.</p>}</div><button type="button" onClick={() => { setSearch(null); setDraft(EMPTY); }} className="text-xs font-semibold text-muted-foreground hover:text-primary">Clear</button></div>
        {discovery.error ? <Notice title="Catalog unavailable">Check the local data connection and try again.</Notice> : discovery.loading ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[1,2,3].map(item => <div key={item} className="h-36 animate-pulse rounded-2xl bg-surface-elevated" />)}</div> : discovery.hospitals.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-surface-elevated/50 p-8 text-center"><h4 className="font-semibold">No hospitals match every selected detail</h4><p className="mt-2 text-sm text-muted-foreground">Try another area, remove a filter, or search by hospital name.</p></div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{discovery.hospitals.map(hospital => { const selected = isCompared(hospital.slug); return <article key={hospital.id} className={`rounded-2xl border p-4 transition ${selected ? 'border-primary/30 bg-primary/[.045]' : 'border-border bg-white hover:-translate-y-0.5 hover:shadow-card'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="font-serif text-lg leading-snug font-semibold">{hospital.name}</h4><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{place(hospital)}</p></div><span className="rounded-full bg-surface-elevated px-2 py-1 text-[10px] font-bold text-muted-foreground">{formatHospitalType(hospital.type)}</span></div><div className="mt-3 flex min-h-6 flex-wrap gap-1">{hospital.specialties.slice(0,3).map(item => <span key={item} className={`rounded-full px-2 py-1 text-[10px] font-bold ${item === selectedNeed ? 'bg-primary/10 text-primary' : 'bg-blue-light/15 text-blue-muted'}`}>{item}</span>)}{!hospital.specialties.length && <span className="text-xs text-muted-foreground">Specialties not listed</span>}</div><button type="button" disabled={selected || !canAdd} onClick={() => addHospital(hospital)} className={`mt-4 h-10 w-full rounded-xl text-xs font-bold ${selected ? 'bg-primary/10 text-primary' : canAdd ? 'border border-primary/20 text-primary hover:bg-primary hover:text-white' : 'bg-surface-elevated text-muted-foreground'}`}>{selected ? '✓ Selected' : canAdd ? '+ Add to compare' : 'Comparison is full'}</button></article>; })}</div>}
      </div>}
    </FrostedPanel>

    <section className="mb-7"><div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-primary">Your shortlist</p><h2 className="mt-1 font-serif text-2xl font-semibold">Selected hospitals <span className="font-sans text-sm text-muted-foreground">{compareList.length}/3</span></h2></div>{canAdd && <Button type="button" variant="outline" size="sm" onClick={() => setChooser({ open: true, replaceSlug: null })}><Plus className="mr-2 h-4 w-4" /> Add hospital</Button>}</div>
      {!compareList.length ? <FrostedPanel className="rounded-[20px] p-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-lavender/15 text-[#675890]"><GitCompare className="h-6 w-6" /></div><h3 className="mt-4 font-semibold">Select at least two hospitals</h3><p className="mt-2 text-sm text-muted-foreground">Search above or browse the catalog. Your selection stays in this browser; sign-in is not required.</p><Button type="button" variant="outline" size="sm" onClick={() => setChooser({ open: true, replaceSlug: null })} className="mt-5">Browse hospitals</Button></FrostedPanel> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{hospitals.map((hospital,index) => <FrostedPanel key={hospital.id} className="rounded-2xl p-4"><div className="flex justify-between gap-3"><div><span className="text-[10px] font-bold uppercase text-primary">Option {index+1}</span><h3 className="mt-1 font-semibold">{hospital.name}</h3><p className="mt-1 text-xs text-muted-foreground">{place(hospital)}</p></div><button onClick={() => removeHospital(hospital.slug)} aria-label={`Remove ${hospital.name}`}><X className="h-4 w-4 text-muted-foreground" /></button></div><button onClick={() => setChooser({ open:true, replaceSlug:hospital.slug })} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"><Pencil className="h-3 w-3" /> Replace</button></FrostedPanel>)}</div>}
    </section>

    {loading && compareList.length > 0 && <div className="h-96 animate-pulse rounded-[20px] bg-surface-elevated" />}
    {error && <Notice title="We couldn’t load this comparison">The hospital catalog could not be reached.</Notice>}
    {!loading && !error && hospitals.length > 0 && <section><div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-primary">Side-by-side evaluation</p><h2 className="mt-1 font-serif text-3xl font-semibold">Compare known differences</h2><p className="mt-2 text-sm text-muted-foreground">Unknown means MEDIMESH has not verified the detail—it does not mean unavailable.</p></div><div className="flex gap-2"><Toggle active={focused} onClick={() => setFocused(!focused)}>Focus on my needs</Toggle><Toggle active={differences} onClick={() => setDifferences(!differences)}>Show differences only</Toggle></div></div>
      <div className="max-h-[72vh] overflow-auto custom-scrollbar rounded-[20px] border border-border/70"><FrostedPanel variant="elevated" className="min-w-[760px] rounded-[20px]"><table className="w-full border-collapse text-left"><thead><tr><th className="sticky left-0 top-0 z-20 w-48 border-b border-r border-border bg-[#F8F7F2] p-5 text-xs uppercase text-muted-foreground">Comparison</th>{hospitals.map(h => <th key={h.id} className="sticky top-0 z-10 min-w-[260px] border-b border-border bg-white p-5 align-top"><Link to={`${basePath}/hospitals/${h.slug}`} className="font-serif text-lg font-semibold hover:text-primary">{h.name}</Link><p className="mt-2 text-xs text-muted-foreground">{place(h)}</p></th>)}</tr></thead><tbody>{Object.entries(groups).map(([group,items]) => <Group key={group} name={group} rows={items} hospitals={hospitals} />)}{!visible.length && <tr><td colSpan={hospitals.length+1} className="p-10 text-center text-sm text-muted-foreground">No differing rows are available.</td></tr>}</tbody></table></FrostedPanel></div>
      <div className="grid gap-3 sm:grid-cols-2"><Info icon={ShieldCheck} title="Transparent by design">Sources and freshness stay visible—there is no hidden score.</Info><Info icon={Database} title="Missing stays unknown">Unlisted information is never converted into a false “No”.</Info></div>
    </section>}
    <HospitalChooserModal isOpen={chooser.open} onClose={() => setChooser({open:false,replaceSlug:null})} replaceSlug={chooser.replaceSlug} mode={mode} />
  </AppPageContainer>;
}

function Toggle({ active, onClick, children }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-xl border px-3 py-2 text-xs font-bold ${active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-white/70 text-muted-foreground'}`}>{children}</button>; }
function Notice({ title, children }) { return <div className="rounded-2xl border border-coral/25 bg-coral/[.06] p-4 text-sm text-[#8E463F]"><div className="flex gap-2"><AlertCircle className="h-5 w-5" /><div><strong>{title}</strong><p className="mt-1">{children}</p></div></div></div>; }
function Info({ icon: Icon, title, children }) { return <div className="flex gap-3 rounded-2xl border border-border bg-white/55 p-4"><Icon className="h-5 w-5 shrink-0 text-primary" /><p className="text-xs leading-5 text-muted-foreground"><strong className="text-foreground">{title}. </strong>{children}</p></div>; }
function Group({ name, rows, hospitals }) { return <><tr className="bg-surface-elevated/65"><th colSpan={hospitals.length+1} className="border-t border-border px-5 py-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">{name}</th></tr>{rows.map(row => <tr key={`${name}-${row.label}`}><th className="sticky left-0 z-10 border-r border-t border-border bg-[#F8F7F2] p-4 text-sm font-semibold">{row.label}{row.differs && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-lavender" />}</th>{row.values.map((value,index) => <td key={hospitals[index].id} className={`border-t border-border p-4 text-sm leading-6 ${row.differs ? 'bg-primary/[.025]' : 'bg-white'}`}><Value>{value}</Value></td>)}</tr>)}</>; }
