import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, 
  Heart, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  Image, 
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import FrostedPanel from '../common/FrostedPanel';
import FormField from '../common/FormField';
import Button from '../common/Button';
import UserAvatar from '../common/UserAvatar';
import { uploadAvatarFile, validateAvatarFile } from '../../lib/profile/avatarService';
import { calculateProfileCompleteness } from '../../lib/profile/profileCompleteness';

const AVATAR_PRESETS = [
  { label: 'Teal Minimal', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80' },
  { label: 'Clean Portrait', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80' },
  { label: 'Calm Studio', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80' },
  { label: 'Editorial Natural', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80' },
];

export default function PatientProfileEditor({
  profile,
  user,
  refreshProfile,
  onSaveSuccess,
}) {
  // Personal fields
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

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
  const [emergencyContactId, setEmergencyContactId] = useState(null);

  // Status & recovery states
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsLoadError, setRecordsLoadError] = useState(null);
  const [healthRecordsLoaded, setHealthRecordsLoaded] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const fileInputRef = useRef(null);

  // Sync personal fields when auth profile updates
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setDisplayName(profile.display_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Load medical profile & emergency contacts for patient
  const loadPatientDetails = useCallback(async () => {
    if (!user?.id) return;
    setLoadingRecords(true);
    setRecordsLoadError(null);

    try {
      const [medRes, emRes] = await Promise.all([
        supabase.from('patient_medical_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('patient_emergency_contacts').select('*').eq('patient_id', user.id).maybeSingle(),
      ]);

      if (medRes.error) {
        console.warn('Failed to load patient medical profile:', medRes.error);
        setRecordsLoadError('We could not load your existing health records from the database. Please retry to load your saved data.');
        setHealthRecordsLoaded(false);
      } else {
        setHealthRecordsLoaded(true);
        if (medRes.data) {
          setBloodGroup(medRes.data.blood_group || '');
          setDateOfBirth(medRes.data.date_of_birth || '');
          setGender(medRes.data.gender || '');
          setAllergies(medRes.data.allergies || '');
          setChronicConditions(medRes.data.chronic_conditions || '');
        }
      }

      if (emRes.error) {
        console.warn('Failed to load emergency contact:', emRes.error);
        if (!medRes.error) {
          setRecordsLoadError('We could not load your existing emergency contact details. Please retry before editing.');
        }
      } else if (emRes.data) {
        setEmergencyContactId(emRes.data.id || null);
        setEmergencyName(emRes.data.contact_name || '');
        setEmergencyRelationship(emRes.data.relationship || '');
        setEmergencyPhone(emRes.data.phone || '');
      } else {
        setEmergencyContactId(null);
      }
    } catch (err) {
      console.error('Failed to load patient records:', err);
      setRecordsLoadError('Unable to connect to the healthcare catalog to load records. Check your connection.');
      setHealthRecordsLoaded(false);
    } finally {
      setLoadingRecords(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPatientDetails();
  }, [loadPatientDetails]);

  // Current live completeness calculation based on state
  const liveCompleteness = calculateProfileCompleteness({
    display_name: displayName,
    phone,
    city,
    country,
  });

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setError('');
    setMessage('');

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadAvatarFile(user.id, file);
      if (res.error) {
        setError(`Avatar upload failed: ${res.error}. You can also provide an image URL directly or pick a preset.`);
      } else if (res.publicUrl) {
        setAvatarUrl(res.publicUrl);
        setMessage('Avatar uploaded successfully. Remember to click "Save Profile Settings" to finalize.');
      }
    } catch (err) {
      console.error('Avatar upload exception:', err);
      setError('Could not upload avatar. Please check your network and try again.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyManualUrl = () => {
    const cleanUrl = manualUrl.trim();
    if (!cleanUrl) return;

    try {
      const parsed = new URL(cleanUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setError('Please provide a valid HTTP or HTTPS image URL.');
        return;
      }
    } catch {
      setError('Invalid URL format. Please provide a valid web image link.');
      return;
    }

    setError('');
    setAvatarUrl(cleanUrl);
    setManualUrl('');
    setShowUrlInput(false);
    setMessage('Profile picture updated from URL. Click "Save Profile Settings" to apply changes.');
  };

  const handleSelectPreset = (presetUrl) => {
    setAvatarUrl(presetUrl);
    setMessage('Preset avatar selected. Click "Save Profile Settings" to apply changes.');
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setMessage('Profile picture removed. Click "Save Profile Settings" to apply changes.');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setMessage('');

    // Pre-flight client validations
    if (!displayName.trim()) {
      setError('Display name is required.');
      setSaving(false);
      return;
    }

    const hasEmergencyName = Boolean(emergencyName.trim());
    const hasEmergencyPhone = Boolean(emergencyPhone.trim());
    if ((hasEmergencyName && !hasEmergencyPhone) || (!hasEmergencyName && hasEmergencyPhone)) {
      setError('Emergency contact requires both a contact person name and a phone number.');
      setSaving(false);
      return;
    }

    if (recordsLoadError && !healthRecordsLoaded && profile?.role === 'patient') {
      setError('Health records could not be verified from the server. Please click "Retry loading records" before saving to prevent overwriting existing data.');
      setSaving(false);
      return;
    }

    const sectionErrors = [];
    const sectionSuccesses = [];

    // SECTION 1: Personal & Account Information (profiles)
    try {
      const profilePayload = {
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        display_name: displayName.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      };

      const { data: updatedRows, error: profileError } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('id', user.id)
        .select('id, display_name, phone, city, country, avatar_url');

      if (profileError) {
        throw new Error(profileError.message || 'Personal profile update rejected.');
      }

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('Your profile row was not affected. Please verify account permissions.');
      }

      sectionSuccesses.push('Personal information');
    } catch (err) {
      console.error('Personal profile update failure:', err);
      sectionErrors.push({
        section: 'Personal information',
        message: 'Could not update personal details. Please check your account permissions.',
      });
    }

    // SECTION 2: Medical Profile (patient_medical_profiles)
    if (profile?.role === 'patient' && healthRecordsLoaded) {
      try {
        const medicalPayload = {
          id: user.id,
          blood_group: bloodGroup || null,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          allergies: allergies.trim() || null,
          chronic_conditions: chronicConditions.trim() || null,
          updated_at: new Date().toISOString(),
        };

        const { error: medError } = await supabase
          .from('patient_medical_profiles')
          .upsert(medicalPayload, { onConflict: 'id' });

        if (medError) {
          throw new Error(medError.message || 'Medical profile upsert rejected.');
        }

        sectionSuccesses.push('Health profile');
      } catch (err) {
        console.error('Health profile update failure:', err);
        sectionErrors.push({
          section: 'Health profile',
          message: 'Could not save optional health records.',
        });
      }
    }

    // SECTION 3: Emergency Contact (patient_emergency_contacts)
    if (profile?.role === 'patient') {
      try {
        if (hasEmergencyName && hasEmergencyPhone) {
          if (emergencyContactId) {
            const { error: emUpdateError } = await supabase
              .from('patient_emergency_contacts')
              .update({
                contact_name: emergencyName.trim(),
                relationship: emergencyRelationship.trim() || null,
                phone: emergencyPhone.trim(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', emergencyContactId)
              .eq('patient_id', user.id);

            if (emUpdateError) throw emUpdateError;
          } else {
            const { data: newEm, error: emInsertError } = await supabase
              .from('patient_emergency_contacts')
              .insert({
                patient_id: user.id,
                contact_name: emergencyName.trim(),
                relationship: emergencyRelationship.trim() || null,
                phone: emergencyPhone.trim(),
              })
              .select('id')
              .maybeSingle();

            if (emInsertError) throw emInsertError;
            if (newEm?.id) {
              setEmergencyContactId(newEm.id);
            }
          }
          sectionSuccesses.push('Emergency contact');
        } else if (!hasEmergencyName && !hasEmergencyPhone && emergencyContactId) {
          // Explicitly clear existing emergency contact row
          const { error: emDeleteError } = await supabase
            .from('patient_emergency_contacts')
            .delete()
            .eq('id', emergencyContactId)
            .eq('patient_id', user.id);

          if (emDeleteError) throw emDeleteError;
          setEmergencyContactId(null);
          sectionSuccesses.push('Emergency contact removed');
        }
      } catch (err) {
        console.error('Emergency contact update failure:', err);
        sectionErrors.push({
          section: 'Emergency contact',
          message: 'Could not update emergency contact details.',
        });
      }
    }

    // SECTION 4: Result Aggregation and Session Refresh
    try {
      if (sectionErrors.length === 0) {
        const refreshed = await refreshProfile();
        if (!refreshed) {
          setMessage('Profile settings saved successfully. (Session refresh is pending; reload if your header does not update.)');
        } else {
          setMessage('Profile and health settings saved successfully.');
        }
        onSaveSuccess?.();
      } else if (sectionSuccesses.length > 0) {
        const succeededList = sectionSuccesses.join(', ');
        const failedList = sectionErrors.map(e => e.section).join(', ');
        setError(`Partial save: ${succeededList} saved successfully, but ${failedList} could not be updated. Your unsaved changes have been kept in the form.`);
      } else {
        setError('Unable to save profile changes. Your edits have been preserved in the form. Please check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm" role="alert">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm" role="alert">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Profile Completeness Card */}
      <FrostedPanel className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {liveCompleteness.percentage}%
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">Account Completeness</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {liveCompleteness.isComplete
                ? 'All core account fields are set. Optional health records can be enriched below.'
                : `Complete core profile by adding: ${liveCompleteness.missingFields.join(', ')}`}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shrink-0">
          {liveCompleteness.completedCount} of {liveCompleteness.totalCount} core fields set
        </span>
      </FrostedPanel>

      {/* Avatar Management Card */}
      <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <Image className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Profile Picture</h2>
              <p className="text-xs text-muted-foreground">Personalize your healthcare account with a verified photo or avatar.</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Canonical Avatar
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <UserAvatar
            src={avatarUrl}
            alt={displayName || 'User preview'}
            name={displayName || user?.email}
            size="xl"
            className="ring-4 ring-primary/10 border-2 border-white shadow-md"
          />

          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarFileChange}
                className="hidden"
                id="avatar-file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-semibold gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Provide Image URL
              </Button>

              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-muted-foreground hover:text-red-700 hover:bg-red-50 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              )}
            </div>

            {showUrlInput && (
              <div className="flex items-center gap-2 pt-1 max-w-md">
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyManualUrl}
                  className="text-xs px-3 py-1.5"
                >
                  Set URL
                </Button>
              </div>
            )}

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                Or choose a curated profile preset:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/70 bg-surface text-[11px] font-semibold text-foreground hover:border-primary/40 hover:bg-white transition-all"
                  >
                    <img src={preset.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Max file size 2MB (JPEG, PNG, WebP, GIF). Images are stored securely and never reveal private health details.
            </p>
          </div>
        </div>
      </FrostedPanel>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Information */}
        <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <User className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Personal & Account Information</h2>
              <p className="text-xs text-muted-foreground">Your basic identity and sign-in credentials.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <FormField
              id="profile-display-name"
              label="Display name"
              type="text"
              required
              placeholder="How your name appears across MEDIMESH"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
            <FormField
              id="profile-email"
              label="Account Email (Read-only)"
              type="email"
              value={profile?.email || user?.email || ''}
              disabled
              helpText="Your email address is managed securely via your authentication provider."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <FormField
              id="profile-first-name"
              label="First name"
              placeholder="Your given name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
            <FormField
              id="profile-last-name"
              label="Last name"
              placeholder="Your family name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
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
              placeholder="e.g. Navi Mumbai"
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

        {/* Section 2: Health Profile (Optional for patients) */}
        {profile?.role === 'patient' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-foreground">Health Profile</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Self-reported medical facts for emergency and discovery context.</p>
                </div>
              </div>
              {loadingRecords && <span className="text-xs text-muted-foreground animate-pulse">Loading records...</span>}
            </div>

            {recordsLoadError && (
              <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs flex items-center justify-between gap-3" role="alert">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{recordsLoadError}</span>
                </span>
                <button
                  type="button"
                  onClick={loadPatientDetails}
                  disabled={loadingRecords}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 hover:bg-amber-50 shadow-sm shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingRecords ? 'animate-spin' : ''}`} />
                  Retry
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-5">
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

            <div className="grid md:grid-cols-2 gap-5">
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

        {/* Section 3: Emergency Contact (Optional for patients) */}
        {profile?.role === 'patient' && (
          <FrostedPanel variant="elevated" className="rounded-[20px] p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
              <Phone className="w-4 h-4 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">Emergency Contact</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">A trusted individual who can be notified in an emergency.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
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

        {/* Form Submission Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Changes are saved securely to your personal account with Row-Level Security.
          </p>
          <Button
            type="submit"
            disabled={saving || uploadingAvatar}
            className="w-full sm:w-auto px-7 py-3 text-sm font-bold shadow-sm"
          >
            {saving ? 'Saving changes...' : 'Save Profile Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
