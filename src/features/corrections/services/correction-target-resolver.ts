/**
 * MEDIMESH INDIA 2.0 — Correction Target Entity Resolver
 *
 * Phase 07: Corrections + Trust
 *
 * Encapsulates entity lookup, existence confirmation, field whitelist validation,
 * current-value snapshot capture, and revision/version identifier retrieval across
 * all 8 approved target entity types.
 */

import { getDefaultRepository, type SyntheticRepository } from '../../data-architecture/index.ts';
import type { DataOrigin } from '../../data-architecture/domain/index.ts';
import type {
  CorrectionTargetEntityType,
  TargetResolutionResult,
} from '../domain/index.ts';
import { isAllowedCorrectionField, getFieldLabel } from '../domain/types.ts';

export interface ICorrectionTargetResolver {
  resolveTarget(
    targetEntityType: CorrectionTargetEntityType,
    targetEntityId: string,
    targetField: string
  ): Promise<TargetResolutionResult>;

  getTargetEntity(
    targetEntityType: CorrectionTargetEntityType,
    targetEntityId: string
  ): Promise<unknown | null>;

  applyFieldUpdate(
    targetEntityType: CorrectionTargetEntityType,
    targetEntityId: string,
    targetField: string,
    newValue: string,
    newRevisionId?: string
  ): Promise<{ previousValue: string; updatedValue: string }>;
}

export class CorrectionTargetResolver implements ICorrectionTargetResolver {
  private repo: SyntheticRepository;

  constructor(repo: SyntheticRepository = getDefaultRepository()) {
    this.repo = repo;
  }

  async resolveTarget(
    targetEntityType: CorrectionTargetEntityType,
    targetEntityId: string,
    targetField: string
  ): Promise<TargetResolutionResult> {
    const fieldEligible = isAllowedCorrectionField(targetEntityType, targetField);
    const fieldLabel = getFieldLabel(targetEntityType, targetField);

    const fallbackResult: TargetResolutionResult = {
      targetEntityType,
      targetEntityId,
      targetTitle: `${targetEntityType} (${targetEntityId})`,
      targetField,
      fieldLabel,
      currentValue: null,
      currentRevisionId: null,
      dataOrigin: 'SYNTHETIC_DEMO',
      exists: false,
      fieldEligible,
    };

    switch (targetEntityType) {
      case 'FACILITY': {
        const facility = await this.repo.findById(targetEntityId);
        if (!facility) return fallbackResult;

        let currentValue: string | null = null;
        if (fieldEligible) {
          if (targetField === 'operatingHours') {
            currentValue = facility.operatingHours ?? null;
          } else if (targetField === 'contact.primaryPhone') {
            currentValue = facility.contact?.primaryPhone ?? null;
          } else if (targetField === 'contact.emergencyPhone') {
            currentValue = facility.contact?.emergencyPhone ?? null;
          } else if (targetField === 'contact.email') {
            currentValue = facility.contact?.email ?? null;
          } else if (targetField === 'contact.websiteUrl') {
            currentValue = facility.contact?.websiteUrl ?? null;
          } else if (targetField === 'location.address') {
            currentValue = facility.location?.address ?? null;
          } else if (targetField === 'location.locality') {
            currentValue = facility.location?.locality ?? null;
          }
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: facility.name,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: facility.currentRevisionId || `${facility.id}:${facility.updatedAt}`,
          dataOrigin: facility.dataOrigin,
          exists: true,
          fieldEligible,
        };
      }

      case 'HOSPITAL_PROFILE': {
        const profile = await this.repo.getProfileByFacilityId(targetEntityId);
        if (!profile) return fallbackResult;

        const facility = await this.repo.findById(profile.facilityId);
        const title = facility ? `${facility.name} (Hospital Profile)` : `Hospital Profile (${profile.id})`;

        let currentValue: string | null = null;
        if (fieldEligible) {
          if (targetField === 'bedCapacityTotal') {
            currentValue = String(profile.bedCapacityTotal);
          } else if (targetField === 'icuBedCapacity') {
            currentValue = String(profile.icuBedCapacity);
          } else if (targetField === 'emergencyIntakeOperational') {
            currentValue = profile.emergencyIntakeOperational ? 'true' : 'false';
          } else if (targetField === 'isMedicalCollege') {
            currentValue = profile.isMedicalCollege ? 'true' : 'false';
          } else if (targetField === 'accreditationSummary') {
            currentValue = profile.accreditationSummary ?? null;
          }
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: title,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: profile.currentRevisionId || `${profile.id}:${profile.updatedAt}`,
          dataOrigin: profile.dataOrigin,
          exists: true,
          fieldEligible,
        };
      }

      case 'DOCTOR': {
        const doctor = await this.repo.getDoctorById(targetEntityId);
        if (!doctor) return fallbackResult;

        let currentValue: string | null = null;
        if (fieldEligible) {
          if (targetField === 'opdTimings') {
            currentValue = doctor.opdTimings ?? null;
          } else if (targetField === 'qualifications') {
            currentValue = doctor.qualifications;
          } else if (targetField === 'department') {
            currentValue = doctor.department ?? null;
          } else if (targetField === 'registrationReference') {
            currentValue = doctor.registrationReference ?? null;
          } else if (targetField === 'consultationFee') {
            currentValue = doctor.consultationFee !== undefined ? String(doctor.consultationFee) : null;
          }
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: `${doctor.name} (${doctor.title})`,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: `${doctor.id}:${doctor.updatedAt}`,
          dataOrigin: doctor.dataOrigin,
          exists: true,
          fieldEligible,
        };
      }

      case 'SPECIALTY': {
        const specialty =
          (await this.repo.getSpecialtyById(targetEntityId)) ||
          (await this.repo.getSpecialtyBySlug(targetEntityId));
        if (!specialty) return fallbackResult;

        let currentValue: string | null = null;
        if (fieldEligible && targetField === 'description') {
          currentValue = specialty.description ?? null;
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: `Specialty: ${specialty.name}`,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: `${specialty.id}`,
          dataOrigin: 'SYNTHETIC_DEMO',
          exists: true,
          fieldEligible,
        };
      }

      case 'SERVICE': {
        const services = await this.repo.listServices();
        const svc = services.find((s) => s.id === targetEntityId || s.slug === targetEntityId);

        let operationalNotes: string | null = null;
        let is24x7 = false;
        let title = svc ? `Service: ${svc.name}` : `Service (${targetEntityId})`;

        const allFacilities = await this.repo.findMany();
        let matchedRel: { operationalNotes?: string; is24x7: boolean; dataOrigin: string; id: string; updatedAt: string } | null = null;

        for (const f of allFacilities) {
          const rels = await this.repo.getFacilityServices(f.id);
          const r = rels.find((rel) => rel.id === targetEntityId || rel.serviceId === targetEntityId);
          if (r) {
            matchedRel = r;
            operationalNotes = r.operationalNotes ?? null;
            is24x7 = r.is24x7;
            const relatedSvc = services.find((s) => s.id === r.serviceId);
            if (relatedSvc) title = `Service: ${relatedSvc.name} at ${f.name}`;
            break;
          }
        }

        if (!svc && !matchedRel) return fallbackResult;

        let currentValue: string | null = null;
        if (fieldEligible) {
          if (targetField === 'operationalNotes') {
            currentValue = operationalNotes ?? svc?.description ?? null;
          } else if (targetField === 'is24x7') {
            currentValue = is24x7 ? 'true' : 'false';
          }
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: title,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: matchedRel ? `${matchedRel.id}:${matchedRel.updatedAt}` : `${svc?.id}`,
          dataOrigin: (matchedRel?.dataOrigin as DataOrigin) ?? 'SYNTHETIC_DEMO',
          exists: true,
          fieldEligible,
        };
      }

      case 'SCHEME': {
        const schemes = await this.repo.listSchemes();
        const scheme = schemes.find(
          (s) => s.id === targetEntityId || s.code === targetEntityId || s.slug === targetEntityId
        );

        let matchedSchemeRel: { helpdeskLocation?: string; empanelmentCategory?: string; dataOrigin: string; id: string; updatedAt: string } | null = null;
        let title = scheme ? `Scheme: ${scheme.name}` : `Scheme (${targetEntityId})`;

        const allFacilities = await this.repo.findMany();
        for (const f of allFacilities) {
          const rels = await this.repo.getFacilitySchemes(f.id);
          const r = rels.find((rel) => rel.id === targetEntityId || rel.schemeId === scheme?.id);
          if (r) {
            matchedSchemeRel = r;
            const relatedScheme = schemes.find((s) => s.id === r.schemeId);
            if (relatedScheme) title = `Scheme: ${relatedScheme.name} at ${f.name}`;
            break;
          }
        }

        if (!scheme && !matchedSchemeRel) return fallbackResult;

        let currentValue: string | null = null;
        if (fieldEligible) {
          if (targetField === 'helpdeskLocation') {
            currentValue = matchedSchemeRel?.helpdeskLocation ?? null;
          } else if (targetField === 'empanelmentCategory') {
            currentValue = matchedSchemeRel?.empanelmentCategory ?? null;
          }
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: title,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: matchedSchemeRel ? `${matchedSchemeRel.id}:${matchedSchemeRel.updatedAt}` : `${scheme?.id}`,
          dataOrigin: (matchedSchemeRel?.dataOrigin as DataOrigin) ?? 'SYNTHETIC_DEMO',
          exists: true,
          fieldEligible,
        };
      }

      case 'TARIFF': {
        const allTariffs = await this.repo.listAllTariffs();
        const tariff = allTariffs.find((t) => t.id === targetEntityId);
        if (!tariff) return fallbackResult;

        let currentValue: string | null = null;
        if (fieldEligible) {
          if (targetField === 'amount') {
            currentValue = String(tariff.amount);
          } else if (targetField === 'unit') {
            currentValue = tariff.unit;
          } else if (targetField === 'notes') {
            currentValue = tariff.notes ?? null;
          } else if (targetField === 'effectiveTo') {
            currentValue = tariff.effectiveTo ?? null;
          }
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: `Tariff Item: INR ${tariff.amount} / ${tariff.unit}`,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: `${tariff.id}:${tariff.updatedAt}`,
          dataOrigin: tariff.dataOrigin,
          exists: true,
          fieldEligible,
        };
      }

      case 'AVAILABILITY': {
        const facilities = await this.repo.findMany();
        let matchedRecord: { id: string; capabilityType: string; contextNotes?: string; dataOrigin: DataOrigin; observedAt: string } | null = null;

        for (const f of facilities) {
          const records = await this.repo.getHistory(f.id, 50);
          const found = records.find((r) => r.id === targetEntityId);
          if (found) {
            matchedRecord = found;
            break;
          }
        }

        if (!matchedRecord) return fallbackResult;

        let currentValue: string | null = null;
        if (fieldEligible && targetField === 'contextNotes') {
          currentValue = matchedRecord.contextNotes ?? null;
        }

        return {
          targetEntityType,
          targetEntityId,
          targetTitle: `Availability: ${matchedRecord.capabilityType}`,
          targetField,
          fieldLabel,
          currentValue,
          currentRevisionId: `${matchedRecord.id}:${matchedRecord.observedAt}`,
          dataOrigin: matchedRecord.dataOrigin,
          exists: true,
          fieldEligible,
        };
      }

      default:
        return fallbackResult;
    }
  }

  async getTargetEntity(
    targetEntityType: CorrectionTargetEntityType,
    targetEntityId: string
  ): Promise<unknown | null> {
    switch (targetEntityType) {
      case 'FACILITY':
        return this.repo.findById(targetEntityId);
      case 'HOSPITAL_PROFILE':
        return this.repo.getProfileByFacilityId(targetEntityId);
      case 'DOCTOR':
        return this.repo.getDoctorById(targetEntityId);
      case 'SPECIALTY':
        return this.repo.getSpecialtyById(targetEntityId);
      case 'TARIFF': {
        const all = await this.repo.listAllTariffs();
        return all.find((t) => t.id === targetEntityId) ?? null;
      }
      default:
        return null;
    }
  }

  async applyFieldUpdate(
    targetEntityType: CorrectionTargetEntityType,
    targetEntityId: string,
    targetField: string,
    newValue: string,
    newRevisionId?: string
  ): Promise<{ previousValue: string; updatedValue: string }> {
    const resolution = await this.resolveTarget(targetEntityType, targetEntityId, targetField);
    if (!resolution.exists) {
      throw new Error(`Cannot apply field update: Target ${targetEntityType} ${targetEntityId} does not exist`);
    }

    const previousValue = resolution.currentValue ?? '';
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    switch (targetEntityType) {
      case 'FACILITY': {
        const facility = await this.repo.findById(targetEntityId);
        if (!facility) throw new Error(`Facility ${targetEntityId} not found`);

        if (targetField === 'operatingHours') {
          updates.operatingHours = newValue;
        } else if (targetField.startsWith('contact.')) {
          const contactKey = targetField.replace('contact.', '');
          updates.contact = {
            [contactKey]: newValue,
          };
        } else if (targetField.startsWith('location.')) {
          const locKey = targetField.replace('location.', '');
          updates.location = {
            [locKey]: newValue,
          };
        }
        break;
      }

      case 'HOSPITAL_PROFILE': {
        const profile = await this.repo.getProfileByFacilityId(targetEntityId);
        if (!profile) throw new Error(`Hospital profile for ${targetEntityId} not found`);

        if (targetField === 'bedCapacityTotal') {
          updates.bedCapacityTotal = parseInt(newValue, 10) || 0;
        } else if (targetField === 'icuBedCapacity') {
          updates.icuBedCapacity = parseInt(newValue, 10) || 0;
        } else if (targetField === 'emergencyIntakeOperational') {
          updates.emergencyIntakeOperational = newValue.toLowerCase() === 'true';
        } else if (targetField === 'isMedicalCollege') {
          updates.isMedicalCollege = newValue.toLowerCase() === 'true';
        } else if (targetField === 'accreditationSummary') {
          updates.accreditationSummary = newValue;
        }
        break;
      }

      case 'DOCTOR': {
        if (targetField === 'consultationFee') {
          updates.consultationFee = parseInt(newValue, 10) || 0;
        } else {
          updates[targetField] = newValue;
        }
        break;
      }

      case 'TARIFF': {
        if (targetField === 'amount') {
          updates.amount = parseFloat(newValue) || 0;
        } else {
          updates[targetField] = newValue;
        }
        break;
      }

      default: {
        updates[targetField] = newValue;
        break;
      }
    }

    const revisionId = newRevisionId || `rev-${Date.now()}`;
    await this.repo.applyRevisionUpdate(
      targetEntityType,
      targetEntityId,
      updates,
      revisionId
    );

    return { previousValue, updatedValue: newValue };
  }
}
