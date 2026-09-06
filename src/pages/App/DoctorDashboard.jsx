import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Award, Building2, CheckCircle2, AlertCircle, Clock, ShieldCheck, Plus, Trash2, MapPin, UserRound } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';

export default function DoctorDashboard() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Real database states
  const [qualifications, setQualifications] = useState([]);
  const [specializations, setSpecializations] = useState(null);
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding items
  const [addingQual, setAddingQual] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [council, setCouncil] = useState('');
  const [degrees, setDegrees] = useState('');

  const [addingAffil, setAddingAffil] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [orgType, setOrgType] = useState('Hospital');

  const [feedback, setFeedback] = useState(null);

  const loadDoctorData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [qualRes, specRes, affilRes] = await Promise.all([
        supabase.from('doctor_qualifications').select('*').eq('doctor_id', user.id),
        supabase.from('doctor_specializations').select('*').eq('doctor_id', user.id).maybeSingle(),
        supabase.from('doctor_affiliations').select('*').eq('doctor_id', user.id),
      ]);

      setQualifications(qualRes.data || []);
      setSpecializations(specRes.data || null);
      setAffiliations(affilRes.data || []);
    } catch (err) {
      console.error('Failed to load doctor portal records:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDoctorData();
  }, [loadDoctorData]);

  const handleAddQualification = async (e) => {
    e.preventDefault();
    if (!user?.id || !regNumber || !council) return;
    try {
      const { error } = await supabase.from('doctor_qualifications').insert([{
        doctor_id: user.id,
        medical_registration_number: regNumber.trim(),
        medical_council: council.trim(),
        degrees: degrees.trim() || null,
      }]);
      if (error) throw error;
      setRegNumber('');
      setCouncil('');
      setDegrees('');
      setAddingQual(false);
      setFeedback({ message: 'Qualification record saved successfully.', type: 'success' });
      await loadDoctorData();
    } catch (err) {
      console.error('Error adding qualification:', err);
      setFeedback({ message: 'Could not save qualification. Please verify your data.', type: 'error' });
    }
  };

  const handleDeleteQualification = async (id) => {
    try {
      const { error } = await supabase.from('doctor_qualifications').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ message: 'Qualification removed.', type: 'success' });
      await loadDoctorData();
    } catch (err) {
      console.error('Error deleting qualification:', err);
    }
  };

  const handleAddAffiliation = async (e) => {
    e.preventDefault();
    if (!user?.id || !orgName) return;
    try {
      const { error } = await supabase.from('doctor_affiliations').insert([{
        doctor_id: user.id,
        organization_name: orgName.trim(),
        organization_type: orgType,
        position: position.trim() || null,
        department: department.trim() || null,
      }]);
      if (error) throw error;
      setOrgName('');
      setPosition('');
      setDepartment('');
      setAddingAffil(false);
      setFeedback({ message: 'Affiliation added successfully.', type: 'success' });
      await loadDoctorData();
    } catch (err) {
      console.error('Error adding affiliation:', err);
      setFeedback({ message: 'Could not save affiliation. Please check inputs.', type: 'error' });
    }
  };

  const handleDeleteAffiliation = async (id) => {
    try {
      const { error } = await supabase.from('doctor_affiliations').delete().eq('id', id);
      if (error) throw error;
      setFeedback({ message: 'Affiliation removed.', type: 'success' });
      await loadDoctorData();
    } catch (err) {
      console.error('Error deleting affiliation:', err);
    }
  };

  // Calculate completeness
  let completedSteps = 0;
  if (profile?.display_name) completedSteps += 1;
  if (profile?.city) completedSteps += 1;
  if (qualifications.length > 0) completedSteps += 1;
  if (affiliations.length > 0) completedSteps += 1;
  if (specializations?.primary_specialization) completedSteps += 1;
  const completenessPercent = Math.round((completedSteps / 5) * 100);

  const isVerified = profile?.verification_status === 'verified';
  const StatusIcon = isVerified ? CheckCircle2 : Clock;

  return (
    <AppPageContainer>
      <div className="max-w-[1060px] space-y-8">
        <PageHeader
          eyebrow="Professional Practitioner Workspace"
          title="Doctor Portal"
          description="Maintain your verified credentials, council registrations, and hospital affiliations."
          actions={
            <div className="flex gap-2">
              <Button as={Link} to="/app/profile" variant="outline">
                Account Settings
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

        {/* Portal Nav Tabs */}
        <div className="flex gap-2 border-b border-border/70 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Workspace Overview' },
            { id: 'qualifications', label: `Qualifications (${qualifications.length})` },
            { id: 'affiliations', label: `Affiliations (${affiliations.length})` },
            { id: 'verification', label: 'Verification Status' },
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
            {/* Top Stat Strips */}
            <div className="grid sm:grid-cols-3 gap-5">
              <FrostedPanel variant="elevated" className="p-6 rounded-[22px] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Profile Completeness</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-foreground">{completenessPercent}%</span>
                  <span className="text-xs text-muted-foreground">({completedSteps} of 5 areas)</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/60">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${completenessPercent}%` }} />
                </div>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-6 rounded-[22px] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Verification Status</span>
                <div className="flex items-center gap-2 pt-1">
                  <StatusIcon className={`w-5 h-5 ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span className="text-xl font-serif font-semibold text-foreground capitalize">
                    {profile?.verification_status || 'Pending Review'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Council verification state</p>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-6 rounded-[22px] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Clinical Network</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-foreground">{affiliations.length}</span>
                  <span className="text-xs text-muted-foreground">Institutional affiliations</span>
                </div>
                <p className="text-xs text-muted-foreground">Recorded hospital partnerships</p>
              </FrostedPanel>
            </div>

            {/* Profile Summary Card */}
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <FrostedPanel variant="elevated" className="rounded-[26px] p-7 sm:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary font-serif font-bold text-xl border border-primary/20">
                    <UserRound className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Practitioner Record</p>
                    <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">
                      {profile?.display_name || 'Medical Professional'}
                    </h2>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{profile?.city ? `${profile.city}, Maharashtra` : 'Location not provided'}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/70 pt-5 space-y-3 text-xs text-muted-foreground">
                  <p className="leading-relaxed">
                    All medical qualifications and affiliations submitted through MEDIMESH undergo institutional registry verification. Factual records remain published transparently without ratings, paid visibility, or promoted outcomes.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-lg bg-surface border border-border/60 text-foreground font-medium">
                      Role: Medical Practitioner
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-surface border border-border/60 text-foreground font-medium">
                      Onboarding: {profile?.onboarding_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="rounded-[26px] p-7 sm:p-8 space-y-5">
                <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Trust & Verification</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Doctor profiles cannot be self-verified. Council credentials and hospital affiliations are cross-checked against authoritative registers before public verification badges are issued.
                </p>
                <div className="rounded-xl bg-surface/50 border border-border/60 p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">State Council:</span>
                    <span className="font-medium text-foreground">Maharashtra Medical Council</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Audit Status:</span>
                    <span className="font-semibold text-amber-700 capitalize">{profile?.verification_status || 'Pending'}</span>
                  </div>
                </div>
              </FrostedPanel>
            </div>
          </div>
        )}

        {/* TAB 2: QUALIFICATIONS */}
        {activeTab === 'qualifications' && (
          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Medical Qualifications & Registrations</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Council numbers, degrees, and recognized medical certifications.</p>
              </div>
              <Button type="button" onClick={() => setAddingQual(!addingQual)} className="text-xs gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{addingQual ? 'Cancel' : 'Add Qualification'}</span>
              </Button>
            </div>

            {addingQual && (
              <form onSubmit={handleAddQualification} className="p-5 rounded-2xl bg-surface/40 border border-border/70 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Record New Qualification</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    id="qual-reg"
                    label="Medical Registration Number"
                    required
                    placeholder="e.g. MMC-2004-12345"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                  />
                  <FormField
                    id="qual-council"
                    label="Medical Council"
                    required
                    placeholder="e.g. Maharashtra Medical Council"
                    value={council}
                    onChange={e => setCouncil(e.target.value)}
                  />
                </div>
                <FormField
                  id="qual-degrees"
                  label="Degrees & Certifications"
                  placeholder="e.g. MBBS, MS (Orthopaedics)"
                  value={degrees}
                  onChange={e => setDegrees(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" className="text-xs">Save Qualification</Button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="text-xs text-muted-foreground">Loading qualifications...</p>
            ) : qualifications.length > 0 ? (
              <div className="space-y-3">
                {qualifications.map(q => (
                  <div key={q.id} className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-foreground">{q.degrees || 'Medical Degree'}</p>
                      <p className="text-xs text-muted-foreground">
                        Reg: <span className="font-mono text-foreground font-medium">{q.medical_registration_number}</span> • {q.medical_council}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteQualification(q.id)}
                      className="p-2 hover:bg-surface rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                      title="Remove qualification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground italic">
                No qualification records stored yet. Click &quot;Add Qualification&quot; to register council credentials.
              </div>
            )}
          </FrostedPanel>
        )}

        {/* TAB 3: AFFILIATIONS */}
        {activeTab === 'affiliations' && (
          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span>Clinical & Hospital Affiliations</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Institutions and hospitals where you practice or consult.</p>
              </div>
              <Button type="button" onClick={() => setAddingAffil(!addingAffil)} className="text-xs gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{addingAffil ? 'Cancel' : 'Add Affiliation'}</span>
              </Button>
            </div>

            {addingAffil && (
              <form onSubmit={handleAddAffiliation} className="p-5 rounded-2xl bg-surface/40 border border-border/70 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Record Institutional Affiliation</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    id="affil-org"
                    label="Hospital / Organization Name"
                    required
                    placeholder="e.g. Fortis Hiranandani Hospital"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                  />
                  <FormField
                    id="affil-type"
                    label="Facility Type"
                    as="select"
                    value={orgType}
                    onChange={e => setOrgType(e.target.value)}
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Private Clinic">Private Clinic</option>
                    <option value="Research Institute">Research Institute</option>
                  </FormField>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    id="affil-dept"
                    label="Department / Specialty"
                    placeholder="e.g. Cardiology"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                  />
                  <FormField
                    id="affil-pos"
                    label="Clinical Position"
                    placeholder="e.g. Senior Consultant"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" className="text-xs">Save Affiliation</Button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="text-xs text-muted-foreground">Loading affiliations...</p>
            ) : affiliations.length > 0 ? (
              <div className="space-y-3">
                {affiliations.map(a => (
                  <div key={a.id} className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-foreground">{a.organization_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.position || 'Consultant'} • {a.department || a.organization_type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAffiliation(a.id)}
                      className="p-2 hover:bg-surface rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                      title="Remove affiliation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground italic">
                No clinical affiliations recorded yet. Click &quot;Add Affiliation&quot; to register your hospital partnerships.
              </div>
            )}
          </FrostedPanel>
        )}

        {/* TAB 4: VERIFICATION */}
        {activeTab === 'verification' && (
          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Verification & Registry Audit</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Authoritative registry cross-checks governing MEDIMESH verified badges.</p>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Strict Independent Verification</p>
                  <p className="leading-relaxed">
                    Under MEDIMESH trust architecture, healthcare providers and doctors cannot self-verify their listings. Verification is granted after council registries (e.g. Maharashtra Medical Council / National Medical Commission) and hospital panel rosters confirm active accreditation.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-2">
                  <span className="font-semibold text-foreground">Current Account Status</span>
                  <p className="capitalize text-sm font-bold text-primary">{profile?.verification_status || 'Pending review'}</p>
                  <p className="text-[11px]">Audit records are reviewed periodically against government gazette rosters.</p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-2">
                  <span className="font-semibold text-foreground">Submission Completeness</span>
                  <p className="text-sm font-bold text-foreground">{completenessPercent}% Complete</p>
                  <p className="text-[11px]">Having complete qualifications and hospital affiliations accelerates verification.</p>
                </div>
              </div>
            </div>
          </FrostedPanel>
        )}
      </div>
    </AppPageContainer>
  );
}
