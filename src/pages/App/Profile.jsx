import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';
import AppPageContainer from '../../components/layout/AppPageContainer';
import PageHeader from '../../components/common/PageHeader';
import FrostedPanel from '../../components/common/FrostedPanel';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          phone,
          city,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppPageContainer>
      <div className="max-w-[900px] space-y-8">
        <PageHeader eyebrow="Your account" title="Profile" description="Manage the account information you choose to share with MEDIMESH." />

        <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          {message && <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm">{message}</div>}
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>}
          
          <div className="grid md:grid-cols-2 gap-6">
            <FormField id="profile-first-name" label="First name" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={profile?.role === 'hospital'} />
            <FormField id="profile-last-name" label="Last name" value={lastName} onChange={e => setLastName(e.target.value)} disabled={profile?.role === 'hospital'} />
          </div>
          
          <FormField id="profile-display-name" label="Display name / organization name" type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} />

          <div className="grid md:grid-cols-2 gap-6">
            <FormField id="profile-phone" label="Contact phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            <FormField id="profile-city" label="City" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          
          <div className="pt-8 border-t border-border flex justify-end">
            <Button
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </FrostedPanel>
      </div>
    </AppPageContainer>
  );
}
