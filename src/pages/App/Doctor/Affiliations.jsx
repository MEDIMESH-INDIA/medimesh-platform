import { useEffect, useState } from 'react';
import { Building2, Trash2, Plus } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import LoadingState from '../../../components/common/LoadingState';
import Toast from '../../../components/common/Toast';
import { useDoctorPortal } from '../../../hooks/useDoctorPortal';

export default function DoctorAffiliations() {
  const { getAffiliations, addAffiliation, deleteAffiliation, loading: processing } = useDoctorPortal();
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: 'Hospital',
    department: '',
    position: ''
  });

  const loadData = async () => {
    setLoading(true);
    const data = await getAffiliations();
    setAffiliations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAffiliations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const result = await addAffiliation(formData);
    if (result) {
      setToast({ type: 'success', message: 'Affiliation added successfully' });
      setAdding(false);
      setFormData({ organization_name: '', organization_type: 'Hospital', department: '', position: '' });
      loadData();
    } else {
      setToast({ type: 'error', message: 'Failed to add affiliation' });
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteAffiliation(id);
    if (result) {
      setToast({ type: 'success', message: 'Affiliation removed' });
      loadData();
    } else {
      setToast({ type: 'error', message: 'Failed to remove affiliation' });
    }
  };

  if (loading && affiliations.length === 0) return <AppPageContainer><LoadingState message="Loading affiliations..." /></AppPageContainer>;

  return (
    <AppPageContainer className="!max-w-[800px] space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Hospital Affiliations
          </h1>
          <p className="text-muted-foreground">Manage the hospitals and clinics you practice at.</p>
        </div>
        <Button onClick={() => setAdding(!adding)} variant={adding ? 'outline' : 'primary'} className="gap-2">
          {adding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New</>}
        </Button>
      </div>

      {adding && (
        <FrostedPanel className="p-6 rounded-[24px] bg-surface/50 border-primary/20">
          <form onSubmit={handleAdd} className="space-y-5">
            <h3 className="font-semibold text-foreground mb-2">New Affiliation</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField
                id="organization_name"
                name="organization_name"
                label="Hospital / Organization Name"
                value={formData.organization_name}
                onChange={handleChange}
                placeholder="e.g. Fortis Hospital"
                required
              />
              <FormField
                id="organization_type"
                name="organization_type"
                label="Facility Type"
                as="select"
                value={formData.organization_type}
                onChange={handleChange}
              >
                <option value="Hospital">Hospital</option>
                <option value="Private Clinic">Private Clinic</option>
                <option value="Research Institute">Research Institute</option>
                <option value="Other">Other</option>
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField
                id="department"
                name="department"
                label="Department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
              />
              <FormField
                id="position"
                name="position"
                label="Clinical Position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g. Senior Consultant"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Affiliation'}
              </Button>
            </div>
          </form>
        </FrostedPanel>
      )}

      <FrostedPanel className="p-6 sm:p-8 rounded-[24px]">
        {affiliations.length > 0 ? (
          <div className="space-y-4">
            {affiliations.map(a => (
              <div key={a.id} className="p-4 rounded-xl border border-border/60 bg-surface/30 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{a.organization_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {a.position || 'Consultant'} • {a.department || a.organization_type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  disabled={processing}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove affiliation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-foreground font-semibold mb-1">No affiliations yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add the hospitals or clinics where you practice.</p>
            <Button onClick={() => setAdding(true)} variant="outline" size="sm">Add Affiliation</Button>
          </div>
        )}
      </FrostedPanel>
    </AppPageContainer>
  );
}
