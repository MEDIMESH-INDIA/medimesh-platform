import { useState, useEffect, useCallback, useRef } from 'react';
import { searchDoctors } from '../lib/data/doctorRepository';

export function useDoctorSearch({ filters = {}, sort = 'name_asc', pageSize = 12 } = {}) {
  const {
    q = '',
    city = '',
    locality = '',
    specialization = '',
    hospital = '',
    serviceArea = '',
    homeVisitsOnly = false,
  } = filters;

  const [doctors, setDoctors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const requestRef = useRef(0);

  const fetchDoctors = useCallback(async (offset = 0, append = false) => {
    const requestId = ++requestRef.current;
    try {
      setLoading(true);
      setError(null);
      const res = await searchDoctors({
        filters: { q, city, locality, specialization, hospital, serviceArea, homeVisitsOnly },
        sort,
        offset,
        pageSize,
      });

      if (requestId !== requestRef.current) return;

      setDoctors(prev => {
        if (!append) return res.doctors;
        const seen = new Set(prev.map(d => d.id || d.slug));
        const newDocs = res.doctors.filter(d => !seen.has(d.id || d.slug));
        return [...prev, ...newDocs];
      });
      setTotalCount(res.totalCount);
      setHasMore(res.hasMore);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Error fetching doctors:', err);
      setError(err);
      if (!append) setDoctors([]);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [q, city, locality, specialization, hospital, serviceArea, homeVisitsOnly, sort, pageSize]);

  useEffect(() => {
    setDoctors([]);
    setTotalCount(0);
    void fetchDoctors(0, false);
    return () => { requestRef.current += 1; };
  }, [fetchDoctors]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      void fetchDoctors(doctors.length, true);
    }
  }, [doctors.length, fetchDoctors, hasMore, loading]);

  const refetch = useCallback(() => {
    return fetchDoctors(0, false);
  }, [fetchDoctors]);

  return { doctors, totalCount, loading, error, hasMore, loadMore, refetch };
}
