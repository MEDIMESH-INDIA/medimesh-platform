import { useState, useEffect } from 'react';
import { ShieldCheck, User, Heart, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';
import AppPageContainer from '../../components/layout/AppPageContainer';
import PageHeader from '../../components/common/PageHeader';
import FrostedPanel from '../../components/common/FrostedPanel';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();

  // Personal fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // Medical profile fields
  const [bloodGroup, setBloodGroup] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  // Emergency contact fields
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [loadingMedical, setLoadingMedical] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sync personal info from auth profile
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setDisplayName(profile.display_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
    }
  }, [profile]);

  // Load medical profile & emergency contacts for patient role
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    async function loadPatientDetails() {
      setLoadingMedical(true);
      try {
        const [medRes, emRes] = await Promise.all([
          supabase.from('patient_medical_profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('patient_emergency_contacts').select('*').eq('patient_id', user.id).maybeSingle(),
        ]);

        if (mounted) {
          if (medRes.data) {
            setBloodGroup(medRes.data.blood_group || '');
            setDateOfBirth(medRes.data.date_of_birth || '');
            setGender(medRes.data.gender || '');
            setAllergies(medRes.data.allergies || '');
            setChronicConditions(medRes.data.chronic_conditions || '');
          }
          if (emRes.data) {
            setEmergencyName(emRes.data.contact_name || '');
            setEmergencyRelationship(emRes.data.relationship || '');
            setEmergencyPhone(emRes.data.phone || '');
          }
        }
      } catch (err) {
        console.error('Failed to load patient records:', err);
      } finally {
        if (mounted) setLoadingMedical(false);
      }
    }

    loadPatientDetails();
    return () => { mounted = false; };
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      // 1. Update Profile (strictly avoiding protected columns like role, id, verification_status)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          display_name: displayName.trim() || null,
          phone: phone.trim() || null,
          city: city.trim() || null,
          country: country.trim() || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Upsert Medical Profile if patient
      if (profile?.role === 'patient') {
        const { error: medError } = await supabase
          .from('patient_medical_profiles')
          .upsert({
            id: user.id,
            blood_group: bloodGroup || null,
            date_of_birth: dateOfBirth || null,
            gender: gender || null,
            allergies: allergies.trim() || null,
            chronic_conditions: chronicConditions.trim() || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (medError) throw medError;

        // 3. Upsert Emergency Contact if details given
        if (emergencyName.trim() || emergencyPhone.trim()) {
          const { error: emError } = await supabase
            .from('patient_emergency_contacts')
            .upsert({
              patient_id: user.id,
              contact_name: emergencyName.trim() || 'Emergency Contact',
              relationship: emergencyRelationship.trim() || null,
              phone: emergencyPhone.trim() || '',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'patient_id' });

          if (emError) throw emError;
        }
      }

      await refreshProfile();
      setMessage('Profile and health settings saved successfully.');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('An error occurred while updating your profile. Please check your network and try again.');
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Recent';

  return (
    <AppPageContainer>
      <div className="space-y-7">
        <PageHeader
          eyebrow="Account & Health"
          title="Profile Management"
          description="View and manage the personal and health information you choose to maintain with MEDIMESH."
        />

        {/* Identity Overview Strip */}
        <FrostedPanel className="rounded-[20px] p-5 sm:p-6 border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-serif text-xl font-bold">
              {displayName ? displayName.charAt(0).toUpperCase() : (profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : 'M')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-semibold text-foreground">{displayName || 'Anonymous User'}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {profile?.role || 'Patient'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{profile?.email || user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-md border border-border/60">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Verified Account
            </span>
            <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-md border border-border/60">
              Member since {memberSince}
            </span>
          </div>
        </FrostedPanel>

        <form onSubmit={handleUpdate} className="space-y-8">
          {message && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm flex items-center gap-2" role="alert">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Personal Details */}
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
              <User className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold text-foreground">Personal Information</h2>
                <p className="text-xs text-muted-foreground">Basic contact and identity information.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                id="profile-display-name"
                label="Display name"
                type="text"
                required
                placeholder="How your name appears across the app"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
              <FormField
                id="profile-email"
                label="Account Email (Read-only)"
                type="email"
                value={profile?.email || user?.email || ''}
                disabled
                helpText="Your email address is managed via your sign-in provider."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                id="profile-first-name"
                label="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <FormField
                id="profile-last-name"
                label="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <FormField
                id="profile-phone"
                label="Contact phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <FormField
                id="profile-city"
                label="City"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
              <FormField
                id="profile-country"
                label="Country"
                placeholder="India"
                value={country}
                onChange={e => setCountry(e.target.value)}
              />
            </div>
          </FrostedPanel>

          {/* Section 2: Health Profile (for patients) */}
          {profile?.role === 'patient' && (
            <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Health Profile (Optional)</h2>
                    <p className="text-xs text-muted-foreground">Self-reported medical facts for emergency and discovery context.</p>
                  </div>
                </div>
                {loadingMedical && <span className="text-xs text-muted-foreground animate-pulse">Loading records...</span>}
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <FormField
                  id="profile-blood-group"
                  label="Blood Group"
                  as="select"
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </FormField>

                <FormField
                  id="profile-dob"
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                />

                <FormField
                  id="profile-gender"
                  label="Gender"
                  as="select"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </FormField>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  id="profile-allergies"
                  label="Known Allergies"
                  placeholder="e.g. Penicillin, Peanuts (or None)"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  helpText="List any severe medicinal or food allergies."
                />
                <FormField
                  id="profile-chronic"
                  label="Chronic Conditions"
                  placeholder="e.g. Hypertension, Asthma (or None)"
                  value={chronicConditions}
                  onChange={e => setChronicConditions(e.target.value)}
                  helpText="Health conditions that may be relevant during emergency care."
                />
              </div>
            </FrostedPanel>
          )}

          {/* Section 3: Emergency Contact (for patients) */}
          {profile?.role === 'patient' && (
            <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Emergency Contact (Optional)</h2>
                  <p className="text-xs text-muted-foreground">A trusted individual who can be contacted if needed.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                <FormField
                  id="profile-em-name"
                  label="Contact person name"
                  placeholder="e.g. Sunita Sharma"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                />
                <FormField
                  id="profile-em-rel"
                  label="Relationship"
                  placeholder="e.g. Spouse, Parent, Sibling"
                  value={emergencyRelationship}
                  onChange={e => setEmergencyRelationship(e.target.value)}
                />
                <FormField
                  id="profile-em-phone"
                  label="Contact phone"
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                />
              </div>
            </FrostedPanel>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Changes are saved securely to your personal account.
            </p>
            <Button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5"
            >
              {saving ? 'Saving changes...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </AppPageContainer>
  );
}
