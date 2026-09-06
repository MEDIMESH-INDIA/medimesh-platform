import { useState, useEffect } from 'react';
import { getDoctorBySlug } from '../lib/data/doctorRepository';

export function useDoctorDetail(slug) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let mounted = true;
    async function loadDoctor() {
      setLoading(true);
      setError(null);
      try {
        const doc = await getDoctorBySlug(slug);
        if (mounted) {
          setDoctor(doc);
        }
      } catch (err) {
        console.error('Error fetching doctor detail:', err);
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDoctor();
    return () => { mounted = false; };
  }, [slug]);

  return { doctor, loading, error };
}
