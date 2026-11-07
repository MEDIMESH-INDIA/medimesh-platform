import { useCallback, useEffect, useState } from 'react';
import { getHospitalsBySlugs } from '../lib/data/hospitalRepository';

export function useCompareHospitals(compareList, { mode = 'canonical' } = {}) {
  const slugs = compareList.map(item => item.slug);
  const key = slugs.join('|');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(Boolean(slugs.length));
  const [error, setError] = useState(null);
  const [fetchedKey, setFetchedKey] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken(prev => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;
    if (!key) {
      setHospitals([]);
      setLoading(false);
      setError(null);
      setFetchedKey('');
      return undefined;
    }
    setLoading(true);
    setError(null);
    getHospitalsBySlugs(key.split('|'), { mode, bypassCache: reloadToken > 0 })
      .then(data => {
        if (active) {
          setHospitals(data || []);
          setFetchedKey(key);
        }
      })
      .catch(nextError => {
        console.error('Error loading hospitals for comparison:', nextError);
        if (active) {
          setError(nextError);
          setFetchedKey(key);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [key, mode, reloadToken]);

  return { hospitals, loading, error, isReady: fetchedKey === key && !loading, reload };
}
