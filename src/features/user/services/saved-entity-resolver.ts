/**
 * MEDIMESH INDIA 2.0 — Saved Entity Resolver
 *
 * Implements Section 9 & Section 46 of Phase 06 Specification:
 * 1. Validates that requested entity IDs exist before creating SavedItem records.
 * 2. Resolves current public metadata (title, category, location, verification, provenance)
 *    from canonical Phase 04/05 domain repositories.
 * 3. Handles missing/deactivated entities gracefully without crashing UI.
 */

import type { SavedEntityType, SavedItem, SavedItemResolved } from '../domain/index.ts';
import {
  SyntheticRepository,
  type IFacilityRepository,
  type ISpecialtyRepository,
  type IDoctorRepository,
  type IServiceRepository,
  type ISchemeRepository,
  type ITariffRepository,
} from '../../data-architecture/index.ts';

export interface ISavedEntityResolver {
  resolve(savedItem: SavedItem): Promise<SavedItemResolved>;
  exists(entityType: SavedEntityType, entityId: string): Promise<boolean>;
}

export class SavedEntityResolver implements ISavedEntityResolver {
  private readonly facilities: IFacilityRepository;
  private readonly specialties: ISpecialtyRepository;
  private readonly doctors: IDoctorRepository;
  private readonly services: IServiceRepository;
  private readonly schemes: ISchemeRepository;
  private readonly tariffs: ITariffRepository;

  constructor(
    facilities: IFacilityRepository = new SyntheticRepository(),
    specialties: ISpecialtyRepository = new SyntheticRepository(),
    doctors: IDoctorRepository = new SyntheticRepository(),
    services: IServiceRepository = new SyntheticRepository(),
    schemes: ISchemeRepository = new SyntheticRepository(),
    tariffs: ITariffRepository = new SyntheticRepository()
  ) {
    this.facilities = facilities;
    this.specialties = specialties;
    this.doctors = doctors;
    this.services = services;
    this.schemes = schemes;
    this.tariffs = tariffs;
  }

  /**
   * Confirms whether an entity of a given type exists in the domain repositories.
   * Prohibits saving arbitrary/nonexistent IDs.
   */
  async exists(entityType: SavedEntityType, entityId: string): Promise<boolean> {
    try {
      switch (entityType) {
        case 'FACILITY':
        case 'HOSPITAL':
        case 'AMBULANCE':
        case 'PHARMACY':
        case 'HOME_HEALTHCARE': {
          const f = await this.facilities.findById(entityId) || await this.facilities.findBySlug(entityId);
          return Boolean(f);
        }
        case 'SPECIALTY': {
          const s = await this.specialties.getSpecialtyById(entityId) || await this.specialties.getSpecialtyBySlug(entityId);
          return Boolean(s);
        }
        case 'DOCTOR': {
          const d = await this.doctors.getDoctorById(entityId) || await this.doctors.getDoctorBySlug(entityId);
          return Boolean(d);
        }
        case 'SERVICE': {
          const allServices = await this.services.listServices();
          return allServices.some((s) => s.id === entityId || s.slug === entityId);
        }
        case 'SCHEME': {
          const sc = await this.schemes.findByCode(entityId) || await this.schemes.findSchemeBySlug(entityId);
          if (sc) return true;
          const allSchemes = await this.schemes.listSchemes();
          return allSchemes.some((s) => s.id === entityId || s.code === entityId || s.slug === entityId);
        }
        case 'TARIFF': {
          const allTariffs = await this.tariffs.listAllTariffs({ includeExpired: true });
          return allTariffs.some((t) => t.id === entityId);
        }
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Resolves public metadata for a saved item from canonical domain repositories.
   */
  async resolve(savedItem: SavedItem): Promise<SavedItemResolved> {
    const { entityType, entityId } = savedItem;

    try {
      switch (entityType) {
        case 'FACILITY':
        case 'HOSPITAL': {
          const f = await this.facilities.findById(entityId) || await this.facilities.findBySlug(entityId);
          if (!f) return this.createUnavailableResolved(savedItem, 'Healthcare Facility');

          return {
            savedItem,
            title: f.name,
            categoryLabel: f.category,
            locationText: `${f.location.city}, ${f.location.state}`,
            verificationState: f.verificationState,
            sourceOrganization: 'Verified Public Healthcare Registry (Demo)',
            lastReviewedAt: f.updatedAt,
            slug: `/facilities/${f.slug}`,
            isDemo: f.dataOrigin === 'SYNTHETIC_DEMO',
            isAvailable: true,
          };
        }

        case 'SPECIALTY': {
          const s = await this.specialties.getSpecialtyById(entityId) || await this.specialties.getSpecialtyBySlug(entityId);
          if (!s) return this.createUnavailableResolved(savedItem, 'Clinical Specialty');

          return {
            savedItem,
            title: s.name,
            categoryLabel: 'Clinical Specialty',
            locationText: s.clinicalDomain,
            verificationState: 'PUBLIC_SOURCE',
            sourceOrganization: 'National Health Authority Taxonomy (Demo)',
            slug: `/specialties#${s.slug}`,
            isDemo: true,
            isAvailable: true,
          };
        }

        case 'DOCTOR': {
          const res = await this.doctors.getDoctorById(entityId) || await this.doctors.getDoctorBySlug(entityId);
          const doc = res && 'doctor' in res ? res.doctor : res;
          if (!doc) return this.createUnavailableResolved(savedItem, 'Doctor / Specialist');

          return {
            savedItem,
            title: `${doc.name} (${doc.qualifications})`,
            categoryLabel: 'Medical Practitioner',
            locationText: doc.registrationReference ? `Registration: ${doc.registrationReference}` : undefined,
            verificationState: doc.verificationState,
            sourceOrganization: 'Medical Council Public Register (Demo)',
            lastReviewedAt: doc.updatedAt,
            slug: `/doctors/${doc.slug}`,
            isDemo: doc.dataOrigin === 'SYNTHETIC_DEMO',
            isAvailable: true,
          };
        }

        case 'SERVICE': {
          const allServices = await this.services.listServices();
          const svc = allServices.find((s) => s.id === entityId || s.slug === entityId);
          if (!svc) return this.createUnavailableResolved(savedItem, 'Diagnostic / Service');

          return {
            savedItem,
            title: svc.name,
            categoryLabel: `Service · ${svc.category}`,
            locationText: svc.description ?? 'Facility clinical capability',
            verificationState: 'FACILITY_REPORTED',
            sourceOrganization: 'Facility Capability Sourced Record (Demo)',
            slug: `/services#${svc.slug}`,
            isDemo: true,
            isAvailable: true,
          };
        }

        case 'SCHEME': {
          let sc = await this.schemes.findByCode(entityId) || await this.schemes.findSchemeBySlug(entityId);
          if (!sc) {
            const all = await this.schemes.listSchemes();
            sc = all.find((s) => s.id === entityId || s.code === entityId || s.slug === entityId) || null;
          }
          if (!sc) return this.createUnavailableResolved(savedItem, 'Health Scheme / Insurance');

          return {
            savedItem,
            title: sc.name,
            categoryLabel: `Public Scheme · ${sc.providerType}`,
            locationText: sc.stateScope || 'All India Coverage',
            verificationState: 'PUBLIC_SOURCE',
            sourceOrganization: 'Official Government Health Scheme Gazette (Demo)',
            slug: `/schemes#${sc.slug}`,
            isDemo: true,
            isAvailable: true,
          };
        }

        case 'TARIFF': {
          const allTariffs = await this.tariffs.listAllTariffs({ includeExpired: true });
          const tariff = allTariffs.find((t) => t.id === entityId);
          if (!tariff) return this.createUnavailableResolved(savedItem, 'Tariff Schedule');

          const now = new Date();
          const isExpired = Boolean(tariff.effectiveTo && new Date(tariff.effectiveTo) < now);

          return {
            savedItem,
            title: `INR ${tariff.amount} (${tariff.unit})`,
            categoryLabel: isExpired ? 'Tariff · HISTORICAL / EXPIRED' : 'Tariff · Active Sourced Rate',
            locationText: tariff.notes || (isExpired ? 'Effective period expired' : 'Standard Rate Schedule'),
            verificationState: tariff.verificationState,
            sourceOrganization: 'Public Tariff Schedule (Demo)',
            lastReviewedAt: tariff.lastReviewedAt,
            slug: `/tariffs`,
            isDemo: tariff.dataOrigin === 'SYNTHETIC_DEMO',
            isAvailable: true,
            tariffDetails: {
              amount: tariff.amount,
              currency: tariff.currency,
              unit: tariff.unit,
              effectiveFrom: tariff.effectiveFrom,
              effectiveTo: tariff.effectiveTo,
              isExpired,
            },
          };
        }

        case 'AMBULANCE': {
          const f = await this.facilities.findById(entityId) || await this.facilities.findBySlug(entityId);
          if (!f) return this.createUnavailableResolved(savedItem, 'Ambulance Service');

          return {
            savedItem,
            title: f.name,
            categoryLabel: 'Ambulance & Patient Transport',
            locationText: `${f.location.city}, ${f.location.state} · ${f.contact.primaryPhone}`,
            verificationState: f.verificationState,
            sourceOrganization: 'Source-reported 24/7 Registry (Demo)',
            lastReviewedAt: f.updatedAt,
            slug: `/ambulances`,
            isDemo: f.dataOrigin === 'SYNTHETIC_DEMO',
            isAvailable: true,
          };
        }

        case 'PHARMACY': {
          const f = await this.facilities.findById(entityId) || await this.facilities.findBySlug(entityId);
          if (!f) return this.createUnavailableResolved(savedItem, 'Pharmacy');

          return {
            savedItem,
            title: f.name,
            categoryLabel: 'Retail Pharmacy / Dispensing',
            locationText: `${f.location.city}, ${f.location.state}`,
            verificationState: f.verificationState,
            sourceOrganization: 'Pharmacy Council Public Registry (Demo)',
            lastReviewedAt: f.updatedAt,
            slug: `/pharmacies`,
            isDemo: f.dataOrigin === 'SYNTHETIC_DEMO',
            isAvailable: true,
          };
        }

        case 'HOME_HEALTHCARE': {
          const f = await this.facilities.findById(entityId) || await this.facilities.findBySlug(entityId);
          if (!f) return this.createUnavailableResolved(savedItem, 'Home Healthcare');

          return {
            savedItem,
            title: f.name,
            categoryLabel: 'Home Healthcare Provider',
            locationText: `${f.location.city}, ${f.location.state}`,
            verificationState: f.verificationState,
            sourceOrganization: 'Home Care Network Directory (Demo)',
            lastReviewedAt: f.updatedAt,
            slug: `/home-healthcare`,
            isDemo: f.dataOrigin === 'SYNTHETIC_DEMO',
            isAvailable: true,
          };
        }

        default:
          return this.createUnavailableResolved(savedItem, 'Healthcare Item');
      }
    } catch {
      return this.createUnavailableResolved(savedItem, 'Healthcare Item');
    }
  }

  private createUnavailableResolved(savedItem: SavedItem, fallbackCategory: string): SavedItemResolved {
    return {
      savedItem,
      title: 'Saved record unavailable',
      categoryLabel: fallbackCategory,
      locationText: 'This record was archived or superseded.',
      verificationState: 'NOT_CONFIRMED',
      isDemo: true,
      isAvailable: false,
    };
  }
}

export const defaultSavedEntityResolver = new SavedEntityResolver();
