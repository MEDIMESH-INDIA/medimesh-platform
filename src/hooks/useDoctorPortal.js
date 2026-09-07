import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from './useAuth';

export function useDoctorPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCanonicalProfile = useCallback(async () => {
    if (!user?.id) return null;
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('claimed_by_user_id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching canonical profile:', error);
      return null;
    }
    return data;
  }, [user]);

  const updateCanonicalProfile = async (canonicalId, updates) => {
    if (!user?.id || !canonicalId) return false;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', canonicalId)
        .eq('claimed_by_user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProfile = useCallback(async () => {
    if (!user?.id) return null;
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('doctor_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching doctor profile:', error);
      return null;
    }
    return data;
  }, [user]);

  const updateProfile = async (updates) => {
    if (!user?.id) return false;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .upsert({ doctor_id: user.id, ...updates })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getQualifications = useCallback(async () => {
    if (!user?.id) return [];
    const { data } = await supabase
      .from('doctor_qualifications')
      .select('*')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  }, [user]);

  const addQualification = async (qualification) => {
    if (!user?.id) return false;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('doctor_qualifications')
        .insert({ doctor_id: user.id, ...qualification })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteQualification = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('doctor_qualifications').delete().eq('id', id).eq('doctor_id', user.id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSpecializations = useCallback(async () => {
    if (!user?.id) return null;
    const { data } = await supabase
      .from('doctor_specializations')
      .select('*')
      .eq('doctor_id', user.id)
      .maybeSingle();
    return data;
  }, [user]);

  const updateSpecializations = async (updates) => {
    if (!user?.id) return false;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('doctor_specializations')
        .upsert({ doctor_id: user.id, ...updates })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAffiliations = useCallback(async () => {
    if (!user?.id) return [];
    const { data } = await supabase
      .from('doctor_affiliations')
      .select('*')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  }, [user]);

  const addAffiliation = async (affiliation) => {
    if (!user?.id) return false;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('doctor_affiliations')
        .insert({ doctor_id: user.id, ...affiliation })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAffiliation = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('doctor_affiliations').delete().eq('id', id).eq('doctor_id', user.id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getCanonicalProfile,
    updateCanonicalProfile,
    getProfile,
    updateProfile,
    getQualifications,
    addQualification,
    deleteQualification,
    getSpecializations,
    updateSpecializations,
    getAffiliations,
    addAffiliation,
    deleteAffiliation
  };
}