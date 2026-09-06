import { useEffect, useState } from 'react';
import { getHospitalBySlug } from '../lib/data/hospitalRepository';

export function useHospitalDetail(slug, { mode = 'canonical' } = {}) {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setHospital(null);
    getHospitalBySlug(slug, { mode })
      .then(result => { if (active) setHospital(result); })
      .catch(nextError => {
        console.error('Error fetching hospital detail:', nextError);
        if (active) setError(nextError);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode, slug]);

  return { hospital, loading, error, notFound: !loading && !error && !hospital };
}
