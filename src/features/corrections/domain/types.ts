/**
 * MEDIMESH INDIA 2.0 — Correction Domain Types & Whitelist
 *
 * Phase 07: Corrections + Trust
 *
 * Strictly defines:
 * 1. The 8 approved target entity types for public corrections.
 * 2. The explicit factual/descriptive field whitelist per entity type.
 * 3. Prohibited fields (clinical, diagnostic, ratings, rankings, scores, PHI, Aadhaar).
 * 4. Human-readable field metadata for correction submission UX.
 */

export type CorrectionStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFORMATION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'UNABLE_TO_VERIFY';

export type CorrectionTargetEntityType =
  | 'FACILITY'
  | 'HOSPITAL_PROFILE'
  | 'DOCTOR'
  | 'SPECIALTY'
  | 'SERVICE'
  | 'SCHEME'
  | 'TARIFF'
  | 'AVAILABILITY';

export interface WhitelistFieldDefinition {
  field: string;
  label: string;
  description: string;
}

/**
 * Explicit descriptive/public information fields whitelist.
 * ONLY factual, verifiable directory fields are allowed.
 * NO diagnostic, clinical, patient, rating, or ranking fields.
 */
export const CORRECTION_FIELD_WHITELIST: Record<
  CorrectionTargetEntityType,
  WhitelistFieldDefinition[]
> = {
  FACILITY: [
    {
      field: 'operatingHours',
      label: 'Operating Hours',
      description: 'Weekly schedule and daily casualty/OPD operational hours.',
    },
    {
      field: 'contact.primaryPhone',
      label: 'Primary Phone',
      description: 'Official reception or central switchboard telephone number.',
    },
    {
      field: 'contact.emergencyPhone',
      label: 'Emergency Phone',
      description: 'Casualty or 24x7 emergency helpline contact number.',
    },
    {
      field: 'contact.email',
      label: 'Public Email',
      description: 'Official public inquiries or administrative email address.',
    },
    {
      field: 'contact.websiteUrl',
      label: 'Website URL',
      description: 'Official institutional website address.',
    },
    {
      field: 'location.address',
      label: 'Physical Address',
      description: 'Street address and premises location description.',
    },
    {
      field: 'location.locality',
      label: 'Locality / Area',
      description: 'Neighborhood, landmark, or sub-district identifier.',
    },
  ],
  HOSPITAL_PROFILE: [
    {
      field: 'bedCapacityTotal',
      label: 'Total Bed Capacity',
      description: 'Sanctioned operational in-patient bed count.',
    },
    {
      field: 'icuBedCapacity',
      label: 'ICU Bed Capacity',
      description: 'Operational intensive care unit bed capacity.',
    },
    {
      field: 'emergencyIntakeOperational',
      label: 'Emergency Intake Operational Status',
      description: 'Whether 24x7 emergency intake and casualty reception is active.',
    },
    {
      field: 'isMedicalCollege',
      label: 'Medical College Status',
      description: 'Whether the institution functions as a teaching medical hospital.',
    },
    {
      field: 'accreditationSummary',
      label: 'Accreditation Summary',
      description: 'Reported accreditation standing (e.g., NABH, NABL).',
    },
  ],
  DOCTOR: [
    {
      field: 'opdTimings',
      label: 'OPD Timings',
      description: 'Out-patient clinic consultation days and hours.',
    },
    {
      field: 'qualifications',
      label: 'Qualifications',
      description: 'Medical degrees, diplomas, and certifications.',
    },
    {
      field: 'department',
      label: 'Department',
      description: 'Clinical department or division affiliation.',
    },
    {
      field: 'registrationReference',
      label: 'Public Registration Reference',
      description: 'State Medical Council or National Medical Commission registration reference.',
    },
    {
      field: 'consultationFee',
      label: 'Consultation Fee',
      description: 'Standard OPD consultation fee in INR.',
    },
  ],
  SPECIALTY: [
    {
      field: 'description',
      label: 'Specialty Scope Description',
      description: 'Factual public description of clinical specialty scope.',
    },
  ],
  SERVICE: [
    {
      field: 'operationalNotes',
      label: 'Operational Notes',
      description: 'Facility-specific operational guidance or testing prerequisites.',
    },
    {
      field: 'is24x7',
      label: '24x7 Operational Availability',
      description: 'Whether this service/diagnostic operates round-the-clock.',
    },
  ],
  SCHEME: [
    {
      field: 'helpdeskLocation',
      label: 'Helpdesk Location',
      description: 'Location of scheme helpdesk or Arogyamitra counter on premises.',
    },
    {
      field: 'empanelmentCategory',
      label: 'Empanelment Category',
      description: 'Designated empanelment tier or operational status under the scheme.',
    },
  ],
  TARIFF: [
    {
      field: 'amount',
      label: 'Tariff Amount',
      description: 'Published cost rate in INR.',
    },
    {
      field: 'unit',
      label: 'Rate Unit',
      description: 'Billing unit (e.g., per day, per investigation, per package).',
    },
    {
      field: 'notes',
      label: 'Tariff Scope Notes',
      description: 'Inclusions, exclusions, or preconditions on published tariff.',
    },
    {
      field: 'effectiveTo',
      label: 'Effective To Date',
      description: 'Expiration or scheduled revision date of published rate.',
    },
  ],
  AVAILABILITY: [
    {
      field: 'contextNotes',
      label: 'Context Notes',
      description: 'Non-guarantee contextual guidance on observed availability.',
    },
  ],
};

/**
 * Explicitly prohibited fields that must NEVER be accepted as correction targets.
 */
export const PROHIBITED_CORRECTION_FIELDS = [
  'diagnosis',
  'patientHistory',
  'prescription',
  'medicalRecord',
  'aadhaar',
  'phi',
  'clinicalOutcome',
  'rating',
  'ranking',
  'suitability',
  'recommendationScore',
  'qualityScore',
  'treatmentGuarantee',
  'admissionGuarantee',
  'cashlessGuarantee',
  'citizenAudit',
  'publicAuditRegistry',
  'civicValidation',
] as const;

/**
 * Validates whether a requested field is whitelisted for the given entity type.
 */
export function isAllowedCorrectionField(
  targetType: CorrectionTargetEntityType,
  field: string
): boolean {
  if (isProhibitedField(field)) {
    return false;
  }
  const allowed = CORRECTION_FIELD_WHITELIST[targetType];
  if (!allowed) return false;
  return allowed.some((f) => f.field === field);
}

/**
 * Checks if a field matches any prohibited clinical/ranking/private concepts.
 * Uses whole-token matching for single words and phrase matching for multi-word phrases
 * to prevent accidental false-positives (e.g. 'rating' inside 'operatingHours').
 */
export function isProhibitedField(field: string): boolean {
  const lower = field.toLowerCase();
  const normalizedField = field.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  const fieldWords = normalizedField.split(/[^a-z0-9]+/);

  return PROHIBITED_CORRECTION_FIELDS.some((prohibited) => {
    const pLower = prohibited.toLowerCase();
    if (lower === pLower) return true;

    const normalizedP = prohibited.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    if (normalizedP.includes(' ')) {
      return normalizedField.includes(normalizedP);
    }

    return fieldWords.includes(pLower);
  });
}

/**
 * Retrieves human-readable label for a whitelisted field.
 */
export function getFieldLabel(
  targetType: CorrectionTargetEntityType,
  field: string
): string {
  const list = CORRECTION_FIELD_WHITELIST[targetType];
  const item = list?.find((f) => f.field === field);
  return item ? item.label : field;
}

/**
 * Retrieves all eligible fields for an entity type.
 */
export function getAllowedFieldsForTarget(
  targetType: CorrectionTargetEntityType
): WhitelistFieldDefinition[] {
  return CORRECTION_FIELD_WHITELIST[targetType] ?? [];
}
