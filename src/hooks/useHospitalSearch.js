import { useCallback, useEffect, useRef, useState } from 'react';
import { searchHospitals } from '../lib/data/hospitalRepository';

export function useHospitalSearch({ mode = 'canonical', filters = {}, sort = 'name_asc', pageSize = 12 }) {
  const { q = '', location = '', type = '', specialty = '', facility = '' } = filters;
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const requestRef = useRef(0);

  const fetchResults = useCallback(async (offset = 0, append = false) => {
    const requestId = ++requestRef.current;
    try {
      setLoading(true);
      setError(null);
      const result = await searchHospitals({ mode, filters: { q, location, type, specialty, facility }, sort, offset, pageSize });
      if (requestId !== requestRef.current) return;
      setHospitals(previous => append ? [...previous, ...result.hospitals] : result.hospitals);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (nextError) {
      if (requestId !== requestRef.current) return;
      console.error('Error in useHospitalSearch:', nextError);
      setError(nextError);
      if (!append) setHospitals([]);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [mode, q, location, type, specialty, facility, sort, pageSize]);

  useEffect(() => {
    setHospitals([]);
    setTotalCount(null);
    void fetchResults(0, false);
    return () => { requestRef.current += 1; };
  }, [fetchResults]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) void fetchResults(hospitals.length, true);
  }, [fetchResults, hasMore, hospitals.length, loading]);

  return { hospitals, loading, error, hasMore, totalCount, loadMore };
}
