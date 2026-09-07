import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import LoadingState from '../../../components/common/LoadingState';
import Toast from '../../../components/common/Toast';
import { useDoctorPortal } from '../../../hooks/useDoctorPortal';

// Extracted from common taxonomy
const CANONICAL_SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Neurologist", "Orthopedist",
  "Pediatrician", "Gynecologist", "Dermatologist", "Psychiatrist",
  "Endocrinologist", "Oncologist", "Ophthalmologist", "ENT Specialist"
];

export default function DoctorSpecializations() {
  const { getSpecializations, updateSpecializations, getCanonicalProfile, updateCanonicalProfile, loading: saving } = useDoctorPortal();
  const [canonicalId, setCanonicalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    primary_specialization: '',
    sub_specializations: '',
    languages_spoken: ''
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      const [data, canonicalProfile] = await Promise.all([getSpecializations(), getCanonicalProfile()]);
      if (canonicalProfile) setCanonicalId(canonicalProfile.id);
      if (data) {
        setFormData({
          primary_specialization: data.primary_specialization || '',
          sub_specializations: data.sub_specializations || '',
          languages_spoken: data.languages_spoken || ''
        });
      }
      setLoading(false);
    }
    load();
  }, [getSpecializations, getCanonicalProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateSpecializations(formData);
    if (result && canonicalId) {
      await updateCanonicalProfile(canonicalId, { specialization: formData.primary_specialization });
    }
    if (result) {
      setToast({ type: 'success', message: 'Specializations updated' });
    } else {
      setToast({ type: 'error', message: 'Failed to update specializations' });
    }
  };

  if (loading) return <AppPageContainer><LoadingState message="Loading specializations..." /></AppPageContainer>;

  return (
    <AppPageContainer className="!max-w-[800px] space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary" /> Specializations
        </h1>
        <p className="text-muted-foreground">Manage your clinical focus areas and languages.</p>
      </div>

      <FrostedPanel className="p-6 sm:p-8 rounded-[24px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            id="primary_specialization"
            name="primary_specialization"
            label="Primary Specialization"
            as="select"
            value={formData.primary_specialization}
            onChange={handleChange}
            required
          >
            <option value="">Select primary specialty</option>
            {CANONICAL_SPECIALIZATIONS.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </FormField>

          <FormField
            id="sub_specializations"
            name="sub_specializations"
            label="Sub-specializations (comma separated)"
            value={formData.sub_specializations}
            onChange={handleChange}
            placeholder="e.g. Interventional Cardiology, Heart Failure"
          />

          <FormField
            id="languages_spoken"
            name="languages_spoken"
            label="Languages Spoken (comma separated)"
            value={formData.languages_spoken}
            onChange={handleChange}
            placeholder="e.g. English, Hindi, Marathi"
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Specializations'}
            </Button>
          </div>
        </form>
      </FrostedPanel>
    </AppPageContainer>
  );
}
