import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import LoadingState from '../../../components/common/LoadingState';
import Toast from '../../../components/common/Toast';
import { useDoctorPortal } from '../../../hooks/useDoctorPortal';

export default function DoctorProfile() {
  const { getCanonicalProfile, updateCanonicalProfile, loading: saving } = useDoctorPortal();
  const [canonicalId, setCanonicalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    experience_years: '',
    locality: '',
    city: '',
    state: '',
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      const p = await getCanonicalProfile();
      if (p) {
        setCanonicalId(p.id);
        setFormData({
          full_name: p.full_name || '',
          specialization: p.specialization || '',
          experience_years: p.experience_years || '',
          locality: p.locality || '',
          city: p.city || '',
          state: p.state || '',
        });
      }
      setLoading(false);
    }
    load();
  }, [getCanonicalProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canonicalId) return;
    const result = await updateCanonicalProfile(canonicalId, {
      ...formData,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      locality: formData.locality || formData.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    
    if (result) {
      setToast({ type: 'success', message: 'Profile updated successfully' });
    } else {
      setToast({ type: 'error', message: 'Failed to update profile' });
    }
  };

  if (loading) return <AppPageContainer><LoadingState message="Loading profile..." /></AppPageContainer>;

  if (!canonicalId) {
    return (
      <AppPageContainer className="!max-w-[700px] space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Professional Profile
          </h1>
        </div>
        <FrostedPanel className="p-8 rounded-[24px] text-center border-amber-200 bg-amber-50/50">
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Profile Not Linked</h2>
          <p className="text-amber-700">Your public MEDIMESH directory profile has not been linked yet.</p>
        </FrostedPanel>
      </AppPageContainer>
    );
  }

  return (
    <AppPageContainer className="!max-w-[800px] space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" /> Profile
        </h1>
        <p className="text-muted-foreground">Manage your basic public information.</p>
      </div>

      <FrostedPanel className="p-6 sm:p-8 rounded-[24px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField
              id="full_name"
              name="full_name"
              label="Public Display Name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Dr. Jane Smith"
              required
            />
            <FormField
              id="experience_years"
              name="experience_years"
              label="Years of Experience"
              type="number"
              min="0"
              max="100"
              value={formData.experience_years}
              onChange={handleChange}
              placeholder="e.g. 15"
            />
          </div>
          
          <FormField
            id="specialization"
            name="specialization"
            label="Primary Specialization"
            
            value={formData.specialization}
            onChange={handleChange}
            placeholder="e.g. Cardiologist"
          />

          <div className="grid sm:grid-cols-2 gap-5">
            <FormField
              id="city"
              name="city"
              label="Primary City"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Navi Mumbai"
            />
            <FormField
              id="state"
              name="state"
              label="State"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Maharashtra"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </FrostedPanel>
    </AppPageContainer>
  );
}
