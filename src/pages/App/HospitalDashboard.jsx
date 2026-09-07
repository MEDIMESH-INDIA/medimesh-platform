import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, ShieldCheck, BedDouble, Stethoscope, Plus, Trash2, MapPin, Award, AlertCircle } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';

export default function HospitalDashboard() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Real database states
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [services, setServices] = useState([]);
  const [affiliatedDoctors, setAffiliatedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Service form state
  const [addingService, setAddingService] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Clinical');

  // Capacity update state
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [totalBeds, setTotalBeds] = useState('');
  const [icuBeds, setIcuBeds] = useState('');
  const [emergencyDept, setEmergencyDept] = useState(false);
  const [ambulanceAvail, setAmbulanceAvail] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const loadHospitalData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [detailsRes, servicesRes, docsRes] = await Promise.all([
        supabase.from('hospital_details').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('hospital_services').select('*').eq('hospital_id', user.id),
        supabase.from('doctor_affiliations').select('*').eq('organization_name', profile?.display_name || '').limit(10),
      ]);

      if (detailsRes.data) {
        setHospitalDetails(detailsRes.data);
        setTotalBeds(detailsRes.data.total_beds ?? '');
        setIcuBeds(detailsRes.data.icu_beds ?? '');
        setEmergencyDept(Boolean(detailsRes.data.emergency_department));
        setAmbulanceAvail(Boolean(detailsRes.data.ambulance_available));
      }
      setServices(servicesRes.data || []);
      setAffiliatedDoctors(docsRes.data || []);
    } catch (err) {
      console.error('Failed to load hospital portal data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadHospitalData();
  }, [loadHospitalData]);

  const handleSaveCapacity = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('hospital_details')
        .upsert({
          id: user.id,
          total_beds: totalBeds ? parseInt(totalBeds, 10) : null,
          icu_beds: icuBeds ? parseInt(icuBeds, 10) : null,
          emergency_department: emergencyDept,
          ambulance_available: ambulanceAvail,
          hospital_type: hospitalDetails?.hospital_type || 'general_hospital',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
      setEditingCapacity(false);
      setFeedback({ message: 'Capacity and emergency facts updated.', type: 'success' });
      await loadHospitalData();
    } catch (err) {
      console.error('Error updating capacity:', err);
      setFeedback({ message: 'Could not update capacity. Please verify inputs.', type: 'error' });
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!user?.id || !serviceName.trim()) return;
    try {
      const { error } = await supabase
        .from('hospital_services')
        .insert([{
          hospital_id: user.id,
          service_name: serviceName.trim(),
          service_category: serviceCategory,
          is_available: true,
        }]);

      if (error) throw error;
      setServiceName('');
      setAddingService(false);
      setFeedback({ message: 'Service registered successfully.', type: 'success' });
      await loadHospitalData();
    } catch (err) {
      console.error('Error adding service:', err);
      setFeedback({ message: 'Could not add service record.', type: 'error' });
    }
  };

  const handleDeleteService = async (id) => {
    try {
      const { error } = await supabase.from('hospital_services').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ message: 'Service removed.', type: 'success' });
      await loadHospitalData();
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  // Completeness score
  let completedSteps = 0;
  if (profile?.display_name) completedSteps += 1;
  if (profile?.city) completedSteps += 1;
  if (hospitalDetails?.hospital_type) completedSteps += 1;
  if (hospitalDetails?.total_beds !== null && hospitalDetails?.total_beds !== undefined) completedSteps += 1;
  if (services.length > 0) completedSteps += 1;
  const completenessPercent = Math.round((completedSteps / 5) * 100);

  const isVerified = profile?.verification_status === 'verified';
  const StatusIcon = isVerified ? CheckCircle2 : Clock;

  return (
    <AppPageContainer>
      <div className="space-y-7">
        <PageHeader
          eyebrow="Authorized Healthcare Organization"
          title="Hospital Provider Portal"
          description="Maintain your verified hospital profile, licensed capacities, and registered services."
          actions={
            <div className="flex gap-2">
              <Button as={Link} to="/app/profile" variant="outline">
                Organization Settings
              </Button>
            </div>
          }
        />

        {feedback && (
          <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <span>{feedback.message}</span>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs font-semibold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Portal Navigation Tabs */}
        <div className="flex gap-2 border-b border-border/70 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Organization Overview' },
            { id: 'capacity', label: 'Capacity & Facilities' },
            { id: 'services', label: `Services Catalog (${services.length})` },
            { id: 'doctors', label: `Affiliated Doctors (${affiliatedDoctors.length})` },
            { id: 'verification', label: 'Verification & Audit' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-surface/50 text-muted-foreground hover:bg-surface hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Strip */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Completeness</span>
                <div className="text-2xl font-sans font-bold text-foreground">{completenessPercent}%</div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border/50">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${completenessPercent}%` }} />
                </div>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Licensed Beds</span>
                <div className="text-2xl font-sans font-bold text-foreground">
                  {hospitalDetails?.total_beds ?? 'Not provided'}
                </div>
                <p className="text-[11px] text-muted-foreground">ICU: {hospitalDetails?.icu_beds ?? 'Not provided'}</p>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Services</span>
                <div className="text-2xl font-sans font-bold text-foreground">{services.length}</div>
                <p className="text-[11px] text-muted-foreground">Clinical offerings registered</p>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Registry Status</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <StatusIcon className={`w-4 h-4 ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span className="text-base font-sans font-semibold text-foreground capitalize">
                    {profile?.verification_status || 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Institutional review state</p>
              </FrostedPanel>
            </div>

            {/* Main Organization Info */}
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <FrostedPanel variant="elevated" className="rounded-[20px] p-7 sm:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary font-serif font-bold text-xl border border-primary/20">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Registered Facility</p>
                    <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">
                      {profile?.display_name || 'Hospital Facility'}
                    </h2>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{profile?.city ? `${profile.city}, Navi Mumbai` : 'Location not provided'}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/70 pt-5 space-y-4 text-xs text-muted-foreground">
                  <p className="leading-relaxed">
                    Hospital providers maintain factual clinical facts without fabricated occupancy numbers, patient traffic, or revenue statistics. All capacity numbers represent legally authorized capacities registered with state health authorities.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-surface border border-border/60">
                      <span className="block font-semibold text-foreground mb-0.5">Emergency Department:</span>
                      <span className="font-medium">{hospitalDetails?.emergency_department ? '24/7 Service Active' : 'Not provided'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border/60">
                      <span className="block font-semibold text-foreground mb-0.5">Ambulance Service:</span>
                      <span className="font-medium">{hospitalDetails?.ambulance_available ? 'Available' : 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="rounded-[20px] p-7 sm:p-8 space-y-5">
                <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Institutional Trust</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hospital providers cannot self-verify their data. MEDIMESH conducts periodic audits against government health department registries and public source evidence.
                </p>
                <div className="rounded-xl bg-surface/50 border border-border/60 p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Registration Number:</span>
                    <span className="font-mono text-foreground">{hospitalDetails?.registration_number || 'Under Review'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Accreditation:</span>
                    <span className="font-medium text-foreground">{hospitalDetails?.accreditation || 'State Registry'}</span>
                  </div>
                </div>
              </FrostedPanel>
            </div>
          </div>
        )}

        {/* TAB 2: CAPACITY & FACILITIES */}
        {activeTab === 'capacity' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-primary" />
                  <span>Licensed Capacity & Emergency Services</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Authorized bed allotments and continuous emergency care availability.</p>
              </div>
              <Button type="button" onClick={() => setEditingCapacity(!editingCapacity)} className="text-xs">
                {editingCapacity ? 'Cancel' : 'Edit Capacity'}
              </Button>
            </div>

            {editingCapacity ? (
              <form onSubmit={handleSaveCapacity} className="p-5 rounded-2xl bg-surface/40 border border-border/70 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Update Licensed Capacities</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    id="cap-total-beds"
                    label="Total Licensed Beds"
                    type="number"
                    placeholder="e.g. 150"
                    value={totalBeds}
                    onChange={e => setTotalBeds(e.target.value)}
                    helpText="Official registered bed count."
                  />
                  <FormField
                    id="cap-icu-beds"
                    label="ICU Beds"
                    type="number"
                    placeholder="e.g. 25"
                    value={icuBeds}
                    onChange={e => setIcuBeds(e.target.value)}
                    helpText="Intensive care capacity."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/60 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                      checked={emergencyDept}
                      onChange={e => setEmergencyDept(e.target.checked)}
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground block">Emergency Department</span>
                      <span className="text-xs text-muted-foreground">24/7 casualty / trauma emergency care active</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/60 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                      checked={ambulanceAvail}
                      onChange={e => setAmbulanceAvail(e.target.checked)}
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground block">Ambulance Service</span>
                      <span className="text-xs text-muted-foreground">Dedicated patient transport ambulances available</span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" className="text-xs">Save Capacity Facts</Button>
                </div>
              </form>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-surface/50 border border-border/60 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bed Capacity</span>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span className="text-xs text-muted-foreground">Total Beds</span>
                      <p className="text-2xl font-sans font-bold text-foreground">{hospitalDetails?.total_beds ?? 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">ICU Beds</span>
                      <p className="text-2xl font-sans font-bold text-foreground">{hospitalDetails?.icu_beds ?? 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface/50 border border-border/60 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Emergency Readiness</span>
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Emergency Department:</span>
                      <span className="font-semibold text-foreground">{hospitalDetails?.emergency_department ? 'Available (24/7)' : 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ambulance Unit:</span>
                      <span className="font-semibold text-foreground">{hospitalDetails?.ambulance_available ? 'Available' : 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </FrostedPanel>
        )}

        {/* TAB 3: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Clinical Services Catalog</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Departments, diagnostic specialties, and therapeutic procedures offered.</p>
              </div>
              <Button type="button" onClick={() => setAddingService(!addingService)} className="text-xs gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{addingService ? 'Cancel' : 'Register Service'}</span>
              </Button>
            </div>

            {addingService && (
              <form onSubmit={handleAddService} className="p-5 rounded-2xl bg-surface/40 border border-border/70 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Add Clinical Offering</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    id="serv-name"
                    label="Service / Procedure Name"
                    required
                    placeholder="e.g. Hemodialysis, MRI 3T, Neonatal ICU"
                    value={serviceName}
                    onChange={e => setServiceName(e.target.value)}
                  />
                  <FormField
                    id="serv-cat"
                    label="Category"
                    as="select"
                    value={serviceCategory}
                    onChange={e => setServiceCategory(e.target.value)}
                  >
                    <option value="Clinical">Clinical Service</option>
                    <option value="Diagnostic">Diagnostic & Imaging</option>
                    <option value="Surgical">Surgical & Operation</option>
                    <option value="Rehabilitative">Rehabilitative</option>
                  </FormField>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" className="text-xs">Save Service</Button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="text-xs text-muted-foreground">Loading services catalog...</p>
            ) : services.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map(s => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-foreground">{s.service_name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.service_category || 'Clinical Offering'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(s.id)}
                      className="p-1.5 hover:bg-surface rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                      title="Remove service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground italic">
                No clinical services registered yet. Click &quot;Register Service&quot; to list available healthcare offerings.
              </div>
            )}
          </FrostedPanel>
        )}

        {/* TAB 4: DOCTORS */}
        {activeTab === 'doctors' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                <span>Affiliated Medical Practitioners</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Doctors and specialists connected to this institution.</p>
            </div>

            {affiliatedDoctors.length > 0 ? (
              <div className="space-y-3">
                {affiliatedDoctors.map((doc, i) => (
                  <div key={doc.id || i} className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{doc.position || 'Medical Consultant'}</h4>
                      <p className="text-xs text-muted-foreground">{doc.department || 'Clinical Department'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-surface border border-border/60 text-muted-foreground">
                      Active Affiliation
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground italic">
                Affiliated doctors will appear here when clinicians link their practice to this hospital.
              </div>
            )}
          </FrostedPanel>
        )}

        {/* TAB 5: VERIFICATION */}
        {activeTab === 'verification' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Institutional Accreditation & Verification</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Government gazette matches and hospital registry certification.</p>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Strict Authoritative Verification</p>
                  <p className="leading-relaxed">
                    Under MEDIMESH trust architecture, healthcare institutions cannot grant themselves verification badges. Verification is conducted against clinical establishment registrations (e.g. Navi Mumbai Municipal Corporation health licenses and state panel registries).
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-2">
                  <span className="font-semibold text-foreground">Institutional Review</span>
                  <p className="capitalize text-sm font-bold text-primary">{profile?.verification_status || 'Pending Review'}</p>
                  <p className="text-[11px]">Audit verification status across Navi Mumbai district authorities.</p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-2">
                  <span className="font-semibold text-foreground">Accreditation</span>
                  <p className="text-sm font-bold text-foreground">{hospitalDetails?.accreditation || 'State Registration'}</p>
                  <p className="text-[11px]">NABH, NABL, or local municipal registration certificates.</p>
                </div>
              </div>
            </div>
          </FrostedPanel>
        )}
      </div>
    </AppPageContainer>
  );
}
