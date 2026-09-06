import { useEffect, useMemo, useState } from 'react';
import { getHospitalsBySlugs } from '../lib/data/hospitalRepository';

export function useHospitalsBySlugs(slugs, { mode = 'canonical' } = {}) {
  const key = useMemo(() => [...new Set((slugs || []).filter(Boolean))].join('|'), [slugs]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(Boolean(key));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!key) {
      setHospitals([]);
      setLoading(false);
      setError(null);
      return undefined;
    }
    setLoading(true);
    setError(null);
    getHospitalsBySlugs(key.split('|'), { mode })
      .then(data => { if (active) setHospitals(data); })
      .catch(nextError => {
        console.error('Error loading hospital records:', nextError);
        if (active) setError(nextError);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key, mode]);

  return { hospitals, loading, error };
}
