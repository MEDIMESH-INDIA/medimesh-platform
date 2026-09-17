import type { Source, VerificationState, UserLocation } from '@/types';

export type FacilityType =
  | 'Super Specialty Hospital'
  | 'Multi-Specialty Hospital'
  | 'Single Specialty Hospital'
  | 'Government Medical College Hospital'
  | 'Community Health Center'
  | 'Daycare & Polyclinic';

export type ClinicalSpecialty =
  | 'Cardiology'
  | 'Orthopedics'
  | 'Neurology & Neurosurgery'
  | 'Oncology'
  | 'Nephrology & Urology'
  | 'Pediatrics'
  | 'General Medicine'
  | 'Obstetrics & Gynecology'
  | 'Gastroenterology'
  | 'Emergency & Critical Care';

export type HospitalService =
  | '24/7 Emergency Casualty'
  | 'Dedicated Cardiac ICU'
  | 'Flat-Panel Cath Lab'
  | '3T MRI Diagnostic'
  | 'Multi-Slice CT Scanner'
  | 'Hemodialysis Unit'
  | 'e-Raktkosh Blood Bank'
  | 'Daycare Surgery Unit'
  | 'Advanced Trauma Care'
  | 'Pediatric ICU (PICU)';

export type GovernmentScheme =
  | 'Ayushman Bharat (PM-JAY)'
  | 'Central Govt Health Scheme (CGHS)'
  | 'Ex-Servicemen Contributory Health Scheme (ECHS)'
  | 'State Health Insurance Scheme'
  | 'TPA Cashless Desk';

export interface AccreditationRecord {
  body: string; // e.g., 'NABH', 'NABL'
  level?: string; // e.g., '5th Edition Full Accreditation'
  validUntil?: string;
  source: Source;
}

export interface CasualtyIntakeStatus {
  status: 'ACTIVE_EMERGENCY' | 'OPERATIONAL_WITH_INTAKE' | 'UNCONFIRMED';
  label: string;
  subtext: string;
  lastUpdated: string;
  source: Source;
}

export interface Hospital {
  id: string;
  slug: string;
  name: string;
  facilityType: FacilityType;
  city: string;
  state: string;
  district?: string;
  pinCode: string;
  address: string;
  referenceDistanceKm: number; // Approximate baseline distance for demo location
  phone: string;
  websiteUrl?: string;
  email?: string;
  overview: string;
  bedCapacityTotal: number;
  icuBedCapacity: number;
  specialties: ClinicalSpecialty[];
  services: HospitalService[];
  schemes: GovernmentScheme[];
  accreditations: AccreditationRecord[];
  casualtyIntake: CasualtyIntakeStatus;
  primarySource: Source;
  verificationState: VerificationState;
  lastProfileUpdate: string;
  isDemo: true;
}

export interface SearchFilters {
  location?: string;
  specialties: ClinicalSpecialty[];
  facilityTypes: FacilityType[];
  services: HospitalService[];
  schemes: GovernmentScheme[];
  maxDistanceKm?: number;
  onlyActiveCasualty?: boolean;
  verificationStates: VerificationState[];
}

export interface SearchInterpretation {
  rawQuery: string;
  interpretedLocation?: string;
  interpretedSpecialty?: ClinicalSpecialty;
  interpretedService?: HospitalService;
  interpretedScheme?: GovernmentScheme;
  interpretedFacilityType?: FacilityType;
  discoveryKeywords: string[];
  isConditionQuery: boolean;
  transparencyNote: string;
}

export type ResultSortOrder =
  | 'proximity'
  | 'freshness'
  | 'alphabetical'
  | 'scheme';

export interface SearchResult {
  query: string;
  interpretation: SearchInterpretation;
  totalMatches: number;
  hospitals: Hospital[];
  selectedLocation: UserLocation;
  activeFilters: SearchFilters;
  sortOrder: ResultSortOrder;
}
