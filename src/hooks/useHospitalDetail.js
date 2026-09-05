import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { normalizeHospital, normalizeDemoHospital } from '../lib/data/hospitalRepository';
import { demoHospitals } from '../data/sihDemoHospitals';

export function useHospitalDetail(slug, { mode = 'canonical' } = {}) {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        if (mode === 'demo') {
          const found = demoHospitals.find(h => h.slug === slug);
          if (mounted) {
            setHospital(found ? normalizeDemoHospital(found) : null);
          }
          return;
        }

        const { data, error: sbError } = await supabase
          .from('hospitals')
          .select(`
            id, slug, name, locality, city, state, hospital_type, 
            total_beds, icu_beds, emergency_department, ambulance_available,
            hospital_specialties( specialties(name) ),
            hospital_facilities( facilities(name) ),
            hospital_evidence( checked_at, review_status, data_sources(name, source_type) )
          `)
          .eq('slug', slug)
          .eq('publication_status', 'published')
          .single();

        if (sbError) {
          throw sbError;
        }

        if (mounted) {
          setHospital(normalizeHospital(data, 'canonical'));
        }
      } catch (err) {
        console.error('Error fetching hospital detail:', err);
        if (mounted) {
          setError(err);
          setHospital(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      fetchDetail();
    }
    
    return () => { mounted = false; };
  }, [slug, mode]);

  return { hospital, loading, error };
}
