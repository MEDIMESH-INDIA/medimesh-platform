import { useEffect, useState } from 'react';
import { getHospitalFacets } from '../lib/data/hospitalRepository';

const EMPTY_FACETS = { locations: [], specialties: [], facilities: [], types: [] };

export function useHospitalFacets({ mode = 'canonical' } = {}) {
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getHospitalFacets({ mode })
      .then(nextFacets => { if (active) setFacets(nextFacets); })
      .catch(nextError => {
        console.error('Error fetching hospital facets:', nextError);
        if (active) setError(nextError);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode]);

  return { facets, loading, error };
}
