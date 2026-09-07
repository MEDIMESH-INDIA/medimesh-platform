import { useEffect, useState } from 'react';
import { Award, Trash2, Plus } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import LoadingState from '../../../components/common/LoadingState';
import Toast from '../../../components/common/Toast';
import { useDoctorPortal } from '../../../hooks/useDoctorPortal';

export default function DoctorQualifications() {
  const { getQualifications, addQualification, deleteQualification, loading: processing } = useDoctorPortal();
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    medical_registration_number: '',
    medical_council: '',
    degrees: ''
  });

  const loadData = async () => {
    setLoading(true);
    const data = await getQualifications();
    setQualifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getQualifications]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const result = await addQualification({
      medical_registration_number: formData.medical_registration_number,
      medical_council: formData.medical_council,
      degrees: formData.degrees
    });
    
    if (result) {
      setToast({ type: 'success', message: 'Qualification added successfully' });
      setAdding(false);
      setFormData({ medical_registration_number: '', medical_council: '', degrees: '' });
      loadData();
    } else {
      setToast({ type: 'error', message: 'Failed to add qualification' });
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteQualification(id);
    if (result) {
      setToast({ type: 'success', message: 'Qualification removed' });
      loadData();
    } else {
      setToast({ type: 'error', message: 'Failed to remove qualification' });
    }
  };

  if (loading && qualifications.length === 0) return <AppPageContainer><LoadingState message="Loading qualifications..." /></AppPageContainer>;

  return (
    <AppPageContainer className="!max-w-[800px] space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Qualifications
          </h1>
          <p className="text-muted-foreground">Manage your degrees and medical registrations.</p>
        </div>
        <Button onClick={() => setAdding(!adding)} variant={adding ? 'outline' : 'primary'} className="gap-2">
          {adding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New</>}
        </Button>
      </div>

      {adding && (
        <FrostedPanel className="p-6 rounded-[24px] bg-surface/50 border-primary/20">
          <form onSubmit={handleAdd} className="space-y-5">
            <h3 className="font-semibold text-foreground mb-2">New Qualification Entry</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField
                id="medical_registration_number"
                name="medical_registration_number"
                label="Registration Number"
                value={formData.medical_registration_number}
                onChange={handleChange}
                placeholder="e.g. MMC-12345"
                required
              />
              <FormField
                id="medical_council"
                name="medical_council"
                label="Medical Council"
                value={formData.medical_council}
                onChange={handleChange}
                placeholder="e.g. Maharashtra Medical Council"
                required
              />
            </div>
            <FormField
              id="degrees"
              name="degrees"
              label="Degrees / Certifications"
              value={formData.degrees}
              onChange={handleChange}
              placeholder="e.g. MBBS, MD (Medicine)"
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Qualification'}
              </Button>
            </div>
          </form>
        </FrostedPanel>
      )}

      <FrostedPanel className="p-6 sm:p-8 rounded-[24px]">
        {qualifications.length > 0 ? (
          <div className="space-y-4">
            {qualifications.map(q => (
              <div key={q.id} className="p-4 rounded-xl border border-border/60 bg-surface/30 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{q.degrees || 'Medical Practitioner'}</h3>
                  <p className="text-xs text-muted-foreground">Reg: {q.medical_registration_number} ({q.medical_council})</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  disabled={processing}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove qualification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-foreground font-semibold mb-1">No qualifications added yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your medical degrees and council registrations.</p>
            <Button onClick={() => setAdding(true)} variant="outline" size="sm">Add Qualification</Button>
          </div>
        )}
      </FrostedPanel>
    </AppPageContainer>
  );
}
