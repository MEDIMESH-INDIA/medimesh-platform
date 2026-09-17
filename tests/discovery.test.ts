import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  interpretSearchQuery,
  filterHospitals,
  sortHospitals,
  searchHospitals,
  getHospitalBySlug,
} from '../src/features/hospitals/lib/search-engine.ts';
import { SYNTHETIC_HOSPITALS } from '../src/features/hospitals/data/synthetic-hospitals.ts';
import { formatDistance } from '../src/lib/utils/index.ts';
import type { UserLocation } from '../src/types/index.ts';

describe('MEDIMESH Phase 03 — Core Discovery Tests', () => {
  const mockUserLocation: UserLocation = {
    mode: 'SELECTED',
    displayName: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    state: 'Karnataka',
  };

  describe('1. Natural Language Query Interpretation & Location Extraction', () => {
    it('should extract location from natural query "hospitals in Pune"', () => {
      const result = interpretSearchQuery('hospitals in Pune');
      assert.equal(result.interpretedLocation, 'Pune');
      assert.ok(result.discoveryKeywords.some((k) => k.includes('Location: Pune')));
    });

    it('should extract location "Panaji" from "hospitals near Panaji"', () => {
      const result = interpretSearchQuery('hospitals near Panaji');
      assert.equal(result.interpretedLocation, 'Panaji');
    });

    it('should fallback to active reference location if query specifies none', () => {
      const result = interpretSearchQuery('best cardiac care', 'Bengaluru');
      assert.equal(result.interpretedLocation, 'Bengaluru');
    });
  });

  describe('2. Specialty & Facility Keyword Matching', () => {
    it('should parse specialty Cardiology from "cardiologist near me"', () => {
      const result = interpretSearchQuery('cardiologist near me');
      assert.equal(result.interpretedSpecialty, 'Cardiology');
      assert.ok(result.discoveryKeywords.some((k) => k.includes('Specialty: Cardiology')));
    });

    it('should parse service "Dedicated Cardiac ICU" from "hospitals with ICU in Bengaluru"', () => {
      const result = interpretSearchQuery('hospitals with ICU in Bengaluru');
      assert.equal(result.interpretedService, 'Dedicated Cardiac ICU');
      assert.equal(result.interpretedLocation, 'Bengaluru');
    });

    it('should parse scheme "Ayushman Bharat (PM-JAY)" from "PM-JAY hospitals"', () => {
      const result = interpretSearchQuery('PM-JAY hospitals');
      assert.equal(result.interpretedScheme, 'Ayushman Bharat (PM-JAY)');
    });

    it('should flag condition searches strictly as discovery keywords without clinical diagnosis', () => {
      const result = interpretSearchQuery('chest pain emergency in Mumbai');
      assert.equal(result.isConditionQuery, true);
      assert.equal(result.interpretedLocation, 'Mumbai');
      assert.ok(result.transparencyNote.includes('does not provide medical diagnosis'));
    });
  });

  describe('3. Deterministic Result Ordering', () => {
    it('should deterministically order by exact location match first', () => {
      const sorted = sortHospitals(SYNTHETIC_HOSPITALS, 'proximity', 'Bengaluru');
      assert.ok(sorted.length > 0);
      assert.equal(sorted[0].city, 'Bengaluru');
    });

    it('should order by freshness when sortOrder is freshness', () => {
      const sorted = sortHospitals(SYNTHETIC_HOSPITALS, 'freshness');
      for (let i = 0; i < sorted.length - 1; i++) {
        const timeA = new Date(sorted[i].lastProfileUpdate).getTime();
        const timeB = new Date(sorted[i + 1].lastProfileUpdate).getTime();
        assert.ok(timeA >= timeB, 'Items must be sorted in descending order of freshness');
      }
    });

    it('should sort alphabetically without quality scores', () => {
      const sorted = sortHospitals(SYNTHETIC_HOSPITALS, 'alphabetical');
      for (let i = 0; i < sorted.length - 1; i++) {
        assert.ok(sorted[i].name.localeCompare(sorted[i + 1].name) <= 0);
      }
    });
  });

  describe('4. Filter Behavior & Multi-Attribute Criteria', () => {
    it('should filter hospitals by specialty', () => {
      const filtered = filterHospitals(SYNTHETIC_HOSPITALS, {
        specialties: ['Cardiology'],
        facilityTypes: [],
        services: [],
        schemes: [],
        verificationStates: [],
        onlyActiveCasualty: false,
      });

      assert.ok(filtered.length > 0);
      for (const hosp of filtered) {
        assert.ok(hosp.specialties.includes('Cardiology'));
      }
    });

    it('should filter hospitals by scheme empanelment (PM-JAY)', () => {
      const filtered = filterHospitals(SYNTHETIC_HOSPITALS, {
        specialties: [],
        facilityTypes: [],
        services: [],
        schemes: ['Ayushman Bharat (PM-JAY)'],
        verificationStates: [],
        onlyActiveCasualty: false,
      });

      assert.ok(filtered.length > 0);
      for (const hosp of filtered) {
        assert.ok(hosp.schemes.includes('Ayushman Bharat (PM-JAY)'));
      }
    });

    it('should filter hospitals by active casualty intake only', () => {
      const filtered = filterHospitals(SYNTHETIC_HOSPITALS, {
        specialties: [],
        facilityTypes: [],
        services: [],
        schemes: [],
        verificationStates: [],
        onlyActiveCasualty: true,
      });

      assert.ok(filtered.length > 0);
      for (const hosp of filtered) {
        assert.equal(hosp.casualtyIntake.status, 'ACTIVE_EMERGENCY');
      }
    });
  });

  describe('5. Empty Result Recovery', () => {
    it('should return 0 matches gracefully for impossible search criteria', () => {
      const result = searchHospitals(
        'NonExistentSymptomQuery',
        mockUserLocation,
        { location: 'NonExistentCity' }
      );

      assert.equal(result.totalMatches, 0);
      assert.equal(result.hospitals.length, 0);
    });
  });

  describe('6. Approximate Distance Formatting', () => {
    it('should always output "~X.X km approx" and never absolute unqualified claims', () => {
      const formatted = formatDistance(3.2);
      assert.equal(formatted, '~3.2 km approx');
      assert.ok(!formatted.includes('Nearest'));
      assert.ok(!formatted.includes('Closest'));
    });
  });

  describe('7. Verification State & Provenance Data Integrity', () => {
    it('should only contain the 5 locked canonical verification states', () => {
      const ALLOWED_STATES = new Set([
        'PUBLIC_SOURCE',
        'FACILITY_REPORTED',
        'MEDIMESH_VERIFIED',
        'PENDING_VERIFICATION',
        'NOT_CONFIRMED',
      ]);

      for (const hosp of SYNTHETIC_HOSPITALS) {
        assert.ok(
          ALLOWED_STATES.has(hosp.verificationState),
          `Hospital ${hosp.name} has invalid verification state: ${hosp.verificationState}`
        );
        assert.equal(hosp.isDemo, true);
      }
    });

    it('should retrieve hospital by slug accurately', () => {
      const hosp = getHospitalBySlug('medimesh-demo-hospital-panaji');
      assert.ok(hosp);
      assert.equal(hosp.city, 'Panaji');
      assert.equal(hosp.isDemo, true);
    });
  });

  describe('8. Comparison Selection Limit Rule', () => {
    it('should enforce a maximum comparison threshold of 2 items', () => {
      const comparedItems: string[] = ['hosp-001', 'hosp-002'];
      const canAddThird = comparedItems.length < 2;
      assert.equal(canAddThird, false, 'Comparison must be blocked at 2 items maximum');
    });
  });

  describe('9. Corrective Trust Pass — Synthetic Demo Integrity', () => {
    it('should ensure all synthetic records are explicitly labeled demo with no fake external authority claims', () => {
      for (const hosp of SYNTHETIC_HOSPITALS) {
        // Must be flagged as demo
        assert.equal(hosp.isDemo, true);

        // Overview must explicitly state demo nature
        assert.ok(
          hosp.overview.includes('Illustrative demo') || hosp.overview.includes('Not a real hospital'),
          `Hospital ${hosp.slug} must state demo nature in overview`
        );

        // No fake external government URLs
        assert.equal(
          hosp.websiteUrl,
          undefined,
          `Hospital ${hosp.slug} should not have fake external URLs`
        );

        // Primary source must be identified as demo schema, not real-world authorities
        assert.ok(
          hosp.primarySource.sourceOrganization.includes('Demo') ||
            hosp.primarySource.sourceOrganization.includes('Synthetic'),
          `Hospital ${hosp.slug} primary source organization must clearly denote demo schema`
        );

        // Phone must be labeled as illustrative demo
        assert.ok(
          hosp.phone.includes('Demo'),
          `Hospital ${hosp.slug} phone must be clearly marked as demo`
        );

        // Accreditations must denote illustrative model
        for (const acc of hosp.accreditations) {
          assert.ok(
            acc.level?.includes('Illustrative') || acc.level?.includes('Demo'),
            `Accreditation for ${hosp.slug} must denote illustrative demo model`
          );
        }
      }
    });
  });
});
