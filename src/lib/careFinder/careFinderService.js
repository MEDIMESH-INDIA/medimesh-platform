/**
 * MEDIMESH Care Finder Service
 * 
 * Orchestrates Care Finder discovery requests using the canonical hospital repository.
 * Connects user criteria to server-side query filters, runs explainable matching,
 * and preserves source transparency and coordinate trust boundaries.
 */

import { getHospitalFacets, searchHospitals } from '../data/hospitalRepository.js';
import { matchHospitals } from './careFinderMatching.js';

export const POPULAR_CARE_CATEGORIES = [
  { name: 'Cardiology', description: 'Heart, blood vessels, and cardiovascular health' },
  { name: 'Orthopedics', description: 'Bones, joints, spine, and musculoskeletal care' },
  { name: 'Neurology', description: 'Brain, nervous system, and neurological disorders' },
  { name: 'Pediatrics', description: 'Medical care, diagnostics, and health for children' },
  { name: 'Oncology', description: 'Cancer diagnosis, treatment, and ongoing care' },
  { name: 'General Medicine', description: 'Adult primary care, diagnostics, and internal medicine' },
  { name: 'Obstetrics & Gynecology', description: 'Maternity, prenatal, and women’s health' },
  { name: 'Critical Care', description: 'Intensive medical care for acute and life-threatening conditions' },
];

/**
 * Retrieves available directory options and taxonomies for Care Finder.
 * Reuses the canonical hospital facets so choices are grounded in real data.
 */
export async function getCareFinderOptions({ mode = 'canonical' } = {}) {
  const facets = await getHospitalFacets({ mode });

  // Map known categories with available specialties in the database
  const availableSpecialtySet = new Set((facets.specialties || []).map(s => s.toLowerCase()));

  const categories = POPULAR_CARE_CATEGORIES.map(cat => ({
    ...cat,
    availableInCatalog: availableSpecialtySet.has(cat.name.toLowerCase()),
  }));

  // Also include any other specialties from the catalog not in popular list
  const popularNames = new Set(POPULAR_CARE_CATEGORIES.map(c => c.name.toLowerCase()));
  const additionalSpecialties = (facets.specialties || [])
    .filter(s => !popularNames.has(s.toLowerCase()))
    .map(name => ({
      name,
      description: `${name} clinical specialty services`,
      availableInCatalog: true,
    }));

  return {
    categories: [...categories, ...additionalSpecialties],
    cities: facets.cities || [],
    localities: facets.localities || [],
    cityToLocalities: facets.cityToLocalities || {},
    facilities: facets.facilities || [],
    types: facets.types || [],
  };
}

/**
 * Executes a Care Finder search and explainable matching workflow.
 * 
 * @param {object} options
 * @param {Array<object>} options.criteria Active user criteria list
 * @param {string} [options.mode='canonical']
 * @returns {Promise<object>} Match evaluation results
 */
export async function executeCareFinder({ criteria = [], mode = 'canonical' } = {}) {
  // Extract server-side pushable filters
  const cityCrit = criteria.find(c => c.type === 'city');
  const localityCrit = criteria.find(c => c.type === 'locality');

  const serverFilters = {};
  if (cityCrit && cityCrit.value) {
    serverFilters.city = cityCrit.value;
  }
  if (localityCrit && localityCrit.value) {
    serverFilters.locality = localityCrit.value;
  }

  // Fetch published hospitals from canonical repository
  const { hospitals } = await searchHospitals({
    mode,
    filters: serverFilters,
    pageSize: 100, // Fetch candidates in target area
  });

  // Evaluate through explainable matching engine
  const matchResult = matchHospitals(hospitals, criteria);

  return {
    ...matchResult,
    criteriaUsed: criteria,
    serverFiltersApplied: serverFilters,
  };
}

