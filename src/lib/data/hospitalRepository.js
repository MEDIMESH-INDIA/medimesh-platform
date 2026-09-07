import { demoHospitals } from '../../data/sihDemoHospitals';
import { supabase } from '../supabase/client';

const BASE_SELECT = `
  id, slug, name, locality, city, state, country, hospital_type,
  address_line_1, address_line_2, pin_code, public_phone, public_email, website, year_established,
  total_beds, icu_beds, emergency_department, ambulance_available,
  hospital_evidence(checked_at, review_status, data_sources(name, source_type))
`;

const rowsFrom = value => Array.isArray(value) ? value.filter(Boolean) : [];
const cleanSearchValue = value => String(value ?? '').replace(/[,().%*]/g, ' ').replace(/\s+/g, ' ').trim();
const compareNames = (a, b) => (a.name || '').localeCompare(b.name || '');

export function normalizeHospital(record, recordType = 'canonical') {
  const hospital = record ?? {};
  const specialties = rowsFrom(hospital.hospital_specialties)
    .map(item => item.specialties?.name)
    .filter(name => typeof name === 'string');
  const facilities = rowsFrom(hospital.hospital_facilities)
    .map(item => item.facilities?.name)
    .filter(name => typeof name === 'string');
  const services = rowsFrom(hospital.hospital_services_catalog)
    .map(item => item.services?.name)
    .filter(name => typeof name === 'string');

  let provenance = null;
  if (rowsFrom(hospital.hospital_evidence).length > 0) {
    const evidence = rowsFrom(hospital.hospital_evidence).sort((a, b) => {
      const order = { manually_reviewed: 1, source_matched: 2, self_reported: 3, unreviewed: 4 };
      const rankDifference = (order[a.review_status] || 99) - (order[b.review_status] || 99);
      if (rankDifference !== 0) return rankDifference;
      const firstDate = a.checked_at ? new Date(a.checked_at).getTime() : 0;
      const secondDate = b.checked_at ? new Date(b.checked_at).getTime() : 0;
      return secondDate - firstDate;
    });
    const best = evidence[0];
    provenance = {
      sourceType: best.data_sources?.source_type || null,
      sourceName: best.data_sources?.name || null,
      reviewStatus: best.review_status || null,
      checkedAt: best.checked_at || null,
    };
  }

  return {
    id: hospital.id,
    slug: hospital.slug,
    name: hospital.name,
    location: {
      addressLine1: hospital.address_line_1,
      addressLine2: hospital.address_line_2,
      locality: hospital.locality,
      city: hospital.city,
      state: hospital.state,
      country: hospital.country,
      pinCode: hospital.pin_code,
    },
    type: hospital.hospital_type,
    specialties,
    facilities,
    services,
    metrics: {
      emergency: hospital.emergency_department ?? null,
      ambulance: hospital.ambulance_available ?? null,
      totalBeds: hospital.total_beds ?? null,
      icuBeds: hospital.icu_beds ?? null,
    },
    provenance,
    contact: {
      phone: hospital.public_phone,
      email: hospital.public_email,
      website: hospital.website,
    },
    yearEstablished: hospital.year_established ?? null,
    recordType,
  };
}

export function normalizeDemoHospital(hospital) {
  return {
    id: hospital.id || hospital.slug,
    slug: hospital.slug,
    name: hospital.name,
    location: { addressLine1: null, addressLine2: null, locality: hospital.location, city: null, state: null, country: null, pinCode: null },
    type: hospital.type,
    specialties: hospital.specialties || [],
    facilities: hospital.facilities || [],
    services: [],
    metrics: { emergency: null, ambulance: null, totalBeds: null, icuBeds: null },
    provenance: hospital.trustMetadata ? {
      sourceType: 'demonstration',
      sourceName: 'Demo Data',
      reviewStatus: 'demonstration',
      checkedAt: null,
    } : null,
    contact: { phone: null, email: null, website: null },
    yearEstablished: null,
    recordType: 'demo',
  };
}

export async function searchHospitals({ mode = 'canonical', filters = {}, sort = 'name_asc', offset = 0, pageSize = 12 } = {}) {
  if (mode === 'demo') {
    const search = cleanSearchValue(filters.q).toLowerCase();
    const matches = demoHospitals.filter(hospital => {
      const location = hospital.location?.toLowerCase() || '';
      return (!search || hospital.name?.toLowerCase().includes(search) || location.includes(search))
        && (!filters.location || hospital.location === filters.location)
        && (!filters.type || hospital.type === filters.type)
        && (!filters.specialty || hospital.specialties?.includes(filters.specialty))
        && (!filters.facility || hospital.facilities?.includes(filters.facility));
    });
    matches.sort((a, b) => sort === 'name_desc' ? compareNames(b, a) : compareNames(a, b));
    const hospitals = matches.slice(offset, offset + pageSize).map(normalizeDemoHospital);
    return { hospitals, totalCount: matches.length, hasMore: offset + hospitals.length < matches.length };
  }

  const specialtyRelation = filters.specialty
    ? 'hospital_specialties!inner(specialties!inner(name))'
    : 'hospital_specialties(specialties(name))';
  const facilityRelation = filters.facility
    ? 'hospital_facilities!inner(facilities!inner(name))'
    : 'hospital_facilities(facilities(name))';
  let query = supabase
    .from('hospitals')
    .select(`${BASE_SELECT}, ${specialtyRelation}, ${facilityRelation}, hospital_services_catalog(services(name))`, { count: 'exact' })
    .eq('publication_status', 'published');

  const search = cleanSearchValue(filters.q);
  if (search) query = query.or(`name.ilike.%${search}%,locality.ilike.%${search}%,city.ilike.%${search}%`);
  if (filters.location) query = query.or(`locality.eq.${filters.location},city.eq.${filters.location}`);
  if (filters.type) query = query.eq('hospital_type', filters.type);
  if (filters.specialty) query = query.eq('hospital_specialties.specialties.name', filters.specialty);
  if (filters.facility) query = query.eq('hospital_facilities.facilities.name', filters.facility);

  const { data, error, count } = await query
    .order('name', { ascending: sort !== 'name_desc' })
    .range(offset, offset + pageSize - 1);
  if (error) throw error;

  const hospitals = (data || []).map(record => normalizeHospital(record, 'canonical'));
  const totalCount = count ?? hospitals.length;
  return { hospitals, totalCount, hasMore: offset + hospitals.length < totalCount };
}

export async function getHospitalFacets({ mode = 'canonical' } = {}) {
  if (mode === 'demo') {
    return {
      locations: [...new Set(demoHospitals.map(h => h.location).filter(Boolean))].sort(),
      types: [...new Set(demoHospitals.map(h => h.type).filter(Boolean))].sort(),
      specialties: [...new Set(demoHospitals.flatMap(h => h.specialties || []))].sort(),
      facilities: [...new Set(demoHospitals.flatMap(h => h.facilities || []))].sort(),
    };
  }

  const { data, error } = await supabase
    .from('hospitals')
    .select('locality, city, hospital_type, hospital_specialties(specialties(name)), hospital_facilities(facilities(name))')
    .eq('publication_status', 'published');
  if (error) throw error;
  const records = data || [];
  return {
    locations: [...new Set(records.flatMap(h => [h.locality, h.city]).filter(Boolean))].sort(),
    types: [...new Set(records.map(h => h.hospital_type).filter(Boolean))].sort(),
    specialties: [...new Set(records.flatMap(h => rowsFrom(h.hospital_specialties).map(item => item.specialties?.name)).filter(Boolean))].sort(),
    facilities: [...new Set(records.flatMap(h => rowsFrom(h.hospital_facilities).map(item => item.facilities?.name)).filter(Boolean))].sort(),
  };
}

export async function getHospitalBySlug(slug, { mode = 'canonical' } = {}) {
  if (!slug) return null;
  if (mode === 'demo') {
    const hospital = demoHospitals.find(item => item.slug === slug);
    return hospital ? normalizeDemoHospital(hospital) : null;
  }

  const { data, error } = await supabase
    .from('hospitals')
    .select(`${BASE_SELECT}, hospital_specialties(specialties(name)), hospital_facilities(facilities(name)), hospital_services_catalog(services(name))`)
    .eq('slug', slug)
    .eq('publication_status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeHospital(data, 'canonical') : null;
}

export async function getHospitalsBySlugs(slugs, { mode = 'canonical' } = {}) {
  const uniqueSlugs = [...new Set((slugs || []).filter(Boolean))];
  if (uniqueSlugs.length === 0) return [];
  if (mode === 'demo') {
    return uniqueSlugs
      .map(slug => demoHospitals.find(item => item.slug === slug))
      .filter(Boolean)
      .map(normalizeDemoHospital);
  }

  const { data, error } = await supabase
    .from('hospitals')
    .select(`${BASE_SELECT}, hospital_specialties(specialties(name)), hospital_facilities(facilities(name)), hospital_services_catalog(services(name))`)
    .in('slug', uniqueSlugs)
    .eq('publication_status', 'published');
  if (error) throw error;
  const bySlug = new Map((data || []).map(record => [record.slug, normalizeHospital(record, 'canonical')]));
  return uniqueSlugs.map(slug => bySlug.get(slug)).filter(Boolean);
}
