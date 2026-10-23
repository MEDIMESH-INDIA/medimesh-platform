/**
 * MEDIMESH Care Finder — Explainable Matching Domain Module
 * 
 * Pure, deterministic matching engine for patient-guided hospital discovery.
 * 
 * Strict Invariants:
 * 1. Missing data is NEVER treated as a match.
 * 2. Missing data is NEVER silently interpreted as false or an explicit absence.
 * 3. Mandatory criteria determine match disposition: confirmed, unconfirmed, or excluded.
 * 4. Preferences contribute to transparent preference ordering, not hard exclusion.
 * 5. Unverified coordinates are NEVER used for geographic ranking.
 * 6. Hospital names are NEVER used to infer clinical specialties.
 * 7. Verification status is NEVER used as a proxy for clinical quality.
 * 8. Explanations are generated directly from factual criterion evaluations.
 */

export const EVALUATION_STATUS = {
  MATCH: 'match',
  DOES_NOT_MATCH: 'does_not_match',
  UNKNOWN: 'unknown',
  NOT_APPLICABLE: 'not_applicable',
};

export const MATCH_DISPOSITION = {
  CONFIRMED: 'confirmed',       // All selected mandatory criteria are evaluated as MATCH
  UNCONFIRMED: 'unconfirmed',   // At least one mandatory criterion is UNKNOWN; none are DOES_NOT_MATCH
  EXCLUDED: 'excluded',         // At least one mandatory criterion is DOES_NOT_MATCH
};

export const CRITERION_MODE = {
  MANDATORY: 'mandatory',
  PREFERENCE: 'preference',
};

const normalizeString = val => (typeof val === 'string' ? val.trim().toLowerCase() : '');

const includesCaseInsensitive = (arr, target) => {
  if (!Array.isArray(arr) || !target) return false;
  const targetNorm = normalizeString(target);
  return arr.some(item => normalizeString(item) === targetNorm);
};

/**
 * Evaluates an individual criterion against a normalized hospital record.
 * 
 * @param {object} hospital Normalized hospital object
 * @param {object} criterion Definition of criterion { id, type, value, mode, label }
 * @returns {{ id: string, label: string, type: string, mode: string, status: string, explanation: string }}
 */
export function evaluateCriterion(hospital, criterion) {
  const { id, type, value, mode = CRITERION_MODE.PREFERENCE, label } = criterion;
  const h = hospital || {};
  const metrics = h.metrics || {};
  const location = h.location || {};
  const specialties = Array.isArray(h.specialties) ? h.specialties : [];
  const facilities = Array.isArray(h.facilities) ? h.facilities : [];
  const services = Array.isArray(h.services) ? h.services : [];

  let status = EVALUATION_STATUS.NOT_APPLICABLE;
  let explanation = '';

  switch (type) {
    case 'specialty': {
      if (!value) {
        status = EVALUATION_STATUS.NOT_APPLICABLE;
        explanation = 'No specialty requested.';
        break;
      }
      if (specialties.length === 0) {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = 'Specialties have not been provided in this directory record.';
      } else if (includesCaseInsensitive(specialties, value)) {
        status = EVALUATION_STATUS.MATCH;
        explanation = `${value} specialty is listed in the hospital profile.`;
      } else {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = `Does not list ${value} among published specialties.`;
      }
      break;
    }

    case 'city': {
      if (!value) {
        status = EVALUATION_STATUS.NOT_APPLICABLE;
        explanation = 'No city filter specified.';
        break;
      }
      const city = location.city;
      if (!city) {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = 'City location has not been provided in this directory record.';
      } else if (normalizeString(city) === normalizeString(value)) {
        status = EVALUATION_STATUS.MATCH;
        explanation = `Located in ${city}.`;
      } else {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = `Located in ${city}, outside requested city (${value}).`;
      }
      break;
    }

    case 'locality': {
      if (!value) {
        status = EVALUATION_STATUS.NOT_APPLICABLE;
        explanation = 'No locality filter specified.';
        break;
      }
      const locality = location.locality;
      if (!locality) {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = 'Locality has not been provided in this directory record.';
      } else if (normalizeString(locality) === normalizeString(value)) {
        status = EVALUATION_STATUS.MATCH;
        explanation = `Located in ${locality}.`;
      } else {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = `Located in ${locality}, outside requested locality (${value}).`;
      }
      break;
    }

    case 'emergency': {
      const emergencyVal = metrics.emergency;
      const hasEmergencyFacility = includesCaseInsensitive(facilities, 'Emergency Department')
        || includesCaseInsensitive(services, 'Emergency Care');

      if (emergencyVal === false) {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = 'Emergency department is listed as unavailable.';
      } else if (emergencyVal === true || hasEmergencyFacility) {
        status = EVALUATION_STATUS.MATCH;
        explanation = '24/7 Emergency department confirmed available.';
      } else {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = 'Emergency department availability has not been reported.';
      }
      break;
    }

    case 'ambulance': {
      const ambulanceVal = metrics.ambulance;
      const hasAmbulanceService = includesCaseInsensitive(services, 'Ambulance Services')
        || includesCaseInsensitive(facilities, 'Ambulance');

      if (ambulanceVal === false) {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = 'Ambulance service is listed as unavailable.';
      } else if (ambulanceVal === true || hasAmbulanceService) {
        status = EVALUATION_STATUS.MATCH;
        explanation = 'Ambulance service confirmed available.';
      } else {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = 'Ambulance availability has not been reported.';
      }
      break;
    }

    case 'icu': {
      const icuBeds = metrics.icuBeds;
      const hasIcuFacility = includesCaseInsensitive(facilities, 'Intensive Care Unit')
        || includesCaseInsensitive(facilities, 'ICU');

      if ((typeof icuBeds === 'number' && icuBeds > 0) || hasIcuFacility) {
        status = EVALUATION_STATUS.MATCH;
        explanation = typeof icuBeds === 'number' && icuBeds > 0
          ? `Intensive Care Unit confirmed (${icuBeds} ICU beds listed).`
          : 'Intensive Care Unit infrastructure confirmed.';
      } else if (icuBeds === 0) {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = 'Zero ICU beds reported for this facility.';
      } else {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = 'ICU capacity has not been reported in this directory record.';
      }
      break;
    }

    case 'facility': {
      if (!value) {
        status = EVALUATION_STATUS.NOT_APPLICABLE;
        explanation = 'No facility requested.';
        break;
      }
      if (facilities.length === 0) {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = `Facility infrastructure data has not been provided. Cannot confirm ${value}.`;
      } else if (includesCaseInsensitive(facilities, value)) {
        status = EVALUATION_STATUS.MATCH;
        explanation = `${value} is listed in hospital facilities.`;
      } else {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = `${value} is not listed among published facilities.`;
      }
      break;
    }

    case 'service': {
      if (!value) {
        status = EVALUATION_STATUS.NOT_APPLICABLE;
        explanation = 'No service requested.';
        break;
      }
      if (services.length === 0) {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = `Services catalog has not been provided. Cannot confirm ${value}.`;
      } else if (includesCaseInsensitive(services, value)) {
        status = EVALUATION_STATUS.MATCH;
        explanation = `${value} service confirmed.`;
      } else {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = `${value} is not listed in published services.`;
      }
      break;
    }

    case 'hospital_type': {
      if (!value) {
        status = EVALUATION_STATUS.NOT_APPLICABLE;
        explanation = 'No hospital type requested.';
        break;
      }
      const typeVal = h.type;
      if (!typeVal) {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = 'Hospital type has not been specified.';
      } else if (normalizeString(typeVal) === normalizeString(value)) {
        status = EVALUATION_STATUS.MATCH;
        explanation = `Hospital type matches: ${typeVal}.`;
      } else {
        status = EVALUATION_STATUS.DOES_NOT_MATCH;
        explanation = `Hospital type (${typeVal}) does not match requested type (${value}).`;
      }
      break;
    }

    case 'min_beds': {
      const min = Number(value);
      if (!Number.isFinite(min) || min <= 0) {
        status = EVALUATION_STATUS.NOT_APPLICABLE;
        explanation = 'Invalid bed threshold.';
        break;
      }
      const totalBeds = metrics.totalBeds;
      if (typeof totalBeds === 'number') {
        if (totalBeds >= min) {
          status = EVALUATION_STATUS.MATCH;
          explanation = `Total bed capacity (${totalBeds}) satisfies minimum requirement of ${min}.`;
        } else {
          status = EVALUATION_STATUS.DOES_NOT_MATCH;
          explanation = `Total bed capacity (${totalBeds}) is below requested minimum of ${min}.`;
        }
      } else {
        status = EVALUATION_STATUS.UNKNOWN;
        explanation = `Bed capacity is not published. Cannot verify minimum of ${min} beds.`;
      }
      break;
    }

    default:
      status = EVALUATION_STATUS.NOT_APPLICABLE;
      explanation = `Unsupported criterion type: ${type}`;
  }

  return {
    id: id || `${type}_${value || 'default'}`,
    label: label || value || type,
    type,
    mode,
    status,
    explanation,
  };
}

/**
 * Evaluates a hospital against a full set of user criteria.
 * Separates mandatory criteria and preferences, and generates human-readable explanations.
 * 
 * @param {object} hospital Normalized hospital object
 * @param {Array<object>} criteria Array of criterion objects
 * @returns {object} Match evaluation result
 */
export function evaluateHospitalMatch(hospital, criteria = []) {
  const activeCriteria = (Array.isArray(criteria) ? criteria : []).filter(c => c && c.type);

  if (activeCriteria.length === 0) {
    // No criteria selected: all published hospitals are neutral confirmed matches
    return {
      hospital,
      disposition: MATCH_DISPOSITION.CONFIRMED,
      evaluations: [],
      matchedCriteriaCount: 0,
      matchedPreferencesCount: 0,
      totalPreferencesCount: 0,
      preferenceScore: 0,
      confirmedExplanations: ['Included in directory search without specific constraints.'],
      unknownExplanations: [],
      excludedExplanations: [],
      provenanceSummary: buildProvenanceSummary(hospital),
    };
  }

  const evaluations = activeCriteria.map(c => evaluateCriterion(hospital, c));

  const mandatoryEvaluations = evaluations.filter(e => e.mode === CRITERION_MODE.MANDATORY);
  const preferenceEvaluations = evaluations.filter(e => e.mode === CRITERION_MODE.PREFERENCE);

  // Check mandatory outcomes
  const hasMandatoryRejection = mandatoryEvaluations.some(e => e.status === EVALUATION_STATUS.DOES_NOT_MATCH);
  const hasMandatoryUnknown = mandatoryEvaluations.some(e => e.status === EVALUATION_STATUS.UNKNOWN);

  let disposition;
  if (hasMandatoryRejection) {
    disposition = MATCH_DISPOSITION.EXCLUDED;
  } else if (hasMandatoryUnknown) {
    disposition = MATCH_DISPOSITION.UNCONFIRMED;
  } else {
    disposition = MATCH_DISPOSITION.CONFIRMED;
  }

  const matchedCriteriaCount = evaluations.filter(e => e.status === EVALUATION_STATUS.MATCH).length;
  const matchedPreferencesCount = preferenceEvaluations.filter(e => e.status === EVALUATION_STATUS.MATCH).length;
  const totalPreferencesCount = preferenceEvaluations.length;
  const preferenceScore = totalPreferencesCount > 0 ? (matchedPreferencesCount / totalPreferencesCount) : 0;

  const confirmedExplanations = evaluations
    .filter(e => e.status === EVALUATION_STATUS.MATCH)
    .map(e => e.explanation);

  const unknownExplanations = evaluations
    .filter(e => e.status === EVALUATION_STATUS.UNKNOWN)
    .map(e => e.explanation);

  const excludedExplanations = evaluations
    .filter(e => e.status === EVALUATION_STATUS.DOES_NOT_MATCH)
    .map(e => e.explanation);

  return {
    hospital,
    disposition,
    evaluations,
    matchedCriteriaCount,
    matchedPreferencesCount,
    totalPreferencesCount,
    preferenceScore,
    confirmedExplanations,
    unknownExplanations,
    excludedExplanations,
    provenanceSummary: buildProvenanceSummary(hospital),
  };
}

/**
 * Builds a source and evidence transparency summary for a hospital.
 */
function buildProvenanceSummary(hospital) {
  const provenance = hospital?.provenance;
  if (!provenance) {
    return {
      hasReviewedEvidence: false,
      reviewStatus: 'unreviewed',
      sourceName: 'Public medical directory',
      description: 'Public directory listing without independent verification.',
    };
  }

  const isReviewed = provenance.reviewStatus === 'manually_reviewed' || provenance.reviewStatus === 'source_matched';
  const checkedYear = provenance.checkedAt ? new Date(provenance.checkedAt).getFullYear() : null;

  return {
    hasReviewedEvidence: isReviewed,
    reviewStatus: provenance.reviewStatus || 'unreviewed',
    sourceName: provenance.sourceName || 'Indexed healthcare source',
    checkedAt: provenance.checkedAt,
    description: isReviewed
      ? `Verified against ${provenance.sourceName || 'official source'}${checkedYear ? ` (${checkedYear})` : ''}.`
      : `Sourced from ${provenance.sourceName || 'directory records'}. Not independently verified.`,
  };
}

/**
 * Matches a list of hospitals against criteria and groups them into:
 * 1. confirmedMatches: all mandatory criteria met, sorted by preference score then name.
 * 2. unconfirmedMatches: mandatory criteria unresolved due to missing data.
 * 3. excludedMatches: hospitals that explicitly contradicted mandatory criteria.
 * 
 * @param {Array<object>} hospitals Array of normalized hospital records
 * @param {Array<object>} criteria Array of criteria
 * @returns {{ confirmedMatches: Array, unconfirmedMatches: Array, excludedCount: number, totalEvaluated: number }}
 */
export function matchHospitals(hospitals = [], criteria = []) {
  const list = Array.isArray(hospitals) ? hospitals : [];
  const results = list.map(h => evaluateHospitalMatch(h, criteria));

  const confirmedMatches = results.filter(r => r.disposition === MATCH_DISPOSITION.CONFIRMED);
  const unconfirmedMatches = results.filter(r => r.disposition === MATCH_DISPOSITION.UNCONFIRMED);
  const excludedMatches = results.filter(r => r.disposition === MATCH_DISPOSITION.EXCLUDED);

  // Stable, deterministic sorting
  // 1. Confirmed: highest matched preferences first, then name ascending
  confirmedMatches.sort((a, b) => {
    if (b.matchedPreferencesCount !== a.matchedPreferencesCount) {
      return b.matchedPreferencesCount - a.matchedPreferencesCount;
    }
    return (a.hospital.name || '').localeCompare(b.hospital.name || '');
  });

  // 2. Unconfirmed: highest total matched criteria first, then name ascending
  unconfirmedMatches.sort((a, b) => {
    if (b.matchedCriteriaCount !== a.matchedCriteriaCount) {
      return b.matchedCriteriaCount - a.matchedCriteriaCount;
    }
    return (a.hospital.name || '').localeCompare(b.hospital.name || '');
  });

  return {
    confirmedMatches,
    unconfirmedMatches,
    excludedCount: excludedMatches.length,
    totalEvaluated: list.length,
  };
}
