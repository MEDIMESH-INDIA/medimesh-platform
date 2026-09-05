import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function HospitalOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Hospital Identity
  const [hospitalType, setHospitalType] = useState('Private');
  const [regNumber, setRegNumber] = useState('');
  const [yearEst, setYearEst] = useState('');

  // Location & Capacity
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [totalBeds, setTotalBeds] = useState('');
  const [icuBeds, setIcuBeds] = useState('');
  const [emergency, setEmergency] = useState(false);

  // Services
  const [specialties, setSpecialties] = useState('');
  const [facilities, setFacilities] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!hospitalType || !address || !state) {
        throw new Error('Please fill all required fields before completing.');
      }

      // 1. Save Hospital Details
      const { error: dError } = await supabase
        .from('hospital_details')
        .insert([{
          id: user.id,
          hospital_type: hospitalType,
          registration_number: regNumber,
          year_established: parseInt(yearEst) || null,
          address,
          state,
          total_beds: parseInt(totalBeds) || 0,
          icu_beds: parseInt(icuBeds) || 0,
          emergency_department: emergency
        }]);
      if (dError) throw dError;

      // 2. Save Hospital Services
      const { error: sError } = await supabase
        .from('hospital_services')
        .insert([{
          id: user.id,
          specialties: JSON.stringify(specialties.split(',').map(s => s.trim()).filter(Boolean)),
          facilities: JSON.stringify(facilities.split(',').map(f => f.trim()).filter(Boolean))
        }]);
      if (sError) throw sError;

      // 3. Mark Onboarding as Complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      await refreshProfile();
      navigate('/hospital');
    } catch {
      setError('We could not save your organization information. Please review the required fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Hospital Registration</h1>
        <p className="text-muted-foreground">
          Register your healthcare institution to accept MEDIMESH patient requests.
        </p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['01 Identity', '02 Location & Capacity', '03 Services'].map((label, idx) => (
          <div 
            key={label}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              step === idx + 1 ? 'bg-foreground text-white' : 'bg-surface-elevated text-muted-foreground'
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

      <div className="rounded-[24px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,40,35,0.07)] backdrop-blur-xl">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Hospital Identity</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Hospital Type *</label>
                <select className="medimesh-field" value={hospitalType} onChange={e => setHospitalType(e.target.value)}>
                  <option value="Private">Private</option>
                  <option value="Government">Government</option>
                  <option value="Trust">Trust</option>
                  <option value="Multi-specialty">Multi-specialty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Number</label>
                <input type="text" className="medimesh-field" value={regNumber} onChange={e => setRegNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year Established</label>
                <input type="number" className="medimesh-field" value={yearEst} onChange={e => setYearEst(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Location & Capacity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input required type="text" className="medimesh-field" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">State/Region *</label>
                  <input required type="text" className="medimesh-field" value={state} onChange={e => setState(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Beds</label>
                  <input type="number" className="medimesh-field" value={totalBeds} onChange={e => setTotalBeds(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ICU Beds</label>
                  <input type="number" className="medimesh-field" value={icuBeds} onChange={e => setIcuBeds(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="em" checked={emergency} onChange={e => setEmergency(e.target.checked)} className="rounded" />
                <label htmlFor="em" className="text-sm font-medium">Has 24/7 Emergency Department</label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Services & Facilities</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Specialties (comma separated)</label>
                <input type="text" className="medimesh-field" value={specialties} onChange={e => setSpecialties(e.target.value)} placeholder="Cardiology, Neurology, Orthopedics" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facilities (comma separated)</label>
                <input type="text" className="medimesh-field" value={facilities} onChange={e => setFacilities(e.target.value)} placeholder="Blood Bank, Pharmacy, Ambulance" />
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
