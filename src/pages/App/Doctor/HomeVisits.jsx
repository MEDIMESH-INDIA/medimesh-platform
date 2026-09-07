import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import LoadingState from '../../../components/common/LoadingState';
import Toast from '../../../components/common/Toast';
import { useDoctorPortal } from '../../../hooks/useDoctorPortal';

const SERVICE_AREAS = [
  "Vashi", "Nerul", "Belapur", "Kharghar", "Airoli", 
  "Koparkhairane", "Ghansoli", "Sanpada", "Seawoods", "Panvel"
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorHomeVisits() {
  const { getProfile, updateProfile, loading: saving } = useDoctorPortal();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    offers_home_visits: false,
    home_visit_contact_public: false,
    professional_contact_phone: '',
    whatsapp_contact: '',
    home_visit_service_areas: [],
    home_visit_days: [],
    home_visit_start_time: '',
    home_visit_end_time: '',
    home_visit_fee: '',
    home_visit_note: ''
  });

  useEffect(() => {
    async function load() {
      const data = await getProfile();
      if (data) {
        setFormData({
          offers_home_visits: data.offers_home_visits || false,
          home_visit_contact_public: data.home_visit_contact_public || false,
          professional_contact_phone: data.professional_contact_phone || '',
          whatsapp_contact: data.whatsapp_contact || '',
          home_visit_service_areas: data.home_visit_service_areas || [],
          home_visit_days: data.home_visit_days || [],
          home_visit_start_time: data.home_visit_start_time || '',
          home_visit_end_time: data.home_visit_end_time || '',
          home_visit_fee: data.home_visit_fee || '',
          home_visit_note: data.home_visit_note || ''
        });
      }
      setLoading(false);
    }
    load();
  }, [getProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleArrayToggle = (field, item) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item) 
        ? current.filter(x => x !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      ...formData,
      home_visit_fee: formData.home_visit_fee ? parseFloat(formData.home_visit_fee) : null
    });
    if (result) {
      setToast({ type: 'success', message: 'Home Visit settings saved' });
    } else {
      setToast({ type: 'error', message: 'Failed to save settings' });
    }
  };

  if (loading) return <AppPageContainer><LoadingState message="Loading home visit settings..." /></AppPageContainer>;

  return (
    <AppPageContainer className="!max-w-[800px] space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
          <Home className="w-6 h-6 text-emerald-600" /> Home Visit Management
        </h1>
        <p className="text-muted-foreground">Configure your availability for non-emergency home consultations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FrostedPanel className="p-6 sm:p-8 rounded-[24px]">
          <label className="flex items-start gap-4 cursor-pointer mb-2">
            <input
              type="checkbox"
              name="offers_home_visits"
              checked={formData.offers_home_visits}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
            />
            <div>
              <h3 className="font-semibold text-foreground text-lg">Enable Home Visits</h3>
              <p className="text-sm text-muted-foreground mt-1">If enabled, you will appear in the public Home Visits directory.</p>
            </div>
          </label>
        </FrostedPanel>

        {formData.offers_home_visits && (
          <>
            <FrostedPanel className="p-6 sm:p-8 rounded-[24px] space-y-6 border-emerald-100 bg-emerald-50/20">
              <h3 className="font-semibold text-foreground border-b border-border/60 pb-3">Service Areas & Schedule</h3>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Service Areas</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleArrayToggle('home_visit_service_areas', area)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        formData.home_visit_service_areas.includes(area)
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-white text-muted-foreground border-border hover:bg-surface'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleArrayToggle('home_visit_days', day)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        formData.home_visit_days.includes(day)
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-white text-muted-foreground border-border hover:bg-surface'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  id="home_visit_start_time"
                  name="home_visit_start_time"
                  label="Start Time"
                  type="time"
                  value={formData.home_visit_start_time}
                  onChange={handleChange}
                />
                <FormField
                  id="home_visit_end_time"
                  name="home_visit_end_time"
                  label="End Time"
                  type="time"
                  value={formData.home_visit_end_time}
                  onChange={handleChange}
                />
              </div>

              <FormField
                id="home_visit_fee"
                name="home_visit_fee"
                label="Base Visit Fee (₹)"
                type="number"
                min="0"
                step="100"
                value={formData.home_visit_fee}
                onChange={handleChange}
                placeholder="e.g. 1500"
              />
              
              <FormField
                id="home_visit_note"
                name="home_visit_note"
                label="Home Visit Note"
                as="textarea"
                rows={2}
                value={formData.home_visit_note}
                onChange={handleChange}
                placeholder="e.g. Advance booking required. Additional travel fee may apply outside Vashi."
              />
            </FrostedPanel>

            <FrostedPanel className="p-6 sm:p-8 rounded-[24px] space-y-6">
              <h3 className="font-semibold text-foreground border-b border-border/60 pb-3">Public Contact Integration</h3>
              
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl mb-4">
                <strong>Privacy Notice:</strong> We do NOT expose your private account phone number. You must explicitly provide and enable a professional contact number below for it to be visible in the public directory.
              </div>

              <label className="flex items-start gap-4 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  name="home_visit_contact_public"
                  checked={formData.home_visit_contact_public}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary border-gray-300"
                />
                <div>
                  <h4 className="font-semibold text-foreground">Make Contact Public</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Show Call and WhatsApp buttons directly on your Home Visit profile.</p>
                </div>
              </label>

              {formData.home_visit_contact_public && (
                <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-border/60">
                  <FormField
                    id="professional_contact_phone"
                    name="professional_contact_phone"
                    label="Professional Phone (Calling)"
                    type="tel"
                    value={formData.professional_contact_phone}
                    onChange={handleChange}
                    placeholder="+91..."
                  />
                  <FormField
                    id="whatsapp_contact"
                    name="whatsapp_contact"
                    label="Professional WhatsApp"
                    type="tel"
                    value={formData.whatsapp_contact}
                    onChange={handleChange}
                    placeholder="+91..."
                  />
                </div>
              )}
            </FrostedPanel>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Home Visit Settings'}
          </Button>
        </div>
      </form>
    </AppPageContainer>
  );
}
