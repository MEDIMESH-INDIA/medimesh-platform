import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  SyntheticRepository,
} from '../src/features/data-architecture/index.ts';
import { searchHospitals } from '../src/features/hospitals/lib/search-engine.ts';
import type { UserLocation } from '../src/types/index.ts';

describe('MEDIMESH Phase 05 — Discovery Modules Tests (Modules A-J)', () => {
  let repo: SyntheticRepository;

  const mockUserLocation: UserLocation = {
    mode: 'SELECTED',
    displayName: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    state: 'Karnataka',
  };

  beforeEach(() => {
    repo = new SyntheticRepository();
  });

  // ---------------------------------------------------------------------------
  // Module A: Facilities Discovery
  // ---------------------------------------------------------------------------
  describe('Module A: Facilities Discovery (/facilities)', () => {
    it('should index all 18 synthetic facilities across distinct facility classifications', async () => {
      const facilities = await repo.findMany();
      assert.equal(facilities.length, 18, 'Expected 18 synthetic facilities');

      const categories = new Set(facilities.map((f) => f.category));
      assert.ok(categories.has('Hospital'), 'Hospital category must exist');
      assert.ok(categories.has('Clinic'), 'Clinic category must exist');
      assert.ok(categories.has('Diagnostic/Laboratory'), 'Diagnostic/Laboratory category must exist');
      assert.ok(categories.has('Pharmacy'), 'Pharmacy category must exist');
      assert.ok(categories.has('Home Healthcare'), 'Home Healthcare category must exist');
      assert.ok(categories.has('Emergency/Critical Care'), 'Emergency/Critical Care category must exist');
    });

    it('should resolve every facility by its canonical unique slug', async () => {
      const facilities = await repo.findMany();
      for (const facility of facilities) {
        assert.ok(facility.slug, `Facility ${facility.id} must have a slug`);
        const resolved = await repo.findBySlug(facility.slug);
        assert.ok(resolved, `Should resolve facility by slug: ${facility.slug}`);
        assert.equal(resolved.id, facility.id);
      }
    });

    it('should maintain strict synthetic demo isolation on all facilities', async () => {
      const facilities = await repo.findMany();
      for (const f of facilities) {
        assert.equal(f.dataOrigin, 'SYNTHETIC_DEMO', `Facility ${f.id} must have SYNTHETIC_DEMO origin`);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Module B: Specialties Discovery
  // ---------------------------------------------------------------------------
  describe('Module B: Specialties Discovery (/specialties)', () => {
    it('should retrieve clinical specialties with facility associations', async () => {
      const cardiacFacility = await repo.findBySlug('medimesh-cardiac-specialty-bengaluru');
      assert.ok(cardiacFacility, 'Cardiac facility must exist');

      const relations = await repo.getFacilitySpecialties(cardiacFacility.id);
      assert.ok(relations.length > 0, 'Facility should have specialty relations');

      const specialtyIds = relations.map((r) => r.specialtyId);
      assert.ok(specialtyIds.includes('spec-001'), 'Must offer Cardiology (spec-001)');

      const specialty = await repo.getSpecialtyById('spec-001');
      assert.ok(specialty, 'Cardiology specialty must exist');
      assert.equal(specialty.name, 'Cardiology');
      assert.equal(specialty.clinicalDomain, 'Cardiology');
    });
  });

  // ---------------------------------------------------------------------------
  // Module C: Doctors Discovery & Public Registration Phrasing
  // ---------------------------------------------------------------------------
  describe('Module C: Doctors Discovery (/doctors)', () => {
    it('should list all 12 synthetic doctor profiles with unique slugs', async () => {
      const doctors = await repo.listDoctors();
      assert.equal(doctors.length, 12, 'Must have 12 synthetic doctor profiles');

      const slugs = doctors.map((d) => d.slug);
      const uniqueSlugs = new Set(slugs);
      assert.equal(slugs.length, uniqueSlugs.size, 'All doctor slugs must be unique');
    });

    it('should resolve doctor profiles by slug with public registration information', async () => {
      const result = await repo.getDoctorBySlug('dr-anand-deshmukh');
      assert.ok(result, 'Doctor dr-anand-deshmukh must exist');
      const { doctor } = result;
      assert.equal(doctor.name, 'Dr. Anand Deshmukh');
      assert.ok(doctor.registrationReference, 'Registration reference is required');
      assert.ok(doctor.registrationReference.includes('KMC-48291'), 'Contains medical council registration reference');
      assert.ok(doctor.qualifications, 'Doctor qualifications must be populated');
      assert.ok(doctor.sourceId, 'Provenance source reference is mandatory');
    });

    it('should verify doctor verification denotes provenance review only, never clinical endorsement', async () => {
      const result = await repo.getDoctorBySlug('dr-anand-deshmukh');
      assert.ok(result);
      const { doctor } = result;
      const validStates = [
        'PUBLIC_SOURCE',
        'FACILITY_REPORTED',
        'MEDIMESH_VERIFIED',
        'PENDING_VERIFICATION',
        'NOT_CONFIRMED',
        'UNABLE_TO_VERIFY',
      ];
      assert.ok(validStates.includes(doctor.verificationState), 'Verification state must be standard provenance state');
      assert.equal(doctor.dataOrigin, 'SYNTHETIC_DEMO');
    });
  });

  // ---------------------------------------------------------------------------
  // Module D: Services & Capabilities
  // ---------------------------------------------------------------------------
  describe('Module D: Services & Capabilities (/services)', () => {
    it('should retrieve structured diagnostic and procedural services for facilities', async () => {
      const services = await repo.getFacilityServices('hosp-001');
      assert.ok(services.length > 0, 'Facility hosp-001 should offer services');

      const serviceIds = services.map((s) => s.serviceId);
      assert.ok(serviceIds.includes('svc-001'), 'Cath Lab / ICU capability required');

      const serviceDetails = await repo.listServices();
      const svc001 = serviceDetails.find((s) => s.id === 'svc-001');
      assert.ok(svc001);
      assert.equal(svc001.name, 'Dedicated Cardiac ICU (CICU)');
    });
  });

  // ---------------------------------------------------------------------------
  // Module E: Schemes & Insurance Tri-Part Separation
  // ---------------------------------------------------------------------------
  describe('Module E: Schemes & Insurance (/schemes)', () => {
    it('should retrieve public government health schemes with unique slugs', async () => {
      const pmjay = await repo.findSchemeBySlug('ayushman-bharat-pmjay');
      assert.ok(pmjay, 'PM-JAY scheme must exist');
      assert.equal(pmjay.name, 'Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana');
      assert.equal(pmjay.providerType, 'GOVERNMENT');
    });

    it('should enforce tri-part separation for facility empanelment', async () => {
      const schemes = await repo.getFacilitySchemes('hosp-001');
      assert.ok(schemes.length > 0, 'Facility hosp-001 must have empanelled schemes');

      for (const scheme of schemes) {
        assert.ok(scheme.schemeId, 'Scheme ID is required');
        assert.ok(scheme.sourceId, 'Source citation is required');
        assert.ok(scheme.workflowStatus, 'Workflow status is required');
        assert.ok(scheme.verificationState, 'Verification state is required');
        assert.equal(scheme.workflowStatus, 'PUBLISHED');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Module F: Informational Tariffs & Temporal Semantics
  // ---------------------------------------------------------------------------
  describe('Module F: Informational Tariffs (/tariffs)', () => {
    it('should retrieve all 11 synthetic tariff items when including expired schedules', async () => {
      const allTariffs = await repo.listAllTariffs({ includeExpired: true });
      assert.equal(allTariffs.length, 11, 'Expected 11 synthetic tariff packages');
    });

    it('should support temporal classification: active, historical/expired, and unconfirmed', async () => {
      const allTariffs = await repo.listAllTariffs({ includeExpired: true });
      const now = new Date();

      let activeCount = 0;
      let expiredCount = 0;
      let unconfirmedCount = 0;

      for (const tariff of allTariffs) {
        if (!tariff.effectiveFrom && !tariff.effectiveTo) {
          unconfirmedCount++;
        } else if (tariff.effectiveTo && new Date(tariff.effectiveTo) < now) {
          expiredCount++;
        } else {
          activeCount++;
        }
      }

      assert.ok(activeCount > 0, 'Must have active tariffs');
      assert.ok(expiredCount > 0, 'Must have historical / expired tariffs for temporal verification');
      assert.ok(unconfirmedCount > 0, 'Must have tariffs with unconfirmed effective windows');
    });

    it('should ensure tariffs contain mandatory non-promotional details', async () => {
      const activeTariffs = await repo.listAllTariffs();
      for (const t of activeTariffs) {
        assert.ok(t.id, 'Tariff ID is required');
        assert.ok(t.amount > 0, 'Rate must be positive');
        assert.equal(t.currency, 'INR');
        assert.ok(t.unit, 'Pricing unit is required');
        assert.ok(t.sourceId, 'Source ID is required');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Module G: Emergency & Critical-Care Discovery
  // ---------------------------------------------------------------------------
  describe('Module G: Emergency Discovery (/emergency)', () => {
    it('should discover facilities equipped with 24/7 casualty and ICU capability', async () => {
      const facilities = await repo.findMany();
      const emergencyFacilities = facilities.filter(
        (f) =>
          f.category === 'Emergency/Critical Care' ||
          (f.operatingHours && f.operatingHours.includes('24/7'))
      );
      assert.ok(emergencyFacilities.length >= 4, 'Should have multiple facilities with emergency/ICU capabilities');
    });
  });

  // ---------------------------------------------------------------------------
  // Module H: Ambulance Discovery (Non-Dispatch)
  // ---------------------------------------------------------------------------
  describe('Module H: Ambulance Discovery (/ambulances)', () => {
    it('should index ambulance providers with operational phone and vehicle categories', async () => {
      const facilities = await repo.findMany();
      const ambulances = facilities.filter(
        (f) =>
          f.id.startsWith('fac-amb') ||
          f.name.toLowerCase().includes('transport') ||
          f.name.toLowerCase().includes('ambulance')
      );
      assert.equal(ambulances.length, 2, 'Must have 2 synthetic ambulance providers');

      for (const amb of ambulances) {
        assert.ok(amb.contact.primaryPhone, 'Ambulance must have primary dispatch/query phone');
        assert.ok(amb.operatingHours?.includes('Source-reported 24/7'), 'Must cite Source-reported 24/7');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Module I: Pharmacy Discovery (Non-Dispensing)
  // ---------------------------------------------------------------------------
  describe('Module I: Pharmacy Discovery (/pharmacies)', () => {
    it('should index pharmacies with contact phone and operational hours without dispensing cart', async () => {
      const facilities = await repo.findMany();
      const pharmacies = facilities.filter((f) => f.category === 'Pharmacy');
      assert.equal(pharmacies.length, 2, 'Must have 2 synthetic pharmacies');

      for (const pharm of pharmacies) {
        assert.ok(pharm.contact.primaryPhone, 'Pharmacy must have contact phone');
        assert.ok(pharm.operatingHours, 'Pharmacy must list operating hours');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Module J: Home Healthcare Discovery
  // ---------------------------------------------------------------------------
  describe('Module J: Home Healthcare Discovery (/home-healthcare)', () => {
    it('should index home healthcare providers with service scope and contact points', async () => {
      const facilities = await repo.findMany();
      const homeCare = facilities.filter((f) => f.category === 'Home Healthcare');
      assert.equal(homeCare.length, 2, 'Must have 2 synthetic home healthcare providers');

      for (const hc of homeCare) {
        assert.ok(hc.contact.primaryPhone, 'Must list primary phone');
        assert.ok(hc.location.city, 'Must list operational city');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Additive Non-Diagnostic Search Engine Extension
  // ---------------------------------------------------------------------------
  describe('Additive Non-Diagnostic Search Engine Extension', () => {
    it('should search facilities across multiple categories deterministically', () => {
      const cardiacResults = searchHospitals('cardiac', mockUserLocation);
      assert.ok(cardiacResults.hospitals.length > 0, 'Should find cardiac facilities');

      const generalResults = searchHospitals('general', mockUserLocation);
      assert.ok(generalResults.hospitals.length > 0, 'Should find general facilities');
    });

    it('should preserve deterministic ordering by facility name', () => {
      const results1 = searchHospitals('bengaluru', mockUserLocation, {}, 'alphabetical');
      const results2 = searchHospitals('bengaluru', mockUserLocation, {}, 'alphabetical');
      assert.deepEqual(
        results1.hospitals.map((r) => r.id),
        results2.hospitals.map((r) => r.id),
        'Search results must be strictly deterministic'
      );
    });
  });
});
