import { useState, useEffect, useCallback } from 'react';
import { searchDoctors } from '../lib/data/doctorRepository';

export function useDoctorSearch({ filters = {}, sort = 'name_asc', pageSize = 12 } = {}) {
  const [doctors, setDoctors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const filterKey = JSON.stringify(filters);

  const fetchDoctors = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentOffset = isLoadMore ? offset : 0;
      const res = await searchDoctors({ filters, sort, offset: currentOffset, pageSize });
      
      setDoctors(prev => isLoadMore ? [...prev, ...res.doctors] : res.doctors);
      setTotalCount(res.totalCount);
      setHasMore(res.hasMore);
      setOffset(currentOffset + res.doctors.length);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
    fetchDoctors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, sort]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchDoctors(true);
    }
  }, [loading, hasMore, fetchDoctors]);

  return { doctors, totalCount, loading, error, hasMore, loadMore };
}
