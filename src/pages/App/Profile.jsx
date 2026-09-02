import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase/client';
import PageTransition from '../../components/layout/PageTransition';

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
      setError(err.message || 'An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-6">
          {message && <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm">{message}</div>}
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground uppercase tracking-wider">First Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-surface/50 focus:bg-white" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={profile?.role === 'hospital'} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground uppercase tracking-wider">Last Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-surface/50 focus:bg-white" value={lastName} onChange={e => setLastName(e.target.value)} disabled={profile?.role === 'hospital'} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground uppercase tracking-wider">Display Name / Organization Name</label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-surface/50 focus:bg-white" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground uppercase tracking-wider">Phone</label>
              <input type="tel" className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-surface/50 focus:bg-white" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground uppercase tracking-wider">City</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-surface/50 focus:bg-white" value={city} onChange={e => setCity(e.target.value)} />
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
