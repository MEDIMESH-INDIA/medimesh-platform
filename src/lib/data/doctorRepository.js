import { starterDoctors } from '../../data/starterDoctors';
import { supabase } from '../supabase/client';

const rowsFrom = value => Array.isArray(value) ? value.filter(Boolean) : [];
const cleanSearch = value => String(value ?? '').replace(/[,().%*]/g, ' ').replace(/\s+/g, ' ').trim();
const compareNames = (a, b) => (a.name || '').localeCompare(b.name || '');

export function normalizeCanonicalDoctor(doc) {
  if (!doc) return null;
  const affiliations = rowsFrom(doc.doctor_affiliations_directory).map(item => ({
    id: item.id,
    hospitalName: item.hospitals?.name || 'Affiliated Hospital',
    hospitalSlug: item.hospitals?.slug || null,
    department: item.department || 'Department not specified',
    position: item.position || 'Consultant',
    isCurrent: item.is_current ?? true,

  }));

  const primaryAffiliation = affiliations[0];
  const specialization = doc.specialization || primaryAffiliation?.department || 'Medical Specialist';

  return {
    id: doc.id,
    slug: doc.slug,
    name: doc.full_name,
    qualifications: doc.qualifications_summary || null,
    medicalRegistrationNumber: doc.medical_registration_number || null,
    medicalCouncil: doc.medical_council || null,
    registrationYear: doc.registration_year || null,
    specialization,
    yearsOfExperience: doc.experience_years ?? null,
    location: {
      city: doc.city || null,
      locality: primaryAffiliation?.hospitals?.locality || doc.locality || null,
      state: doc.state || null,
    },
    affiliations,
    languages: Array.isArray(doc.languages_spoken) && doc.languages_spoken.length ? doc.languages_spoken : null,
    consultationModes: Array.isArray(doc.consultation_modes) && doc.consultation_modes.length ? doc.consultation_modes : null,
    summary: null,
    source: {
      name: doc.source_dataset || 'Directory Indexed',
      type: 'provider_verified',
      reviewStatus: doc.verification_status || 'unreviewed',
      checkedAt: doc.created_at || null,
    },
    recordType: 'canonical',
    homeVisit: {
      enabled: !!doc.offers_home_visits,
      contactPublic: !!doc.home_visit_contact_public,
      serviceAreas: Array.isArray(doc.home_visit_service_areas) ? doc.home_visit_service_areas : [],
      days: Array.isArray(doc.home_visit_days) ? doc.home_visit_days : [],
      startTime: doc.home_visit_start_time || null,
      endTime: doc.home_visit_end_time || null,
      fee: doc.home_visit_fee || null,
      note: doc.home_visit_note || null,
      professionalPhone: doc.professional_phone || null,
      whatsappNumber: doc.whatsapp_number || null,
    }
  };
}

// Explicit catalog mode configuration for internal demonstration
const USE_DEMO_FALLBACK = false;

export async function searchDoctors({ filters = {}, sort = 'name_asc', offset = 0, pageSize = 12 } = {}) {
  try {
    let query = supabase
      .from('doctors')
      .select(`
        id, slug, full_name, experience_years, specialization, locality,
        city, state, medical_registration_number, publication_status, verification_status, created_at,
        offers_home_visits, professional_phone, whatsapp_number,
        home_visit_contact_public, home_visit_service_areas, home_visit_days,
        home_visit_start_time, home_visit_end_time, home_visit_fee, home_visit_note,
        doctor_affiliations_directory(
          id, department, position, is_current,
          hospital_name, hospitals(id, slug, name, city, locality)
        )
      `, { count: 'exact' })
      .eq('publication_status', 'published');

    if (filters.q) {
      query = query.or(`full_name.ilike.%${filters.q}%,specialization.ilike.%${filters.q}%,locality.ilike.%${filters.q}%,city.ilike.%${filters.q}%`);
    }
    if (filters.location) {
      query = query.or(`locality.ilike.%${filters.location}%,city.ilike.%${filters.location}%`);
    }
    if (filters.specialization) {
      query = query.ilike('specialization', `%${filters.specialization}%`);
    }
    if (filters.homeVisitsOnly) {
      query = query.eq('offers_home_visits', true);
    }
    if (filters.serviceArea) {
      query = query.contains('home_visit_service_areas', [filters.serviceArea]);
    }

    // hospital filter is tricky because it's a joined table. We'll fetch all and filter in JS if hospital filter is present.
    // For simplicity, we can do it in JS since there's 50 doctors total right now. But proper way is using referenced table filters.
    // supabase allows: doctor_affiliations_directory!inner(hospital_name) but our select is complex.

    if (sort === 'name_desc') {
      query = query.order('full_name', { ascending: false });
    } else if (sort === 'experience_desc') {
      query = query.order('experience_years', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('full_name', { ascending: true });
    }

    if (!filters.hospital && !filters.language) {
      query = query.range(offset, offset + pageSize - 1);
    }

    const { data, count, error } = await query;
    let finalData = data;
    let finalCount = count;

    if (!error && (filters.hospital || filters.language)) {
      // In-memory filter for relations since PostgREST nested filtering is limited
      const hospQ = (filters.hospital || '').toLowerCase();
      finalData = data.filter(doc => {
        const hospMatch = !hospQ || doc.doctor_affiliations_directory?.some(a =>
          (a.hospital_name || '').toLowerCase().includes(hospQ) ||
          (a.hospitals?.name || '').toLowerCase().includes(hospQ)
        );
        return hospMatch;
      });
      finalCount = finalData.length;
      finalData = finalData.slice(offset, offset + pageSize);
    }

    if (error) {
      console.error('Supabase doctor query error details:', error);

      console.error('Supabase doctor query error:', error);
    } else if (Array.isArray(finalData)) {
      const canonical = finalData.map(normalizeCanonicalDoctor);
      return { doctors: canonical, totalCount: finalCount ?? canonical.length, hasMore: offset + canonical.length < (finalCount ?? canonical.length) };
    }
  } catch (err) {
    console.warn('Canonical doctors lookup error:', err?.message);
  }

  if (!USE_DEMO_FALLBACK) {
    return { doctors: [], totalCount: 0, hasMore: false };
  }

  // Fallback to indexed demonstration doctors
  const q = cleanSearch(filters.q).toLowerCase();
  const locationFilter = (filters.location || '').toLowerCase();
  const specFilter = (filters.specialization || '').toLowerCase();
  const hospitalFilter = (filters.hospital || '').toLowerCase();
  const languageFilter = (filters.language || '').toLowerCase();
  const serviceAreaFilter = (filters.serviceArea || '').toLowerCase();
  const homeVisitsOnly = !!filters.homeVisitsOnly;

  const filtered = starterDoctors.filter(doc => {
    if (homeVisitsOnly && !doc.homeVisit?.enabled) return false;

    const nameMatch = !q || doc.name.toLowerCase().includes(q) || doc.specialization.toLowerCase().includes(q) || (doc.homeVisit?.serviceAreas || []).some(a => a.toLowerCase().includes(q));
    const locMatch = !locationFilter || (doc.location.city || '').toLowerCase().includes(locationFilter) || (doc.location.locality || '').toLowerCase().includes(locationFilter);
    const specMatch = !specFilter || doc.specialization.toLowerCase().includes(specFilter);
    const hospMatch = !hospitalFilter || doc.affiliations.some(a => (a.hospitalName || '').toLowerCase().includes(hospitalFilter));
    const langMatch = !languageFilter || (doc.languages || []).some(l => l.toLowerCase().includes(languageFilter));
    const areaMatch = !serviceAreaFilter || (doc.homeVisit?.serviceAreas || []).some(a => a.toLowerCase().includes(serviceAreaFilter));

    return nameMatch && locMatch && specMatch && hospMatch && langMatch && areaMatch;
  });

  if (sort === 'name_desc') {
    filtered.sort((a, b) => compareNames(b, a));
  } else if (sort === 'experience_desc') {
    filtered.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
  } else {
    filtered.sort(compareNames);
  }

  const paged = filtered.slice(offset, offset + pageSize);
  return {
    doctors: paged,
    totalCount: filtered.length,
    hasMore: offset + paged.length < filtered.length,
  };
}

export async function getDoctorBySlug(slug) {
  if (!slug) return null;

  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        id, slug, full_name, experience_years, specialization, locality,
        city, state, medical_registration_number, medical_council, registration_year, source_dataset, publication_status, verification_status, created_at,
        offers_home_visits, professional_phone, whatsapp_number,
        home_visit_contact_public, home_visit_service_areas, home_visit_days,
        home_visit_start_time, home_visit_end_time, home_visit_fee, home_visit_note,
        doctor_affiliations_directory(
          id, department, position, is_current,
          hospital_name, hospitals(id, slug, name, city, locality)
        )
      `)
      .eq('slug', slug)
      .eq('publication_status', 'published')
      .maybeSingle();

    if (error) {
      console.error('Supabase doctor query error details:', error);

      console.error('Supabase getDoctorBySlug error:', error);
    } else if (data) {
      return normalizeCanonicalDoctor(data);
    }
  } catch (err) {
    console.warn('Canonical doctor lookup error:', err?.message);
  }

  if (!USE_DEMO_FALLBACK) return null;

  return starterDoctors.find(doc => doc.slug === slug) || null;
}

export async function getDoctorFacets() {
  if (!USE_DEMO_FALLBACK) {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('locality, city, specialization, home_visit_service_areas, doctor_affiliations_directory(hospital_name, hospitals(name))')
        .eq('publication_status', 'published');

      if (!error && data) {
        const locations = [...new Set(data.flatMap(d => [d.locality, d.city]).filter(Boolean))].sort();
        const specializations = [...new Set(data.map(d => d.specialization).filter(Boolean))].sort();
        const serviceAreas = [...new Set(data.flatMap(d => d.home_visit_service_areas || []).filter(Boolean))].sort();

        const hospitals = [...new Set(data.flatMap(d =>
          d.doctor_affiliations_directory?.map(a => a.hospital_name || a.hospitals?.name) || []
        ).filter(Boolean))].sort();

        return { locations, specializations, hospitals, languages: ['English', 'Hindi', 'Marathi'], serviceAreas };
      }
    } catch (err) {
      console.warn('Facets query error:', err);
    }
    return { locations: [], specializations: [], hospitals: [], languages: [], serviceAreas: [] };
  }

  const locations = [...new Set(starterDoctors.flatMap(d => [d.location.locality, d.location.city]).filter(Boolean))].sort();
  const specializations = [...new Set(starterDoctors.map(d => d.specialization).filter(Boolean))].sort();
  const hospitals = [...new Set(starterDoctors.flatMap(d => d.affiliations.map(a => a.hospitalName)).filter(Boolean))].sort();
  const languages = [...new Set(starterDoctors.flatMap(d => d.languages || []).filter(Boolean))].sort();
  const serviceAreas = [...new Set(starterDoctors.flatMap(d => d.homeVisit?.serviceAreas || []).filter(Boolean))].sort();

  return {
    locations,
    specializations,
    hospitals,
    languages,
    serviceAreas,
  };
}
