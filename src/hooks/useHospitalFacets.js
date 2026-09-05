import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { demoHospitals } from '../data/sihDemoHospitals';

export function useHospitalFacets({ mode = 'canonical' }) {
  const [facets, setFacets] = useState({
    locations: [],
    specialties: [],
    facilities: [],
    types: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchFacets() {
      try {
        setLoading(true);
        setError(null);

        if (mode === 'demo') {
          const locations = [...new Set(demoHospitals.map(h => h.location))].filter(Boolean).sort();
          const types = [...new Set(demoHospitals.map(h => h.type))].filter(Boolean).sort();
          const specialties = [...new Set(demoHospitals.flatMap(h => h.specialties || []))].filter(Boolean).sort();
          const facilities = [...new Set(demoHospitals.flatMap(h => h.facilities || []))].filter(Boolean).sort();
          
          if (mounted) {
            setFacets({ locations, types, specialties, facilities });
          }
          return;
        }

        const queries = await Promise.all([
          supabase.from('hospitals').select('locality, city, hospital_type').eq('publication_status', 'published'),
          supabase.from('specialties').select('name').eq('active', true).order('name'),
          supabase.from('facilities').select('name').eq('active', true).order('name')
        ]);
        
        const hospitalsData = queries[0].data || [];
        const specList = queries[1].data || [];
        const facList = queries[2].data || [];

        const locations = [...new Set(
          hospitalsData
            .map(h => h.locality || h.city)
            .filter(Boolean)
        )].sort();

        const types = [...new Set(
          hospitalsData
            .map(h => h.hospital_type)
            .filter(Boolean)
        )].sort();

        const specialties = specList.map(s => s.name);
        const facilities = facList.map(f => f.name);

        if (mounted) {
          setFacets({ locations, types, specialties, facilities });
        }
      } catch (err) {
        console.error('Error fetching facets:', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFacets();
    return () => { mounted = false; };
  }, [mode]);

  return { facets, loading, error };
}
