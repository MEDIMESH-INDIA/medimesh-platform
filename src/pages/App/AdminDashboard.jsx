import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Building2, Stethoscope, Database, FileText, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';

export default function AdminDashboard() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Real data state
  const [hospitalCount, setHospitalCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [sourceCount, setSourceCount] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [hospCountRes, docCountRes, sourceCountRes, hospListRes, sourcesRes, verifRes, logsRes] = await Promise.all([
        supabase.from('hospitals').select('*', { count: 'exact', head: true }),
        supabase.from('doctor_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('data_sources').select('*', { count: 'exact', head: true }),
        supabase.from('hospitals').select('id, slug, name, locality, city, hospital_type, publication_status').order('name').limit(15),
        supabase.from('data_sources').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('verification_requests').select('*').order('submitted_at', { ascending: false }).limit(10),
        supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      setHospitalCount(hospCountRes.count || 0);
      setDoctorCount(docCountRes.count || 0);
      setSourceCount(sourceCountRes.count || 0);
      setHospitals(hospListRes.data || []);
      setDataSources(sourcesRes.data || []);
      setVerificationRequests(verifRes.data || []);
      setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error('Failed to load administrative governance records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleTogglePublication = async (hospital) => {
    const nextStatus = hospital.publication_status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({ publication_status: nextStatus })
        .eq('id', hospital.id);

      if (error) throw error;

      // Log admin audit activity
      await supabase.from('admin_activity_logs').insert([{
        actor_user_id: user?.id || null,
        action: `hospital_${nextStatus}`,
        entity_type: 'hospital',
        entity_id: hospital.id,
        metadata: { hospital_name: hospital.name, previous_status: hospital.publication_status },
      }]);

      setFeedback({ message: `Hospital "${hospital.name}" status updated to ${nextStatus}.`, type: 'success' });
      await loadAdminData();
    } catch (err) {
      console.error('Error updating hospital publication status:', err);
      setFeedback({ message: 'Failed to update publication status. Ensure admin permissions.', type: 'error' });
    }
  };

  const handleReviewRequest = async (request, decision) => {
    try {
      const nextStatus = decision === 'approve' ? 'approved' : 'rejected';
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: nextStatus,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
          review_notes: `Admin reviewed and marked ${nextStatus}.`,
        })
        .eq('id', request.id);

      if (error) throw error;

      // Log admin audit activity
      await supabase.from('admin_activity_logs').insert([{
        actor_user_id: user?.id || null,
        action: `verification_${nextStatus}`,
        entity_type: 'verification_request',
        entity_id: request.id,
        metadata: { subject_type: request.subject_type, request_type: request.request_type },
      }]);

      setFeedback({ message: `Verification request marked ${nextStatus}.`, type: 'success' });
      await loadAdminData();
    } catch (err) {
      console.error('Error updating verification request:', err);
      setFeedback({ message: 'Failed to update verification request status.', type: 'error' });
    }
  };

  const filteredHospitals = hospitals.filter(h =>
    !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase()) || (h.locality || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppPageContainer>
      <div className="space-y-7">
        <PageHeader
          eyebrow="System Governance & Auditing"
          title="Administration Portal"
          description="Factual overview of indexed catalogs, verification requests, evidence sources, and immutable audit logs."
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

        {/* Admin Identity Badge */}
        <FrostedPanel variant="elevated" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px] p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-foreground text-white font-serif font-bold text-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">Platform Administrator</p>
              <h2 className="mt-0.5 font-serif text-xl font-semibold text-foreground">{profile?.display_name || 'Authorized Admin'}</h2>
              <p className="text-xs text-muted-foreground">{profile?.email || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface/50 border border-border/60 px-3 py-1.5 rounded-xl">
            <Clock className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>{loading ? 'Refreshing records...' : 'RLS Enforced Governance'}</span>
          </div>
        </FrostedPanel>

        {/* Portal Tabs */}
        <div className="flex gap-2 border-b border-border/70 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview Metrics' },
            { id: 'hospitals', label: `Hospital Catalog (${hospitalCount})` },
            { id: 'verifications', label: `Verification Queue (${verificationRequests.length})` },
            { id: 'sources', label: `Data Sources (${sourceCount})` },
            { id: 'audit', label: `Audit Trail (${auditLogs.length})` },
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

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Indexed Hospitals</span>
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-sans font-bold text-foreground">{hospitalCount}</div>
                <p className="text-[11px] text-muted-foreground">Navi Mumbai canonical records</p>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Doctor Profiles</span>
                  <Stethoscope className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-sans font-bold text-foreground">{doctorCount}</div>
                <p className="text-[11px] text-muted-foreground">Registered practitioners</p>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data Sources</span>
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-sans font-bold text-foreground">{sourceCount}</div>
                <p className="text-[11px] text-muted-foreground">Authoritative registries</p>
              </FrostedPanel>

              <FrostedPanel variant="elevated" className="p-5 rounded-[22px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Audit Events</span>
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-sans font-bold text-foreground">{auditLogs.length}</div>
                <p className="text-[11px] text-muted-foreground">Recent logged operations</p>
              </FrostedPanel>
            </div>

            <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-7 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Governance Principles</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                MEDIMESH enforces strict truth-in-data standards. Platform administrators audit public catalog publication status, verified claims, and official evidentiary sources without synthetic statistics, star ratings, or commercial sponsorship.
              </p>
            </FrostedPanel>
          </div>
        )}

        {/* TAB 2: HOSPITAL CATALOG GOVERNANCE */}
        {activeTab === 'hospitals' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground">Hospital Catalog Governance</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Control publication visibility of hospital directory records.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter hospital list..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border/70 rounded-xl outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredHospitals.map(h => (
                <div key={h.id} className="p-4 rounded-xl bg-surface/50 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{h.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {h.locality}, {h.city} • <span className="capitalize">{h.hospital_type?.replace(/_/g, ' ') || 'General Hospital'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      h.publication_status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {h.publication_status || 'draft'}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTogglePublication(h)}
                      className="text-xs px-3 py-1.5"
                    >
                      {h.publication_status === 'published' ? 'Unpublish (Draft)' : 'Publish'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </FrostedPanel>
        )}

        {/* TAB 3: VERIFICATION QUEUE */}
        {activeTab === 'verifications' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h2 className="font-serif text-xl font-semibold text-foreground">Verification Review Queue</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Authoritative audit of provider and practitioner verification claims.</p>
            </div>

            {verificationRequests.length > 0 ? (
              <div className="space-y-3">
                {verificationRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-xl bg-surface/50 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground capitalize">{req.subject_type} Verification</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : req.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Type: {req.request_type} • Submitted: {new Date(req.submitted_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(req, 'approve')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(req, 'reject')}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground italic">
                No pending provider verification requests in the queue.
              </div>
            )}
          </FrostedPanel>
        )}

        {/* TAB 4: DATA SOURCES & PROVENANCE */}
        {activeTab === 'sources' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h2 className="font-serif text-xl font-semibold text-foreground">Registered Public Data Sources</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Authoritative government and municipal registries feeding MEDIMESH catalogs.</p>
            </div>

            <div className="space-y-3">
              {dataSources.map(ds => (
                <div key={ds.id} className="p-4 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground">{ds.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Type: <span className="font-mono text-primary font-medium">{ds.source_type}</span> • License: {ds.license || 'Open Data'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Registry
                  </span>
                </div>
              ))}
            </div>
          </FrostedPanel>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h2 className="font-serif text-xl font-semibold text-foreground">Administrative Activity Audit Logs</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Append-only security log recording governance actions and publication modifications.</p>
            </div>

            {auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 rounded-xl bg-surface/50 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-mono font-bold text-primary">{log.action}</span> on <span className="font-semibold text-foreground">{log.entity_type}</span>
                      <p className="text-muted-foreground mt-0.5">
                        {log.metadata ? JSON.stringify(log.metadata) : 'Standard administrative transition'}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(log.created_at).toLocaleString('en-GB')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground italic">
                No administrative audit actions logged in this session yet.
              </div>
            )}
          </FrostedPanel>
        )}
      </div>
    </AppPageContainer>
  );
}
