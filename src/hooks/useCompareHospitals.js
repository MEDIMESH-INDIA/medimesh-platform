import { useEffect, useState } from 'react';
import { getHospitalsBySlugs } from '../lib/data/hospitalRepository';

export function useCompareHospitals(compareList) {
  const slugs = compareList.map(item => item.slug);
  const key = slugs.join('|');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(Boolean(slugs.length));
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
    getHospitalsBySlugs(key.split('|'))
      .then(data => { if (active) setHospitals(data); })
      .catch(nextError => {
        console.error('Error loading hospitals for comparison:', nextError);
        if (active) setError(nextError);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key]);

  return { hospitals, loading, error };
}
