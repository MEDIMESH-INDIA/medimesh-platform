import { starterDoctors } from '../../data/starterDoctors';
import { supabase } from '../supabase/client';

const rowsFrom = value => Array.isArray(value) ? value.filter(Boolean) : [];
const cleanSearch = value => String(value ?? '').replace(/[,().%*]/g, ' ').replace(/\s+/g, ' ').trim();
const compareNames = (a, b) => (a.name || '').localeCompare(b.name || '');

export function normalizeCanonicalDoctor(doc) {
  if (!doc) return null;
  const affiliations = rowsFrom(doc.doctor_hospital_affiliations).map(item => ({
    id: item.id,
    hospitalName: item.hospitals?.name || 'Affiliated Hospital',
    hospitalSlug: item.hospitals?.slug || null,
    department: item.department || 'Department not specified',
    position: item.position || 'Consultant',
    isCurrent: item.is_current ?? true,
    verificationStatus: item.verification_status || 'pending',
  }));

  const primaryAffiliation = affiliations[0];
  const specialization = primaryAffiliation?.department || 'Medical Specialist';

  return {
    id: doc.doctor_id,
    slug: doc.slug,
    name: doc.public_display_name,
    qualifications: doc.qualifications_summary || null,
    specialization,
    yearsOfExperience: doc.years_of_experience ?? null,
    location: {
      city: doc.city || 'Navi Mumbai',
      locality: primaryAffiliation?.hospitals?.locality || doc.city || null,
      state: doc.state || 'Maharashtra',
    },
    affiliations,
    languages: Array.isArray(doc.languages_spoken) ? doc.languages_spoken : ['English', 'Hindi', 'Marathi'],
    consultationModes: Array.isArray(doc.consultation_modes) ? doc.consultation_modes : ['In-person'],
    summary: doc.professional_summary || null,
    source: {
      name: 'MEDIMESH Provider Registry',
      type: 'provider_verified',
      reviewStatus: doc.data_status || 'unreviewed',
      checkedAt: doc.created_at || null,
    },
    recordType: 'canonical',
  };
}

// Explicit catalog mode configuration for internal demonstration
const USE_DEMO_FALLBACK = true;

export async function searchDoctors({ filters = {}, sort = 'name_asc', offset = 0, pageSize = 12 } = {}) {
  try {
    const { data, count, error } = await supabase
      .from('doctor_profiles')
      .select(`
        doctor_id, slug, public_display_name, professional_summary, years_of_experience,
        city, state, consultation_modes, publication_status, data_status, created_at,
        doctor_hospital_affiliations(
          id, department, position, is_current, verification_status,
          hospitals(id, slug, name, city, locality)
        )
      `, { count: 'exact' })
      .eq('publication_status', 'published')
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Supabase doctor query error:', error);
    } else if (Array.isArray(data) && data.length > 0) {
      const canonical = data.map(normalizeCanonicalDoctor);
      return { doctors: canonical, totalCount: count ?? canonical.length, hasMore: offset + canonical.length < (count ?? canonical.length) };
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

  const filtered = starterDoctors.filter(doc => {
    const nameMatch = !q || doc.name.toLowerCase().includes(q) || doc.specialization.toLowerCase().includes(q);
    const locMatch = !locationFilter || (doc.location.city || '').toLowerCase().includes(locationFilter) || (doc.location.locality || '').toLowerCase().includes(locationFilter);
    const specMatch = !specFilter || doc.specialization.toLowerCase().includes(specFilter);
    const hospMatch = !hospitalFilter || doc.affiliations.some(a => (a.hospitalName || '').toLowerCase().includes(hospitalFilter));
    const langMatch = !languageFilter || (doc.languages || []).some(l => l.toLowerCase().includes(languageFilter));
    return nameMatch && locMatch && specMatch && hospMatch && langMatch;
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
      .from('doctor_profiles')
      .select(`
        doctor_id, slug, public_display_name, professional_summary, years_of_experience,
        city, state, consultation_modes, publication_status, data_status, created_at,
        doctor_hospital_affiliations(
          id, department, position, is_current, verification_status,
          hospitals(id, slug, name, city, locality)
        )
      `)
      .eq('slug', slug)
      .eq('publication_status', 'published')
      .maybeSingle();

    if (error) {
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
    // In canonical-only mode, we'd normally query the DB for unique specializations/localities.
    // Since there are 0 records in DB, returning empty for now.
    return { locations: [], specializations: [], hospitals: [], languages: [] };
  }

  const locations = [...new Set(starterDoctors.flatMap(d => [d.location.locality, d.location.city]).filter(Boolean))].sort();
  const specializations = [...new Set(starterDoctors.map(d => d.specialization).filter(Boolean))].sort();
  const hospitals = [...new Set(starterDoctors.flatMap(d => d.affiliations.map(a => a.hospitalName)).filter(Boolean))].sort();
  const languages = [...new Set(starterDoctors.flatMap(d => d.languages || []).filter(Boolean))].sort();

  return {
    locations,
    specializations,
    hospitals,
    languages,
  };
}
