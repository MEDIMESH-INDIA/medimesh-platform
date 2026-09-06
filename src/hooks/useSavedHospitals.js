import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from './useAuth';

export function useSavedHospitals() {
  const { user } = useAuth();
  const [savedSlugs, setSavedSlugs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSaved = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('saved_hospitals')
        .select('hospital_slug');

      if (error) throw error;
      setSavedSlugs(new Set(data.map(d => d.hospital_slug)));
    } catch (err) {
      console.error('Error fetching saved hospitals:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = async (slug) => {
    if (!user) {
      return { requiresAuth: true };
    }
    const isCurrentlySaved = savedSlugs.has(slug);

    // Optimistic UI update
    setSavedSlugs(prev => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(slug);
      else next.add(slug);
      return next;
    });

    try {
      if (isCurrentlySaved) {
        const { error } = await supabase
          .from('saved_hospitals')
          .delete()
          .match({ patient_id: user.id, hospital_slug: slug });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_hospitals')
          .insert({ patient_id: user.id, hospital_slug: slug });
        // Ignore unique constraint violation (duplicate save)
        if (error && error.code !== '23505') throw error;
      }
      return { saved: !isCurrentlySaved };
    } catch (err) {
      console.error('Error toggling save state:', err);
      // Revert on failure
      setSavedSlugs(prev => {
        const next = new Set(prev);
        if (isCurrentlySaved) next.add(slug);
        else next.delete(slug);
        return next;
      });
      return { error: true };
    }
  };

  return { savedSlugs, loading, error, toggleSave, refreshSaved: fetchSaved };
}
