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
  const { getProfile, updateProfile, loading: saving } = useDoctorPortal();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    public_display_name: '',
    professional_summary: '',
    years_of_experience: '',
    city: '',
    state: '',
    slug: '',
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      if (p) {
        setFormData({
          public_display_name: p.public_display_name || '',
          professional_summary: p.professional_summary || '',
          years_of_experience: p.years_of_experience || '',
          city: p.city || '',
          state: p.state || '',
          slug: p.slug || '',
        });
      }
      setLoading(false);
    }
    load();
  }, [getProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      ...formData,
      years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
      slug: formData.slug || formData.public_display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    
    if (result) {
      setToast({ type: 'success', message: 'Profile updated successfully' });
    } else {
      setToast({ type: 'error', message: 'Failed to update profile' });
    }
  };

  if (loading) return <AppPageContainer><LoadingState message="Loading profile..." /></AppPageContainer>;

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
              id="public_display_name"
              name="public_display_name"
              label="Public Display Name"
              value={formData.public_display_name}
              onChange={handleChange}
              placeholder="e.g. Dr. Jane Smith"
              required
            />
            <FormField
              id="years_of_experience"
              name="years_of_experience"
              label="Years of Experience"
              type="number"
              min="0"
              max="100"
              value={formData.years_of_experience}
              onChange={handleChange}
              placeholder="e.g. 15"
            />
          </div>
          
          <FormField
            id="professional_summary"
            name="professional_summary"
            label="Professional Summary / Bio"
            as="textarea"
            rows={4}
            value={formData.professional_summary}
            onChange={handleChange}
            placeholder="Write a brief professional bio..."
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
