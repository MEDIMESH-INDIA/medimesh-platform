import type {
  Hospital,
  SearchInterpretation,
  SearchFilters,
  SearchResult,
  ResultSortOrder,
  ClinicalSpecialty,
  HospitalService,
  GovernmentScheme,
  FacilityType,
} from '../types.ts';
import { SYNTHETIC_HOSPITALS } from '../data/synthetic-hospitals.ts';
import type { UserLocation } from '@/types';

// Keyword dictionaries for natural language discovery matching
const LOCATION_KEYWORDS: Record<string, string> = {
  panaji: 'Panaji',
  goa: 'Panaji',
  mumbai: 'Mumbai',
  bombay: 'Mumbai',
  pune: 'Pune',
  bengaluru: 'Bengaluru',
  bangalore: 'Bengaluru',
  delhi: 'Delhi NCR',
  'new delhi': 'Delhi NCR',
  ncr: 'Delhi NCR',
};

const SPECIALTY_KEYWORDS: Record<string, ClinicalSpecialty> = {
  cardio: 'Cardiology',
  cardiology: 'Cardiology',
  cardiologist: 'Cardiology',
  heart: 'Cardiology',
  cardiac: 'Cardiology',
  ortho: 'Orthopedics',
  orthopedic: 'Orthopedics',
  orthopaedics: 'Orthopedics',
  bone: 'Orthopedics',
  joint: 'Orthopedics',
  neuro: 'Neurology & Neurosurgery',
  neurology: 'Neurology & Neurosurgery',
  spine: 'Neurology & Neurosurgery',
  brain: 'Neurology & Neurosurgery',
  oncology: 'Oncology',
  cancer: 'Oncology',
  kidney: 'Nephrology & Urology',
  nephrology: 'Nephrology & Urology',
  dialysis: 'Nephrology & Urology',
  urology: 'Nephrology & Urology',
  pediatric: 'Pediatrics',
  pediatrics: 'Pediatrics',
  child: 'Pediatrics',
  emergency: 'Emergency & Critical Care',
  trauma: 'Emergency & Critical Care',
  casualty: 'Emergency & Critical Care',
  icu: 'Emergency & Critical Care',
  gastro: 'Gastroenterology',
  gastroenterology: 'Gastroenterology',
  general: 'General Medicine',
};

const SERVICE_KEYWORDS: Record<string, HospitalService> = {
  icu: 'Dedicated Cardiac ICU',
  'cardiac icu': 'Dedicated Cardiac ICU',
  'cath lab': 'Flat-Panel Cath Lab',
  cathlab: 'Flat-Panel Cath Lab',
  mri: '3T MRI Diagnostic',
  ct: 'Multi-Slice CT Scanner',
  'ct scan': 'Multi-Slice CT Scanner',
  'blood bank': 'e-Raktkosh Blood Bank',
  dialysis: 'Hemodialysis Unit',
  casualty: '24/7 Emergency Casualty',
  emergency: '24/7 Emergency Casualty',
  trauma: 'Advanced Trauma Care',
};

const SCHEME_KEYWORDS: Record<string, GovernmentScheme> = {
  'pm-jay': 'Ayushman Bharat (PM-JAY)',
  pmjay: 'Ayushman Bharat (PM-JAY)',
  ayushman: 'Ayushman Bharat (PM-JAY)',
  cghs: 'Central Govt Health Scheme (CGHS)',
  echs: 'Ex-Servicemen Contributory Health Scheme (ECHS)',
  cashless: 'TPA Cashless Desk',
};

const FACILITY_TYPE_KEYWORDS: Record<string, FacilityType> = {
  'super specialty': 'Super Specialty Hospital',
  'multi-specialty': 'Multi-Specialty Hospital',
  multispecialty: 'Multi-Specialty Hospital',
  'single specialty': 'Single Specialty Hospital',
  'medical college': 'Government Medical College Hospital',
  government: 'Government Medical College Hospital',
  'community health': 'Community Health Center',
  clinic: 'Daycare & Polyclinic',
};

const CONDITION_KEYWORDS = [
  'chest pain',
  'heart attack',
  'fracture',
  'fever',
  'breathlessness',
  'stroke',
  'kidney stone',
  'back pain',
  'burn',
  'asthma',
];

/**
 * Parses raw natural language text into a structured discovery interpretation.
 * Strictly non-diagnostic and non-prescriptive.
 */
export function interpretSearchQuery(query: string, activeLocationCity?: string): SearchInterpretation {
  const normalized = query.toLowerCase().trim();
  const tokens = normalized.split(/\s+/);

  let interpretedLocation: string | undefined = undefined;
  let interpretedSpecialty: ClinicalSpecialty | undefined = undefined;
  let interpretedService: HospitalService | undefined = undefined;
  let interpretedScheme: GovernmentScheme | undefined = undefined;
  let interpretedFacilityType: FacilityType | undefined = undefined;
  const discoveryKeywords: string[] = [];
  let isConditionQuery = false;

  // 1. Detect location in query
  for (const [key, locName] of Object.entries(LOCATION_KEYWORDS)) {
    if (normalized.includes(key)) {
      interpretedLocation = locName;
      discoveryKeywords.push(`Location: ${locName}`);
      break;
    }
  }

  // Fallback to active location if no location in query
  if (!interpretedLocation && activeLocationCity) {
    interpretedLocation = activeLocationCity;
  }

  // 2. Detect specialty
  for (const [key, specialty] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (tokens.includes(key) || normalized.includes(key)) {
      interpretedSpecialty = specialty;
      discoveryKeywords.push(`Specialty: ${specialty}`);
      break;
    }
  }

  // 3. Detect services
  for (const [key, service] of Object.entries(SERVICE_KEYWORDS)) {
    if (normalized.includes(key)) {
      interpretedService = service;
      discoveryKeywords.push(`Facility: ${service}`);
      break;
    }
  }

  // 4. Detect schemes
  for (const [key, scheme] of Object.entries(SCHEME_KEYWORDS)) {
    if (normalized.includes(key)) {
      interpretedScheme = scheme;
      discoveryKeywords.push(`Scheme: ${scheme}`);
      break;
    }
  }

  // 5. Detect facility type
  for (const [key, fType] of Object.entries(FACILITY_TYPE_KEYWORDS)) {
    if (normalized.includes(key)) {
      interpretedFacilityType = fType;
      discoveryKeywords.push(`Type: ${fType}`);
      break;
    }
  }

  // 6. Detect condition terms (treated strictly as discovery keywords)
  for (const cond of CONDITION_KEYWORDS) {
    if (normalized.includes(cond)) {
      isConditionQuery = true;
      discoveryKeywords.push(`Discovery term: "${cond}"`);
      break;
    }
  }

  // 7. Detect multi-domain discovery categories (additive, non-diagnostic)
  if (normalized.includes('doctor') || normalized.includes('dr.') || normalized.includes('physician') || normalized.includes('consultant')) {
    discoveryKeywords.push('Domain: Healthcare Professionals');
  }
  if (normalized.includes('pharmacy') || normalized.includes('chemist') || normalized.includes('dispensary')) {
    discoveryKeywords.push('Domain: Pharmacy Directory');
  }
  if (normalized.includes('ambulance') || normalized.includes('patient transport') || normalized.includes('paramedic')) {
    discoveryKeywords.push('Domain: Patient Transport & Ambulance');
  }
  if (normalized.includes('home care') || normalized.includes('home healthcare') || normalized.includes('home nursing')) {
    discoveryKeywords.push('Domain: Home Healthcare');
  }
  if (normalized.includes('tariff') || normalized.includes('package rate') || normalized.includes('charge schedule')) {
    discoveryKeywords.push('Domain: Informational Tariffs');
  }

  return {
    rawQuery: query,
    interpretedLocation,
    interpretedSpecialty,
    interpretedService,
    interpretedScheme,
    interpretedFacilityType,
    discoveryKeywords,
    isConditionQuery,
    transparencyNote:
      'Transparency notice: Query interpretation discovers matching facility records. MEDIMESH does not provide medical diagnosis, clinical triaging, or physician referral.',
  };
}

/**
 * Filter hospital records based on multi-attribute criteria.
 */
export function filterHospitals(
  hospitals: Hospital[],
  filters: SearchFilters,
  interpretation?: SearchInterpretation
): Hospital[] {
  return hospitals.filter((hosp) => {
    // Location match
    const targetLocation = filters.location || interpretation?.interpretedLocation;
    if (targetLocation && targetLocation !== 'All India') {
      const cityMatches =
        hosp.city.toLowerCase() === targetLocation.toLowerCase() ||
        hosp.state.toLowerCase() === targetLocation.toLowerCase();
      if (!cityMatches) {
        return false;
      }
    }

    // Specialty filter
    const requiredSpecialties = [
      ...filters.specialties,
      ...(interpretation?.interpretedSpecialty && !filters.specialties.includes(interpretation.interpretedSpecialty)
        ? [interpretation.interpretedSpecialty]
        : []),
    ];
    if (requiredSpecialties.length > 0) {
      const hasAnySpecialty = requiredSpecialties.some((req) => hosp.specialties.includes(req));
      if (!hasAnySpecialty) return false;
    }

    // Facility Type filter
    const requiredTypes = [
      ...filters.facilityTypes,
      ...(interpretation?.interpretedFacilityType && !filters.facilityTypes.includes(interpretation.interpretedFacilityType)
        ? [interpretation.interpretedFacilityType]
        : []),
    ];
    if (requiredTypes.length > 0) {
      if (!requiredTypes.includes(hosp.facilityType)) return false;
    }

    // Services filter
    const requiredServices = [
      ...filters.services,
      ...(interpretation?.interpretedService && !filters.services.includes(interpretation.interpretedService)
        ? [interpretation.interpretedService]
        : []),
    ];
    if (requiredServices.length > 0) {
      const hasAnyService = requiredServices.some((svc) => hosp.services.includes(svc));
      if (!hasAnyService) return false;
    }

    // Schemes filter
    const requiredSchemes = [
      ...filters.schemes,
      ...(interpretation?.interpretedScheme && !filters.schemes.includes(interpretation.interpretedScheme)
        ? [interpretation.interpretedScheme]
        : []),
    ];
    if (requiredSchemes.length > 0) {
      const hasAnyScheme = requiredSchemes.some((sch) => hosp.schemes.includes(sch));
      if (!hasAnyScheme) return false;
    }

    // Casualty intake filter
    if (filters.onlyActiveCasualty) {
      if (hosp.casualtyIntake.status !== 'ACTIVE_EMERGENCY') return false;
    }

    // Verification state filter
    if (filters.verificationStates.length > 0) {
      if (!filters.verificationStates.includes(hosp.verificationState)) return false;
    }

    return true;
  });
}

/**
 * Deterministically sorts hospitals without quality scoring or ranking.
 * Hierarchy:
 * 1. Exact location match
 * 2. Proximity (approximate distance)
 * 3. Matching attributes
 * 4. Alphabetical fallback
 */
export function sortHospitals(
  hospitals: Hospital[],
  sortOrder: ResultSortOrder,
  referenceCity?: string
): Hospital[] {
  const list = [...hospitals];

  return list.sort((a, b) => {
    switch (sortOrder) {
      case 'proximity': {
        // Same city prioritized
        if (referenceCity) {
          const aCity = a.city.toLowerCase() === referenceCity.toLowerCase() ? 0 : 1;
          const bCity = b.city.toLowerCase() === referenceCity.toLowerCase() ? 0 : 1;
          if (aCity !== bCity) return aCity - bCity;
        }
        // Approximate distance
        if (a.referenceDistanceKm !== b.referenceDistanceKm) {
          return a.referenceDistanceKm - b.referenceDistanceKm;
        }
        return a.name.localeCompare(b.name);
      }
      case 'freshness': {
        // Most recent updates first
        const dateA = new Date(a.lastProfileUpdate).getTime();
        const dateB = new Date(b.lastProfileUpdate).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return a.name.localeCompare(b.name);
      }
      case 'scheme': {
        // Hospitals with PM-JAY first
        const aHasPmjay = a.schemes.includes('Ayushman Bharat (PM-JAY)') ? 0 : 1;
        const bHasPmjay = b.schemes.includes('Ayushman Bharat (PM-JAY)') ? 0 : 1;
        if (aHasPmjay !== bHasPmjay) return aHasPmjay - bHasPmjay;
        return a.referenceDistanceKm - b.referenceDistanceKm;
      }
      case 'alphabetical':
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

/**
 * Main discovery search handler for Phase 03 demo.
 */
export function searchHospitals(
  rawQuery: string,
  userLocation: UserLocation,
  activeFilters: Partial<SearchFilters> = {},
  sortOrder: ResultSortOrder = 'proximity'
): SearchResult {
  const fullFilters: SearchFilters = {
    location: activeFilters.location || userLocation.city,
    specialties: activeFilters.specialties || [],
    facilityTypes: activeFilters.facilityTypes || [],
    services: activeFilters.services || [],
    schemes: activeFilters.schemes || [],
    verificationStates: activeFilters.verificationStates || [],
    onlyActiveCasualty: activeFilters.onlyActiveCasualty || false,
    maxDistanceKm: activeFilters.maxDistanceKm,
  };

  const interpretation = interpretSearchQuery(rawQuery, userLocation.city);
  const filtered = filterHospitals(SYNTHETIC_HOSPITALS, fullFilters, interpretation);
  const sorted = sortHospitals(filtered, sortOrder, userLocation.city);

  return {
    query: rawQuery,
    interpretation,
    totalMatches: sorted.length,
    hospitals: sorted,
    selectedLocation: userLocation,
    activeFilters: fullFilters,
    sortOrder,
  };
}

/**
 * Helper to get a hospital by slug.
 */
export function getHospitalBySlug(slug: string): Hospital | undefined {
  return SYNTHETIC_HOSPITALS.find((h) => h.slug === slug);
}
