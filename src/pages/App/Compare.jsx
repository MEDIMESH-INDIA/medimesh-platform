import { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { Plus, X, Check, Minus, GitCompare, Info, Database } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { useCompare } from '../../hooks/useCompare';
import HospitalChooserModal from '../../components/hospital/HospitalChooserModal';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { compareList, removeHospital, canAdd, addHospital } = useCompare();
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  
  useEffect(() => {
    const addSlug = searchParams.get('add');
    if (addSlug && canAdd) {
      addHospital(addSlug);
      // Remove add parameter from URL quietly
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, canAdd, addHospital]);

  // Handle both string and object compare list items
  const hospitals = compareList.map(item => {
    const slug = typeof item === 'string' ? item : item.slug;
    return demoHospitals.find(h => h.slug === slug);
  }).filter(Boolean);

  const locationPath = useLocation().pathname;
  const basePath = locationPath.startsWith('/app') ? '/app' : '';

  if (hospitals.length === 0) {
    return (
      <AppPageContainer className="flex items-center justify-center min-h-[60vh]">
        <EmptyState icon={GitCompare} eyebrow="Side-by-side view" title="Compare hospitals" description="Evaluate capacity, facilities, and data sources without scores or promoted winners." action={<div className="flex flex-wrap justify-center gap-3"><Button onClick={() => setIsChooserOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add hospital</Button><Button as={Link} to={`${basePath}/discover`} variant="outline">Discover hospitals</Button></div>} />
        <HospitalChooserModal isOpen={isChooserOpen} onClose={() => setIsChooserOpen(false)} />
      </AppPageContainer>
    );
  }

  // All known features for comparison rows
  const allFacilities = [...new Set(hospitals.flatMap(h => h.facilities || []))];

  return (
    <AppPageContainer>
      {/* Header */}
      <PageHeader eyebrow="Side-by-side view" title="Compare hospitals" description="Evaluate differences in facilities, capacity and source information." actions={hospitals.length < 3 ? <Button as={Link} to={`${basePath}/discover`} variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add another</Button> : null} />

      {/* Comparison Table */}
      <div className="w-full overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-white/78 backdrop-blur-xl border border-white/80 rounded-[28px] shadow-[0_18px_50px_rgba(15,40,35,0.07)] overflow-hidden min-w-[720px] md:min-w-[800px] mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="w-56 p-6 border-b border-r border-border bg-surface/30"></th>
                {hospitals.map(h => (
                  <th key={h.id} className="p-6 border-b border-border relative align-top w-[30%] bg-white">
                    <button 
                      onClick={() => removeHospital(h.slug)}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                    <div className="pr-8">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                        {h.trustMetadata?.sourceLabel || 'MEDIMESH Demo'}
                      </div>
                      <h3 className="text-xl font-bold font-serif text-foreground leading-tight mb-2">{h.name}</h3>
                      <p className="text-sm font-medium text-foreground mb-0.5">{h.type}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        {h.location}
                      </p>
                    </div>
                  </th>
                ))}
                {hospitals.length < 3 && (
                  <th className="p-6 border-b border-border relative align-top w-[30%] bg-surface/10">
                    <div className="flex flex-col items-center justify-center h-full min-h-[160px] border-2 border-dashed border-border rounded-xl">
                      <button 
                        onClick={() => setIsChooserOpen(true)}
                        className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-semibold">Add hospital</span>
                      </button>
                    </div>
                  </th>
                )}
                {hospitals.length === 1 && (
                  <th className="p-6 border-b border-border relative align-top w-[30%] bg-surface/5"></th>
                )}
              </tr>
            </thead>
            <tbody>
              
              {/* Data Provenance */}
              <tr className="bg-surface/50 border-y border-border">
                <td colSpan={4} className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold uppercase tracking-wider text-foreground">Data Provenance</span>
                  </div>
                </td>
              </tr>
              <tr className="group">
                <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                  Source
                </td>
                {hospitals.map(h => (
                  <td key={h.id} className="px-6 py-4 border-b border-border text-sm font-medium">
                    {h.trustMetadata?.source || 'Unknown Source'}
                  </td>
                ))}
                {hospitals.length < 3 && <td className="border-b border-border bg-surface/5"></td>}
                {hospitals.length === 1 && <td className="border-b border-border bg-surface/5"></td>}
              </tr>
              <tr className="group">
                <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                  Review State
                </td>
                {hospitals.map(h => {
                  const state = h.trustMetadata?.reviewState || 'Unverified';
                  const isVerified = state.includes('Live') || state.includes('Verified');
                  return (
                    <td key={h.id} className="px-6 py-4 border-b border-border text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        isVerified ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isVerified && <Check className="w-3 h-3" />}
                        {state}
                      </span>
                    </td>
                  )
                })}
                {hospitals.length < 3 && <td className="border-b border-border bg-surface/5"></td>}
                {hospitals.length === 1 && <td className="border-b border-border bg-surface/5"></td>}
              </tr>

              {/* Capacity */}
              <tr className="bg-surface/50 border-y border-border">
                <td colSpan={4} className="px-6 py-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground">Capacity</span>
                </td>
              </tr>
              {['Total Beds', 'ICU Beds', 'Emergency', 'Ambulance'].map(metric => {
                const keyMap = {
                  'Total Beds': 'totalBeds',
                  'ICU Beds': 'icuBeds',
                  'Emergency': 'emergency',
                  'Ambulance': 'ambulance'
                };
                const prop = keyMap[metric];
                
                // Highlight row if different
                const values = hospitals.map(h => h.capacity?.[prop]);
                const isDifferent = new Set(values.map(v => String(v))).size > 1;

                return (
                  <tr key={metric} className={isDifferent ? "bg-teal-50/30" : ""}>
                    <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                      {metric}
                    </td>
                    {hospitals.map(h => {
                      const val = h.capacity?.[prop];
                      return (
                        <td key={h.id} className="px-6 py-4 border-b border-border text-sm">
                          {val !== undefined && val !== null ? (
                            <span className="font-medium text-foreground">{val}</span>
                          ) : (
                            <span className="text-muted-foreground italic flex items-center gap-1"><Info className="w-3.5 h-3.5"/> Not provided</span>
                          )}
                        </td>
                      )
                    })}
                    {hospitals.length < 3 && <td className="border-b border-border bg-surface/5"></td>}
                    {hospitals.length === 1 && <td className="border-b border-border bg-surface/5"></td>}
                  </tr>
                )
              })}

              {/* Facilities */}
              <tr className="bg-surface/50 border-y border-border">
                <td colSpan={4} className="px-6 py-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground">Key Facilities</span>
                </td>
              </tr>
              {allFacilities.map(facility => {
                const values = hospitals.map(h => h.facilities?.includes(facility));
                const isDifferent = new Set(values).size > 1;

                return (
                  <tr key={facility} className={isDifferent ? "bg-amber-50/20" : ""}>
                    <td className="px-6 py-4 border-b border-r border-border text-sm font-medium text-muted-foreground bg-surface/30">
                      {facility}
                    </td>
                    {hospitals.map(h => {
                      const has = h.facilities?.includes(facility);
                      return (
                        <td key={h.id} className="px-6 py-4 border-b border-border">
                          {has ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary" />
                              </div>
                              Available
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
                                <Minus className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="italic">Not listed</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {hospitals.length < 3 && <td className="border-b border-border bg-surface/5"></td>}
                    {hospitals.length === 1 && <td className="border-b border-border bg-surface/5"></td>}
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>
    </AppPageContainer>
  );
}
