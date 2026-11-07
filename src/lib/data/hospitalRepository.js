import { demoHospitals } from '../../data/sihDemoHospitals.js';
import { supabase } from '../supabase/client.js';
import { uniqueCanonicalStrings } from './filterUtils.js';
import { getVerifiedHospitalCoordinates } from '../maps/verifiedHospitalCoordinates.js';
import { COORDINATE_ORIGIN, evaluateCoordinateTrust } from '../maps/coordinateTrust.js';
import { scoreHospitalMatch } from './searchMatcher.js';

const BASE_SELECT = `
  id, slug, name, locality, city, district, state, country, hospital_type,
  address_line_1, address_line_2, pin_code, public_phone, public_email, website, year_established,
  latitude, longitude, google_place_id,
  total_beds, icu_beds, emergency_department, ambulance_available,
  hospital_evidence(checked_at, review_status, supported_scope, data_sources(name, source_type))
`;
const LEGACY_BASE_SELECT = BASE_SELECT.replace(', google_place_id', '');
const isMissingPlaceIdColumn = error => error?.code === '42703' || String(error?.message || '').includes('google_place_id');

const rowsFrom = value => Array.isArray(value) ? value.filter(Boolean) : [];
const compareNames = (a, b) => (a.name || '').localeCompare(b.name || '');

export function normalizeHospital(record, recordType = 'canonical') {
  const hospital = record ?? {};
  const override = getVerifiedHospitalCoordinates(hospital.id, hospital.slug);
  const evidenceRows = rowsFrom(hospital.hospital_evidence);
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
  if (evidenceRows.length > 0) {
    const evidence = [...evidenceRows].sort((a, b) => {
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

  const hasOverride = Boolean(override && override.latitude != null && override.longitude != null);
  const hasDbCoords = hospital.latitude != null || hospital.longitude != null;
  const origin = hasOverride
    ? COORDINATE_ORIGIN.OVERRIDE
    : (hasDbCoords ? COORDINATE_ORIGIN.DATABASE : COORDINATE_ORIGIN.NONE);

  const rawLat = hasOverride ? override.latitude : hospital.latitude ?? null;
  const rawLng = hasOverride ? override.longitude : hospital.longitude ?? null;
  const placeId = override?.placeId ?? hospital.google_place_id ?? null;

  const trust = evaluateCoordinateTrust({
    latitude: rawLat,
    longitude: rawLng,
    origin,
    evidenceRows,
  });

  return {
    id: hospital.id,
    slug: hospital.slug,
    name: hospital.name,
    location: {
      addressLine1: hospital.address_line_1,
      addressLine2: hospital.address_line_2,
      locality: hospital.locality,
      city: hospital.city,
      district: hospital.district,
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
    map: {
      latitude: rawLat,
      longitude: rawLng,
      placeId,
      status: trust.status,
      origin: trust.origin,
      trust,
    },
    imageUrl: hospital.image_url || hospital.imageUrl || hospital.image || hospital.photo || null,
    recordType,
  };
}

export function normalizeDemoHospital(hospital) {
  const trust = evaluateCoordinateTrust({
    latitude: null,
    longitude: null,
    origin: COORDINATE_ORIGIN.NONE,
    evidenceRows: [],
  });

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
    map: {
      latitude: null,
      longitude: null,
      placeId: null,
      status: trust.status,
      origin: trust.origin,
      trust,
    },
    imageUrl: hospital.imageUrl || hospital.image || null,
    recordType: 'demo',
  };
}

let cachedPublishedHospitals = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function fetchAllPublishedHospitals() {
  const now = Date.now();
  if (cachedPublishedHospitals && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedPublishedHospitals;
  }

  const execute = selectFields => supabase
    .from('hospitals')
    .select(`${selectFields}, hospital_specialties(specialties(name)), hospital_facilities(facilities(name)), hospital_services_catalog(services(name))`)
    .eq('publication_status', 'published');

  let response = await execute(BASE_SELECT);
  if (response.error && isMissingPlaceIdColumn(response.error)) {
    response = await execute(LEGACY_BASE_SELECT);
  }
  const { data, error } = response;
  if (error) {
    if (cachedPublishedHospitals) return cachedPublishedHospitals;
    throw error;
  }

  cachedPublishedHospitals = (data || []).map(record => normalizeHospital(record, 'canonical'));
  lastCacheTime = now;
  return cachedPublishedHospitals;
}

export async function searchHospitals({ mode = 'canonical', filters = {}, sort = 'name_asc', offset = 0, pageSize = 12 } = {}) {
  const searchQuery = (filters.q || '').trim();

  if (mode === 'demo') {
    let matches = demoHospitals.map(normalizeDemoHospital);
    if (searchQuery) {
      matches = matches
        .map(h => ({ ...h, _search: scoreHospitalMatch(h, searchQuery) }))
        .filter(h => h._search.matches);
    }
    if (filters.city) matches = matches.filter(h => h.location.locality === filters.city || h.location.city === filters.city);
    if (filters.type) matches = matches.filter(h => h.type === filters.type);
    if (filters.specialty) matches = matches.filter(h => h.specialties?.includes(filters.specialty));
    if (filters.facility) matches = matches.filter(h => h.facilities?.includes(filters.facility));

    matches.sort((a, b) => {
      if (searchQuery && sort === 'name_asc' && a._search && b._search && a._search.score !== b._search.score) {
        return b._search.score - a._search.score;
      }
      return sort === 'name_desc' ? compareNames(b, a) : compareNames(a, b);
    });

    const hospitals = matches.slice(offset, offset + pageSize);
    return { hospitals, totalCount: matches.length, hasMore: offset + hospitals.length < matches.length };
  }

  // Canonical mode with search query: use resilient multi-token, abbreviation, and fuzzy matching
  if (searchQuery) {
    const all = await fetchAllPublishedHospitals();
    let matches = all
      .map(h => ({ ...h, _search: scoreHospitalMatch(h, searchQuery) }))
      .filter(h => h._search.matches);

    if (filters.city) matches = matches.filter(h => h.location?.city === filters.city);
    if (filters.locality) matches = matches.filter(h => h.location?.locality === filters.locality);
    if (filters.type) matches = matches.filter(h => h.type === filters.type);
    if (filters.specialty) matches = matches.filter(h => h.specialties?.includes(filters.specialty));
    if (filters.facility) matches = matches.filter(h => h.facilities?.includes(filters.facility));

    matches.sort((a, b) => {
      if (sort === 'name_asc' && a._search && b._search && a._search.score !== b._search.score) {
        return b._search.score - a._search.score;
      }
      return sort === 'name_desc' ? compareNames(b, a) : compareNames(a, b);
    });

    const hospitals = matches.slice(offset, offset + pageSize);
    return { hospitals, totalCount: matches.length, hasMore: offset + hospitals.length < matches.length };
  }

  // Canonical mode without search query (dropdown filters and pagination)
  const specialtyRelation = filters.specialty
    ? 'hospital_specialties!inner(specialties!inner(name))'
    : 'hospital_specialties(specialties(name))';
  const facilityRelation = filters.facility
    ? 'hospital_facilities!inner(facilities!inner(name))'
    : 'hospital_facilities(facilities(name))';

  const execute = selectFields => {
    let query = supabase
      .from('hospitals')
      .select(`${selectFields}, ${specialtyRelation}, ${facilityRelation}, hospital_services_catalog(services(name))`, { count: 'exact' })
      .eq('publication_status', 'published');
    if (filters.city) query = query.eq('city', filters.city);
    if (filters.locality) query = query.eq('locality', filters.locality);
    if (filters.type) query = query.eq('hospital_type', filters.type);
    if (filters.specialty) query = query.eq('hospital_specialties.specialties.name', filters.specialty);
    if (filters.facility) query = query.eq('hospital_facilities.facilities.name', filters.facility);
    return query.order('name', { ascending: sort !== 'name_desc' }).range(offset, offset + pageSize - 1);
  };
  let response = await execute(BASE_SELECT);
  if (response.error && isMissingPlaceIdColumn(response.error)) response = await execute(LEGACY_BASE_SELECT);
  const { data, error, count } = response;
  if (error) throw error;

  const hospitals = (data || []).map(record => normalizeHospital(record, 'canonical'));
  const totalCount = count ?? hospitals.length;
  return { hospitals, totalCount, hasMore: offset + hospitals.length < totalCount };
}

const facetsCache = new Map();
const facetsInFlight = new Map();
const FACETS_CACHE_TTL_MS = 60 * 1000;
let facetsCacheGeneration = 0;
const facetsModeGeneration = new Map();

export function invalidateHospitalFacetsCache(options = {}) {
  const mode = typeof options === 'string' ? options : options?.mode;
  if (!mode) {
    facetsCache.clear();
    facetsInFlight.clear();
    facetsCacheGeneration += 1;
    facetsModeGeneration.clear();
    return;
  }
  facetsCache.delete(mode);
  facetsInFlight.delete(mode);
  facetsModeGeneration.set(mode, (facetsModeGeneration.get(mode) || 0) + 1);
}

export async function getHospitalFacets({ mode = 'canonical', bypassCache = false } = {}) {
  const cacheKey = mode || 'canonical';

  if (bypassCache) {
    facetsCache.delete(cacheKey);
  } else {
    const cached = facetsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < FACETS_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (!bypassCache && facetsInFlight.has(cacheKey)) {
    return facetsInFlight.get(cacheKey);
  }

  const reqGen = facetsCacheGeneration + ':' + (facetsModeGeneration.get(cacheKey) || 0);
  let fetchPromise;

  fetchPromise = (async () => {
    try {
      let result;
      if (mode === 'demo') {
        result = {
          cities: uniqueCanonicalStrings(demoHospitals.map(h => h.location)),
          localities: [],
          cityToLocalities: {},
          types: uniqueCanonicalStrings(demoHospitals.map(h => h.type)),
          specialties: uniqueCanonicalStrings(demoHospitals.flatMap(h => h.specialties || [])),
          facilities: uniqueCanonicalStrings(demoHospitals.flatMap(h => h.facilities || [])),
        };
      } else {
        const { data, error } = await supabase
          .from('hospitals')
          .select('city, locality, hospital_type, hospital_specialties(specialties(name)), hospital_facilities(facilities(name))')
          .eq('publication_status', 'published');
        if (error) throw error;
        const records = data || [];

        const rawLocalities = [];
        const cityToLocalitiesMap = {};
        records.forEach(h => {
          const city = h.city?.trim();
          const locality = h.locality?.trim();
          if (locality) rawLocalities.push(locality);
          if (city && locality) {
            if (!cityToLocalitiesMap[city]) cityToLocalitiesMap[city] = [];
            cityToLocalitiesMap[city].push(locality);
          }
        });

        const cityToLocalities = {};
        Object.keys(cityToLocalitiesMap).forEach(k => {
          cityToLocalities[k] = uniqueCanonicalStrings(cityToLocalitiesMap[k]);
        });

        result = {
          cities: uniqueCanonicalStrings(records.map(h => h.city)),
          localities: uniqueCanonicalStrings(rawLocalities),
          cityToLocalities,
          types: uniqueCanonicalStrings(records.map(h => h.hospital_type)),
          specialties: uniqueCanonicalStrings(records.flatMap(h => rowsFrom(h.hospital_specialties).map(item => item.specialties?.name))),
          facilities: uniqueCanonicalStrings(records.flatMap(h => rowsFrom(h.hospital_facilities).map(item => item.facilities?.name))),
        };
      }

      const currentGen = facetsCacheGeneration + ':' + (facetsModeGeneration.get(cacheKey) || 0);
      if (reqGen === currentGen) {
        facetsCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
      return result;
    } finally {
      if (facetsInFlight.get(cacheKey) === fetchPromise) {
        facetsInFlight.delete(cacheKey);
      }
    }
  })();

  facetsInFlight.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function getHospitalBySlug(slug, { mode = 'canonical' } = {}) {
  if (!slug) return null;
  if (mode === 'demo') {
    const hospital = demoHospitals.find(item => item.slug === slug);
    return hospital ? normalizeDemoHospital(hospital) : null;
  }

  const execute = selectFields => supabase
    .from('hospitals')
    .select(`${selectFields}, hospital_specialties(specialties(name)), hospital_facilities(facilities(name)), hospital_services_catalog(services(name))`)
    .eq('slug', slug)
    .eq('publication_status', 'published')
    .maybeSingle();
  let response = await execute(BASE_SELECT);
  if (response.error && isMissingPlaceIdColumn(response.error)) response = await execute(LEGACY_BASE_SELECT);
  const { data, error } = response;
  if (error) throw error;
  return data ? normalizeHospital(data, 'canonical') : null;
}

const hospitalSlugsInFlight = new Map();
const hospitalSlugsCache = new Map();
const SLUGS_CACHE_TTL_MS = 5000;
export const MAX_SLUGS_CACHE_SIZE = 50;

let hospitalSlugsCacheGeneration = 0;
const hospitalSlugsKeyGeneration = new Map();

function pruneExpiredSlugsCache(now = Date.now()) {
  for (const [key, entry] of hospitalSlugsCache.entries()) {
    if (!entry || now - entry.timestamp >= SLUGS_CACHE_TTL_MS) {
      hospitalSlugsCache.delete(key);
    }
  }
}

function setBoundedSlugsCache(key, value, now = Date.now()) {
  pruneExpiredSlugsCache(now);
  if (hospitalSlugsCache.has(key)) {
    hospitalSlugsCache.delete(key);
  } else if (hospitalSlugsCache.size >= MAX_SLUGS_CACHE_SIZE) {
    while (hospitalSlugsCache.size >= MAX_SLUGS_CACHE_SIZE) {
      const oldestKey = hospitalSlugsCache.keys().next().value;
      if (oldestKey === undefined) break;
      hospitalSlugsCache.delete(oldestKey);
    }
  }
  hospitalSlugsCache.set(key, value);
}

function getFromSlugsCache(key, now = Date.now()) {
  const cached = hospitalSlugsCache.get(key);
  if (!cached) return null;
  if (now - cached.timestamp >= SLUGS_CACHE_TTL_MS) {
    hospitalSlugsCache.delete(key);
    return null;
  }
  return cached;
}

export function invalidateHospitalSlugsCache(slugs, { mode = 'canonical' } = {}) {
  if (!slugs) {
    hospitalSlugsCache.clear();
    hospitalSlugsInFlight.clear();
    hospitalSlugsCacheGeneration += 1;
    hospitalSlugsKeyGeneration.clear();
    return;
  }
  const slugList = Array.isArray(slugs) ? slugs : [slugs];
  const uniqueSlugs = [...new Set(slugList.filter(Boolean))].sort();
  const cacheKey = JSON.stringify([mode, uniqueSlugs]);
  const slugSet = new Set(uniqueSlugs);

  hospitalSlugsCache.delete(cacheKey);
  hospitalSlugsInFlight.delete(cacheKey);
  hospitalSlugsKeyGeneration.set(cacheKey, (hospitalSlugsKeyGeneration.get(cacheKey) || 0) + 1);

  // Invalidate any compound cached combinations containing any of the invalidated slugs
  for (const k of hospitalSlugsCache.keys()) {
    try {
      const [kMode, kSlugs] = JSON.parse(k);
      if (kMode === mode && Array.isArray(kSlugs) && kSlugs.some(s => slugSet.has(s))) {
        hospitalSlugsCache.delete(k);
        hospitalSlugsKeyGeneration.set(k, (hospitalSlugsKeyGeneration.get(k) || 0) + 1);
      }
    } catch {
      // ignore non-json keys if any
    }
  }
  for (const k of hospitalSlugsInFlight.keys()) {
    try {
      const [kMode, kSlugs] = JSON.parse(k);
      if (kMode === mode && Array.isArray(kSlugs) && kSlugs.some(s => slugSet.has(s))) {
        hospitalSlugsInFlight.delete(k);
        hospitalSlugsKeyGeneration.set(k, (hospitalSlugsKeyGeneration.get(k) || 0) + 1);
      }
    } catch {
      // ignore
    }
  }
}

export function _getHospitalSlugsCacheStateForTesting() {
  return {
    cacheSize: hospitalSlugsCache.size,
    inFlightSize: hospitalSlugsInFlight.size,
    generation: hospitalSlugsCacheGeneration,
  };
}

export async function getHospitalsBySlugs(slugs, { mode = 'canonical', bypassCache = false } = {}) {
  const uniqueSlugs = [...new Set((slugs || []).filter(Boolean))];
  if (uniqueSlugs.length === 0) return [];
  if (mode === 'demo') {
    const bySlugDemo = new Map(
      demoHospitals
        .filter(item => uniqueSlugs.includes(item.slug))
        .map(normalizeDemoHospital)
        .map(h => [h.slug, h])
    );
    return uniqueSlugs.map(slug => bySlugDemo.get(slug)).filter(Boolean);
  }

  const sortedSlugs = [...uniqueSlugs].sort();
  const cacheKey = JSON.stringify([mode, sortedSlugs]);

  if (bypassCache) {
    hospitalSlugsCache.delete(cacheKey);
    hospitalSlugsInFlight.delete(cacheKey);
    hospitalSlugsKeyGeneration.set(cacheKey, (hospitalSlugsKeyGeneration.get(cacheKey) || 0) + 1);
  } else {
    const cached = getFromSlugsCache(cacheKey);
    if (cached) {
      return uniqueSlugs.map(slug => cached.bySlug.get(slug)).filter(Boolean);
    }
  }

  let mapPromise;
  if (!bypassCache && hospitalSlugsInFlight.has(cacheKey)) {
    mapPromise = hospitalSlugsInFlight.get(cacheKey);
  } else {
    const reqGen = hospitalSlugsCacheGeneration + ':' + (hospitalSlugsKeyGeneration.get(cacheKey) || 0);
    let fetchPromise;
    fetchPromise = (async () => {
      try {
        const execute = selectFields => supabase
          .from('hospitals')
          .select(`${selectFields}, hospital_specialties(specialties(name)), hospital_facilities(facilities(name)), hospital_services_catalog(services(name))`)
          .in('slug', uniqueSlugs)
          .eq('publication_status', 'published');
        let response = await execute(BASE_SELECT);
        if (response.error && isMissingPlaceIdColumn(response.error)) response = await execute(LEGACY_BASE_SELECT);
        const { data, error } = response;
        if (error) throw error;
        const bySlug = new Map((data || []).map(record => [record.slug, normalizeHospital(record, 'canonical')]));

        const currentGen = hospitalSlugsCacheGeneration + ':' + (hospitalSlugsKeyGeneration.get(cacheKey) || 0);
        if (reqGen === currentGen) {
          setBoundedSlugsCache(cacheKey, { bySlug, timestamp: Date.now() });
        }
        return bySlug;
      } finally {
        if (hospitalSlugsInFlight.get(cacheKey) === fetchPromise) {
          hospitalSlugsInFlight.delete(cacheKey);
        }
      }
    })();

    hospitalSlugsInFlight.set(cacheKey, fetchPromise);
    mapPromise = fetchPromise;
  }

  const bySlug = await mapPromise;
  return uniqueSlugs.map(slug => bySlug.get(slug)).filter(Boolean);
}

export async function getHospitalSuggestions({
  query = '',
  filters = {},
  limit = 6,
  mode = 'canonical',
} = {}) {
  const cleanQ = (query || '').trim();

  if (mode === 'demo') {
    let list = demoHospitals.map(normalizeDemoHospital);
    if (filters.city) list = list.filter(h => h.location.locality === filters.city || h.location.city === filters.city);

    const scored = list.map(h => ({
      item: h,
      match: scoreHospitalMatch(h, cleanQ),
    }));

    const filtered = cleanQ
      ? scored.filter(s => s.match.matches).sort((a, b) => b.match.score - a.match.score || compareNames(a.item, b.item))
      : scored;

    return filtered.slice(0, limit).map(({ item, match }) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      location: item.location.locality || 'Demo area',
      type: item.type,
      specialties: item.specialties,
      matchReason: match.matchReason || 'Demonstration catalog',
    }));
  }

  // Canonical mode from Supabase (with in-memory caching for instantaneous autocomplete response)
  try {
    const all = await fetchAllPublishedHospitals();
    let list = all;

    if (filters.city) {
      list = list.filter(h => h.location?.city === filters.city);
    }
    if (filters.locality) {
      list = list.filter(h => h.location?.locality === filters.locality);
    }

    const scored = list.map(record => ({
      record,
      match: scoreHospitalMatch(record, cleanQ),
    }));

    const filtered = cleanQ
      ? scored.filter(s => s.match.matches).sort((a, b) => b.match.score - a.match.score || compareNames(a.record, b.record))
      : scored;

    return filtered.slice(0, limit).map(({ record, match }) => {
      const locSummary = [record.location?.locality, record.location?.city].filter(Boolean).join(', ') || record.location?.state || 'Maharashtra';
      return {
        id: record.id,
        slug: record.slug,
        name: record.name,
        location: locSummary,
        type: record.type,
        specialties: record.specialties || [],
        matchReason: match.matchReason || 'Verified directory record',
      };
    });
  } catch (err) {
    console.warn('Error fetching hospital suggestions:', err);
    throw err;
  }
}
