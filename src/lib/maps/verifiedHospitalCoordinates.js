/**
 * MEDIMESH Candidate Hospital Coordinate Overrides Registry
 *
 * Contains candidate coordinate overrides for hospitals where legacy database
 * entries had coarse locality centroids or demonstrable displacement.
 *
 * IMPORTANT (Coordinate Trust Contract):
 * These overrides represent candidate geolocations awaiting formal ground-truth
 * verification and evidence ingestion. Under the coordinate trust contract,
 * entries from this registry are tagged with origin: 'override' and status: 'unverified'
 * until verified evidence is ingested into hospital_evidence.
 */

export const VERIFIED_HOSPITAL_COORDINATES = {
  // 1. Life Line Hospital & Medical Research Centre (Panvel)
  // Fix: Was previously set to Sanpada (19.067579, 73.012303), over 12km away from Panvel.
  '06ceccf9-f578-4ac7-aabe-d3ee7e26ce6e': {
    latitude: 18.991176,
    longitude: 73.115263,
    note: 'Sai Arcade, Shivaji Road, opposite S.T. Bus Stand, Panvel',
  },
  'life-line-hospital-medical-research-centre': {
    latitude: 18.991176,
    longitude: 73.115263,
  },

  // 2. Ashtvinayak Hospitals Private Limited (New Panvel)
  // Fix: Was previously set to Old Panvel city centroid (18.9861, 73.1111), ~3.5km away.
  'e4d009e1-65b3-41b1-8951-456afd7244ee': {
    latitude: 19.010551,
    longitude: 73.107588,
    note: 'Plot No. 10, Sector 6, Khanda Colony, near Khandeshwar Lake, New Panvel West',
  },
  'ashtvinayak-hospitals-private-limited': {
    latitude: 19.010551,
    longitude: 73.107588,
  },

  // 3. Terna Speciality Hospital & Research Centre (Nerul West)
  // Fix: Was previously grouped with Shushrusha on generic Nerul centroid (19.033594, 73.018164).
  '3527b125-e4c6-4aa2-a323-694f52f0f0ed': {
    latitude: 19.0314,
    longitude: 73.0161,
    note: 'Plot No. 12, Sector 22, Opp. Nerul Railway Station, Nerul West',
  },
  'terna-speciality-hospital-research-centre': {
    latitude: 19.0314,
    longitude: 73.0161,
  },

  // 4. Shushrusha Heart Care Centre & Speciality Hospital (Nerul)
  // Fix: Was previously grouped with Terna on generic Nerul centroid (19.033594, 73.018164).
  '1cd24430-5530-472f-a55d-acdbb35b68bf': {
    latitude: 19.04327,
    longitude: 73.00951,
    note: 'Plot No. 22-A, Sector 6, Phase III, Palm Beach Road, Nerul',
  },
  'shushrusha-heart-care-centre-speciality-hospital': {
    latitude: 19.04327,
    longitude: 73.00951,
  },

  // 5. NMMC General Hospital Nerul (Nerul)
  // Fix: Was previously grouped with Terna on generic Nerul centroid (19.033594, 73.018164).
  '3c518eac-7b9e-4fe3-beb4-a7057745f128': {
    latitude: 19.03416,
    longitude: 73.02077,
    note: 'Maasaheb Meenatai Thackeray Hospital, Sector 15, Nerul',
  },
  'nmmc-general-hospital-nerul': {
    latitude: 19.03416,
    longitude: 73.02077,
  },

  // 6. MPCT Hospital (Sanpada)
  // Fix: Was previously sharing Sanpada centroid with Suraj Hospital (19.065977, 73.009533).
  '02344e48-6505-4d10-86f9-ce7e33bc7692': {
    latitude: 19.0606,
    longitude: 73.014,
    note: 'Plot No. 7, Sector 4, Sanpada',
  },
  'mpct-hospital': {
    latitude: 19.0606,
    longitude: 73.014,
  },

  // 7. Dr. R.N. Patil\'s Suraj Hospital (Sanpada)
  // Fix: Was previously sharing Sanpada centroid with MPCT Hospital (19.065977, 73.009533).
  '995b9de8-349a-4d9d-8396-8b8916e51812': {
    latitude: 19.057467,
    longitude: 73.011009,
    note: 'Plot No. 1 & 1A, Sun Palm View Building, Sector 15, Sanpada',
  },
  'dr-r-n-patils-suraj-hospital': {
    latitude: 19.057467,
    longitude: 73.011009,
  },

  // 8. MITR Hospital (Kharghar)
  // Fix: Was previously sharing generic Kharghar centroid with Polaris (19.025773, 73.059185).
  'a08a625c-fd27-4ab6-93ea-6669bc4f0fc0': {
    latitude: 19.063023,
    longitude: 73.070042,
    note: 'Plot 37, Eden Garden CHS, Sector 5, Kharghar',
  },
  'mitr-hospital': {
    latitude: 19.063023,
    longitude: 73.070042,
  },

  // 9. Polaris Hospital (Kharghar)
  // Fix: Was previously sharing generic Kharghar centroid with MITR (19.025773, 73.059185).
  '98f8c868-1d9c-426d-9d57-19dc99fff98c': {
    latitude: 19.04793,
    longitude: 73.07308,
    note: 'Plot 19/C, Sector 20, Kharghar',
  },
  'polaris-hospital': {
    latitude: 19.04793,
    longitude: 73.07308,
  },

  // 10. NMMC General Hospital Vashi (Vashi)
  // Fix: Was previously sharing Vashi centroid with ESIS and Jijamata (19.063248, 72.998797).
  'c617386a-9fad-4817-9e57-2d11e3dea73f': {
    latitude: 19.0744,
    longitude: 72.9978,
    note: 'Sector 10A, Mini Seashore Road, Vashi',
  },
  'nmmc-general-hospital-vashi': {
    latitude: 19.0744,
    longitude: 72.9978,
  },

  // 11. ESIS Hospital Vashi (Vashi)
  // Fix: Was previously sharing Vashi centroid with NMMC and Jijamata (19.063248, 72.998797).
  '234dad87-1e98-4230-8c69-dee6e3db6b77': {
    latitude: 19.0742,
    longitude: 72.9908,
    note: 'Sector 5, Vashi',
  },
  'esis-hospital-vashi': {
    latitude: 19.0742,
    longitude: 72.9908,
  },

  // 12. Jijamata Hospital (Vashi)
  // Fix: Was previously sharing Vashi centroid with NMMC and ESIS (19.063248, 72.998797).
  'b3027259-b91f-4a38-95c8-542e4d416559': {
    latitude: 19.0778,
    longitude: 72.9944,
    note: 'Sector 9, Vashi',
  },
  'jijamata-hospital': {
    latitude: 19.0778,
    longitude: 72.9944,
  },
};

/**
 * Returns candidate facility coordinates for a hospital by id or slug if one exists.
 * Preserves the original database coordinates whenever no correction override is needed.
 * Returned entry includes origin: 'override' to distinguish it from database records.
 */
export function getVerifiedHospitalCoordinates(id, slug) {
  let matched = null;
  if (id && VERIFIED_HOSPITAL_COORDINATES[id]) {
    matched = VERIFIED_HOSPITAL_COORDINATES[id];
  } else if (slug && VERIFIED_HOSPITAL_COORDINATES[slug]) {
    matched = VERIFIED_HOSPITAL_COORDINATES[slug];
  }

  if (!matched) return null;

  return {
    ...matched,
    origin: 'override',
  };
}

export const getHospitalCoordinateOverride = getVerifiedHospitalCoordinates;

