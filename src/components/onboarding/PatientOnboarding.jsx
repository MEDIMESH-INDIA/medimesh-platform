import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function PatientOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Basic Info
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [language, setLanguage] = useState('');

  // Medical Profile
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');

  // Emergency
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Save Medical Profile
      if (bloodGroup || allergies || chronic || dob || gender) {
        const { error: medError } = await supabase
          .from('patient_medical_profiles')
          .insert([{
            id: user.id,
            blood_group: bloodGroup,
            allergies,
            chronic_conditions: chronic,
            date_of_birth: dob || null,
            gender
          }]);
        if (medError) throw medError;
      }

      // 2. Save Emergency Contact
      if (emergencyName || emergencyPhone) {
        const { error: emError } = await supabase
          .from('patient_emergency_contacts')
          .insert([{
            patient_id: user.id,
            contact_name: emergencyName,
            phone: emergencyPhone,
            relationship: emergencyRel
          }]);
        if (emError) throw emError;
      }

      // 3. Mark Onboarding as Complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      // 4. Navigate
      await refreshProfile();
      navigate('/app');
    } catch (err) {
      setError('Failed to save profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Complete your profile</h1>
        <p className="text-muted-foreground">
          Your health information helps MEDIMESH personalize healthcare discovery. You control what you provide.
        </p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['01 Personal', '02 Health Profile', '03 Emergency'].map((label, idx) => (
          <div 
            key={label}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              step === idx + 1 ? 'bg-primary text-primary-foreground' : 'bg-surface-elevated text-muted-foreground'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Basic Information (Optional)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input type="date" className="w-full p-2 border rounded-xl" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select className="w-full p-2 border rounded-xl bg-white" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Language</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={language} onChange={e => setLanguage(e.target.value)} placeholder="e.g. English, Hindi" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Health Profile (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Blood Group</label>
                <select className="w-full p-2 border rounded-xl bg-white" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                  <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Allergies</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chronic Conditions</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={chronic} onChange={e => setChronic(e.target.value)} placeholder="e.g. Asthma, Diabetes Type 2" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Emergency Contact (Optional)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Relationship</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={emergencyRel} onChange={e => setEmergencyRel(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="tel" className="w-full p-2 border rounded-xl" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="px-6 py-2 rounded-xl border font-medium">Back</button>
        ) : <div></div>}
        
        <div className="flex gap-3">
          <button onClick={() => setStep(step < 3 ? step + 1 : step)} className="px-6 py-2 rounded-xl text-muted-foreground font-medium hover:text-foreground">
            {step === 3 ? '' : 'Skip for now'}
          </button>
          
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
