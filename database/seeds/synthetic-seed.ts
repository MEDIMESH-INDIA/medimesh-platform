/**
 * MEDIMESH INDIA 2.0 — Synthetic Demonstration Seed Data
 *
 * Populates the normalized relational data architecture with the 8 synthetic
 * demonstration hospitals.
 *
 * MANDATORY SAFETY RULES:
 * - Every record has dataOrigin: 'SYNTHETIC_DEMO'
 * - Zero fake government URLs or fake accreditation certificates
 * - Illustrative demo schema citations only
 * - Non-destructive: seeds without wiping production tables
 */

import { SYNTHETIC_HOSPITALS } from '../../src/features/hospitals/data/synthetic-hospitals.ts';
import type {
  Facility,
  HospitalProfile,
  Specialty,
  ServiceCapability,
  SchemeInsurance,
  FacilitySpecialtyRelation,
  FacilityServiceRelation,
  FacilitySchemeRelation,
  AvailabilityRecord,
  SourceProvenance,
  HospitalType,
  ClinicalDomain,
} from '../../src/features/data-architecture/domain/index.ts';

export interface SyntheticSeedDataset {
  sources: SourceProvenance[];
  facilities: Facility[];
  hospitalProfiles: HospitalProfile[];
  specialties: Specialty[];
  services: ServiceCapability[];
  schemes: SchemeInsurance[];
  facilitySpecialties: FacilitySpecialtyRelation[];
  facilityServices: FacilityServiceRelation[];
  facilitySchemes: FacilitySchemeRelation[];
  availabilityRecords: AvailabilityRecord[];
}

export function generateSyntheticSeedDataset(): SyntheticSeedDataset {
  // 1. Reusable Common Source for Synthetic Demo
  const demoSource: SourceProvenance = {
    id: 'src-demo-master',
    sourceType: 'SYNTHETIC_DEMO',
    sourceOrganization: 'MEDIMESH Demo Data Generator (Synthetic Sample)',
    sourceTitle: 'Demonstration Data Model — Not Real Source Evidence',
    collectedAt: '2026-09-17T00:00:00.000Z',
    lastReviewedAt: '2026-09-17T00:00:00.000Z',
    reviewedBy: 'MEDIMESH Demo Review Desk',
    verificationState: 'MEDIMESH_VERIFIED',
    dataOrigin: 'SYNTHETIC_DEMO',
    notes: 'Synthetic demonstration dataset generated for UI modeling and architecture validation.',
    createdAt: '2026-09-17T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  };

  // 2. Extract Distinct Specialties
  const specialtyNames = Array.from(
    new Set(SYNTHETIC_HOSPITALS.flatMap((h) => h.specialties))
  );
  const specialties: Specialty[] = specialtyNames.map((name, idx) => ({
    id: `spec-${String(idx + 1).padStart(3, '0')}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name,
    clinicalDomain: name as ClinicalDomain,
    isAdult: true,
    isPediatric: name === 'Pediatrics',
  }));

  // 3. Extract Distinct Services
  const serviceNames = Array.from(
    new Set(SYNTHETIC_HOSPITALS.flatMap((h) => h.services))
  );
  const services: ServiceCapability[] = serviceNames.map((name, idx) => ({
    id: `svc-${String(idx + 1).padStart(3, '0')}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name,
    category: name.includes('ICU') || name.includes('Casualty') ? 'Critical Care' : 'Diagnostic Imaging',
  }));

  // 4. Extract Distinct Schemes
  const schemeNames = Array.from(
    new Set(SYNTHETIC_HOSPITALS.flatMap((h) => h.schemes))
  );
  const schemes: SchemeInsurance[] = schemeNames.map((name, idx) => ({
    id: `sch-${String(idx + 1).padStart(3, '0')}`,
    code: name.includes('PM-JAY') ? 'PM-JAY' : name.includes('CGHS') ? 'CGHS' : name.includes('ECHS') ? 'ECHS' : `SCH-${idx + 1}`,
    name,
    providerType: name.includes('Cashless') ? 'COMMERCIAL_TPA' : 'GOVERNMENT',
    stateScope: 'ALL_INDIA',
    description: `Illustrative demonstration model for ${name}. Fictional facility is not empaneled.`,
  }));

  // 5. Build Facilities and Relational Records
  const facilities: Facility[] = [];
  const hospitalProfiles: HospitalProfile[] = [];
  const facilitySpecialties: FacilitySpecialtyRelation[] = [];
  const facilityServices: FacilityServiceRelation[] = [];
  const facilitySchemes: FacilitySchemeRelation[] = [];
  const availabilityRecords: AvailabilityRecord[] = [];

  for (const h of SYNTHETIC_HOSPITALS) {
    // Generic Facility
    const facility: Facility = {
      id: h.id,
      slug: h.slug,
      name: h.name,
      category: 'Hospital',
      ownershipType: h.facilityType.includes('Government') ? 'Public' : 'Private',
      description: h.overview,
      location: {
        address: h.address,
        city: h.city,
        state: h.state,
        district: h.district,
        country: 'India',
        postalCode: h.pinCode,
      },
      contact: {
        primaryPhone: h.phone,
      },
      workflowStatus: 'PUBLISHED',
      sourceId: demoSource.id,
      verificationState: h.verificationState,
      dataOrigin: 'SYNTHETIC_DEMO',
      isArchived: false,
      createdAt: h.lastProfileUpdate,
      updatedAt: h.lastProfileUpdate,
    };
    facilities.push(facility);

    // Hospital Profile
    const profile: HospitalProfile = {
      id: `prof-${h.id}`,
      facilityId: h.id,
      hospitalType: h.facilityType as HospitalType,
      bedCapacityTotal: h.bedCapacityTotal,
      icuBedCapacity: h.icuBedCapacity,
      traumaCapability: h.services.some((s) => s.includes('Trauma') || s.includes('Emergency')),
      emergencyIntakeOperational: h.casualtyIntake.status === 'ACTIVE_EMERGENCY',
      isMedicalCollege: h.facilityType.includes('Medical College'),
      accreditationSummary: h.accreditations.length > 0 ? h.accreditations[0].body : undefined,
      workflowStatus: 'PUBLISHED',
      sourceId: demoSource.id,
      verificationState: h.verificationState,
      dataOrigin: 'SYNTHETIC_DEMO',
      createdAt: h.lastProfileUpdate,
      updatedAt: h.lastProfileUpdate,
    };
    hospitalProfiles.push(profile);

    // Facility Specialties
    for (const specName of h.specialties) {
      const spec = specialties.find((s) => s.name === specName);
      if (spec) {
        facilitySpecialties.push({
          id: `fsp-${h.id}-${spec.id}`,
          facilityId: h.id,
          specialtyId: spec.id,
          opdAvailable: true,
          inpatientAvailable: true,
          workflowStatus: 'PUBLISHED',
          sourceId: demoSource.id,
          verificationState: h.verificationState,
          dataOrigin: 'SYNTHETIC_DEMO',
          isArchived: false,
          createdAt: h.lastProfileUpdate,
          updatedAt: h.lastProfileUpdate,
        });
      }
    }

    // Facility Services
    for (const svcName of h.services) {
      const svc = services.find((s) => s.name === svcName);
      if (svc) {
        facilityServices.push({
          id: `fsv-${h.id}-${svc.id}`,
          facilityId: h.id,
          serviceId: svc.id,
          is24x7: svcName.includes('24/7'),
          workflowStatus: 'PUBLISHED',
          sourceId: demoSource.id,
          verificationState: h.verificationState,
          dataOrigin: 'SYNTHETIC_DEMO',
          isArchived: false,
          createdAt: h.lastProfileUpdate,
          updatedAt: h.lastProfileUpdate,
        });
      }
    }

    // Facility Schemes
    for (const schName of h.schemes) {
      const sch = schemes.find((s) => s.name === schName);
      if (sch) {
        facilitySchemes.push({
          id: `fsc-${h.id}-${sch.id}`,
          facilityId: h.id,
          schemeId: sch.id,
          helpdeskLocation: 'Main Reception Demo Desk',
          workflowStatus: 'PUBLISHED',
          sourceId: demoSource.id,
          verificationState: h.verificationState,
          dataOrigin: 'SYNTHETIC_DEMO',
          isArchived: false,
          createdAt: h.lastProfileUpdate,
          updatedAt: h.lastProfileUpdate,
        });
      }
    }

    // Availability Record
    availabilityRecords.push({
      id: `avail-${h.id}-casualty`,
      facilityId: h.id,
      capabilityType: 'CASUALTY',
      status: h.casualtyIntake.status === 'ACTIVE_EMERGENCY' ? 'ACTIVE' : 'LIMITED',
      observedAt: h.casualtyIntake.lastUpdated,
      sourceId: demoSource.id,
      verificationState: h.casualtyIntake.source.verificationState,
      requiresConfirmation: true,
      contextNotes: h.casualtyIntake.subtext,
      dataOrigin: 'SYNTHETIC_DEMO',
      createdAt: h.casualtyIntake.lastUpdated,
    });
  }

  return {
    sources: [demoSource],
    facilities,
    hospitalProfiles,
    specialties,
    services,
    schemes,
    facilitySpecialties,
    facilityServices,
    facilitySchemes,
    availabilityRecords,
  };
}
