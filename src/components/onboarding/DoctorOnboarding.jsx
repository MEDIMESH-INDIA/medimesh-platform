import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function DoctorOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Qualifications
  const [regNumber, setRegNumber] = useState('');
  const [council, setCouncil] = useState('');
  const [experience, setExperience] = useState('');

  // Specialization
  const [primarySpec, setPrimarySpec] = useState('');
  const [expertise, setExpertise] = useState('');
  const [languages, setLanguages] = useState('');

  // Affiliation
  const [orgType, setOrgType] = useState('Private Clinic');
  const [orgName, setOrgName] = useState('');
  const [orgCity, setOrgCity] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!regNumber || !council || !primarySpec || !orgName) {
        throw new Error('Please fill all required fields before completing.');
      }

      // 1. Save Qualifications
      const { error: qError } = await supabase
        .from('doctor_qualifications')
        .insert([{
          doctor_id: user.id,
          medical_registration_number: regNumber,
          medical_council: council,
          years_of_experience: parseInt(experience) || 0
        }]);
      if (qError) throw qError;

      // 2. Save Specialization
      const { error: sError } = await supabase
        .from('doctor_specializations')
        .insert([{
          doctor_id: user.id,
          primary_specialization: primarySpec,
          areas_of_expertise: expertise,
          languages_spoken: languages
        }]);
      if (sError) throw sError;

      // 3. Save Affiliation
      const { error: aError } = await supabase
        .from('doctor_affiliations')
        .insert([{
          doctor_id: user.id,
          organization_type: orgType,
          organization_name: orgName,
          city: orgCity
        }]);
      if (aError) throw aError;

      // 4. Mark Onboarding as Complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      await refreshProfile();
      navigate('/doctor');
    } catch (err) {
      setError(err.message || 'Failed to save profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Doctor Verification</h1>
        <p className="text-muted-foreground">
          Provide your professional credentials. This information is required to list you on MEDIMESH.
        </p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['01 Qualifications', '02 Specialization', '03 Practice'].map((label, idx) => (
          <div 
            key={label}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              step === idx + 1 ? 'bg-secondary-accent text-white' : 'bg-surface-elevated text-muted-foreground'
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
            <h2 className="text-xl font-semibold mb-4">Qualifications & Registration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Medical Registration Number *</label>
                <input required type="text" className="w-full p-2 border rounded-xl" value={regNumber} onChange={e => setRegNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medical Council *</label>
                <input required type="text" className="w-full p-2 border rounded-xl" value={council} onChange={e => setCouncil(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                <input type="number" className="w-full p-2 border rounded-xl" value={experience} onChange={e => setExperience(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Specialization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Specialization *</label>
                <input required type="text" className="w-full p-2 border rounded-xl" value={primarySpec} onChange={e => setPrimarySpec(e.target.value)} placeholder="e.g. Cardiology" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Areas of Expertise</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="e.g. Interventional Cardiology, Echocardiography" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Languages Spoken</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={languages} onChange={e => setLanguages(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Current Practice</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Organization Type *</label>
                <select className="w-full p-2 border rounded-xl bg-white" value={orgType} onChange={e => setOrgType(e.target.value)}>
                  <option value="Private Clinic">Private Clinic</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Both">Both</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Organization Name *</label>
                <input required type="text" className="w-full p-2 border rounded-xl" value={orgName} onChange={e => setOrgName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input type="text" className="w-full p-2 border rounded-xl" value={orgCity} onChange={e => setOrgCity(e.target.value)} />
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
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? 'Submitting...' : 'Complete Registration'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
