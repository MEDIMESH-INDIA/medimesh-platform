import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { demoHospitals } from '../data/sihDemoHospitals';

const PAGE_SIZE = 24;

import { normalizeHospital, normalizeDemoHospital } from "../lib/data/hospitalRepository";
// Normalizer according to spec

export function useHospitalSearch({ mode = 'canonical', filters = {}, sort = 'name_asc' }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchResults = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = isLoadMore ? offset : 0;

      if (mode === 'demo') {
        let results = [...demoHospitals];

        // Search text
        if (filters.q) {
          const q = filters.q.toLowerCase().trim();
          results = results.filter(h => 
            h.name?.toLowerCase().includes(q) ||
            h.location?.toLowerCase().includes(q)
          );
        }

        // Exact matches
        if (filters.location) {
          results = results.filter(h => h.location === filters.location);
        }
        if (filters.type) {
          results = results.filter(h => h.type === filters.type);
        }
        if (filters.specialty) {
          results = results.filter(h => h.specialties?.includes(filters.specialty));
        }

        if (sort === 'name_asc') {
          results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        const paginated = results.slice(currentOffset, currentOffset + PAGE_SIZE);
        const normalized = paginated.map(normalizeDemoHospital);

        if (isLoadMore) {
          setHospitals(prev => [...prev, ...normalized]);
        } else {
          setHospitals(normalized);
        }
        
        setHasMore(currentOffset + PAGE_SIZE < results.length);
        setOffset(currentOffset + PAGE_SIZE);
        return;
      }

      // Canonical mode
      let query = supabase
        .from('hospitals')
        .select(`
          id, slug, name, locality, city, state, hospital_type, 
          total_beds, icu_beds, emergency_department, ambulance_available,
          hospital_specialties!inner( specialties!inner(name) ),
          hospital_facilities( facilities(name) ),
          hospital_evidence( checked_at, review_status, data_sources(name, source_type) )
        `, { count: 'exact' })
        .eq('publication_status', 'published');

      // Note on inner joins: PostgREST requires !inner to filter parent rows based on children.
      // We only use !inner if we are actually filtering by that child table, otherwise we use left join.
      
      // Let's dynamically build the select string based on whether we filter by specialty.
      let selectString = `
        id, slug, name, locality, city, state, hospital_type, 
        total_beds, icu_beds, emergency_department, ambulance_available,
        hospital_facilities( facilities(name) ),
        hospital_evidence( checked_at, review_status, data_sources(name, source_type) )
      `;

      if (filters.specialty) {
        selectString += `, hospital_specialties!inner( specialties!inner(name) )`;
      } else {
        selectString += `, hospital_specialties( specialties(name) )`;
      }

      query = supabase
        .from('hospitals')
        .select(selectString)
        .eq('publication_status', 'published');

      if (filters.q) {
        // Simple search on name, locality, city
        const q = filters.q;
        query = query.or(`name.ilike.%${q}%,locality.ilike.%${q}%,city.ilike.%${q}%`);
      }

      if (filters.location) {
        // Can match locality or city for now
        query = query.or(`locality.eq."${filters.location}",city.eq."${filters.location}"`);
      }

      if (filters.type) {
        query = query.eq('hospital_type', filters.type);
      }

      if (filters.specialty) {
        query = query.eq('hospital_specialties.specialties.name', filters.specialty);
      }

      if (sort === 'name_asc') {
        query = query.order('name', { ascending: true });
      }

      query = query.range(currentOffset, currentOffset + PAGE_SIZE - 1);

      const { data, error: sbError } = await query;
      
      if (sbError) {
        throw sbError;
      }

      const normalized = (data || []).map(h => normalizeHospital(h, 'canonical'));

      if (isLoadMore) {
        setHospitals(prev => [...prev, ...normalized]);
      } else {
        setHospitals(normalized);
      }

      setHasMore((data || []).length === PAGE_SIZE);
      setOffset(currentOffset + PAGE_SIZE);
      
    } catch (err) {
      console.error('Error in useHospitalSearch:', err);
      setError(err);
      if (!isLoadMore) {
        setHospitals([]);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, filters.q, filters.location, filters.type, filters.specialty, sort, offset]);

  // Initial fetch and filter changes
  useEffect(() => {
    setOffset(0);
    // When filters change, we don't want to load more, we want to reset
    // This effect handles resetting and fetching page 0.
    // The actual fetch is inside a separate useEffect to ensure offset state is clean.
  }, [mode, filters.q, filters.location, filters.type, filters.specialty, sort]);

  useEffect(() => {
    if (offset === 0) {
      fetchResults(false);
    }
  }, [offset, fetchResults]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchResults(true);
    }
  };

  return { hospitals, loading, error, hasMore, loadMore };
}
