import { supabase } from '../supabase/client';

const PROFILE_FIELDS = [
  'name',
  'legal_name',
  'hospital_type',
  'address_line_1',
  'address_line_2',
  'locality',
  'city',
  'district',
  'state',
  'country',
  'pin_code',
  'public_phone',
  'public_email',
  'website',
  'year_established',
  'total_beds',
  'icu_beds',
  'emergency_department',
  'ambulance_available',
];

const relationshipConfig = {
  specialties: {
    table: 'hospital_specialties',
    foreignKey: 'specialty_id',
    relation: 'specialties',
    select: 'specialty_id, source_evidence_id, specialties(id, slug, name, description)',
    insert: specialtyId => ({ specialty_id: specialtyId }),
  },
  facilities: {
    table: 'hospital_facilities',
    foreignKey: 'facility_id',
    relation: 'facilities',
    select: 'facility_id, availability_status, source_evidence_id, facilities(id, slug, name, description)',
    insert: facilityId => ({ facility_id: facilityId, availability_status: 'available' }),
  },
  services: {
    table: 'hospital_services_catalog',
    foreignKey: 'service_id',
    relation: 'services',
    select: 'service_id, availability_status, source_evidence_id, services(id, slug, name, description)',
    insert: serviceId => ({ service_id: serviceId, availability_status: 'available' }),
  },
};

function ensureNoError(response) {
  if (response.error) throw response.error;
  return response.data;
}

function normalizeRelationship(rows, kind) {
  const config = relationshipConfig[kind];
  return (rows || []).map(row => ({
    id: row[config.foreignKey],
    ...row[config.relation],
    availabilityStatus: row.availability_status ?? null,
    sourceBacked: Boolean(row.source_evidence_id),
  })).filter(item => item.id);
}

export async function getHospitalWorkspace(userId) {
  if (!userId) return { linked: false };

  const membership = ensureNoError(await supabase
    .from('hospital_memberships')
    .select('id, hospital_id, membership_role, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle());

  if (!membership?.hospital_id) return { linked: false };

  const hospitalId = membership.hospital_id;
  const [hospitalResult, organizationResult, specialtiesResult, facilitiesResult, servicesResult, evidenceResult, requestResult, directoryDoctorsResult, providerDoctorsResult] = await Promise.all([
    supabase.from('hospitals').select('*').eq('id', hospitalId).maybeSingle(),
    supabase.from('hospital_organizations').select('id, organization_name, slug, status').eq('hospital_id', hospitalId).maybeSingle(),
    supabase.from('hospital_specialties').select(relationshipConfig.specialties.select).eq('hospital_id', hospitalId),
    supabase.from('hospital_facilities').select(relationshipConfig.facilities.select).eq('hospital_id', hospitalId),
    supabase.from('hospital_services_catalog').select(relationshipConfig.services.select).eq('hospital_id', hospitalId),
    supabase.from('hospital_evidence').select('id, review_status, checked_at, public_notes, data_sources(name, source_type)').eq('hospital_id', hospitalId).order('checked_at', { ascending: false, nullsFirst: false }),
    supabase.from('verification_requests').select('id, status, request_type, submitted_at, reviewed_at').eq('subject_type', 'hospital').eq('subject_id', hospitalId).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('doctor_affiliations_directory').select('id, doctor_id, department, position, is_current, source_dataset, doctors(id, slug, full_name, specialization, verification_status, publication_status)').eq('hospital_id', hospitalId).order('created_at', { ascending: false }),
    supabase.from('doctor_hospital_affiliations').select('id, doctor_id, department, position, is_current, verification_status, doctor_profiles(doctor_id, slug, public_display_name, publication_status)').eq('hospital_id', hospitalId).order('created_at', { ascending: false }),
  ]);

  const hospital = ensureNoError(hospitalResult);
  if (!hospital) return { linked: false };

  return {
    linked: true,
    hospital,
    organization: ensureNoError(organizationResult),
    membership,
    specialties: normalizeRelationship(ensureNoError(specialtiesResult), 'specialties'),
    facilities: normalizeRelationship(ensureNoError(facilitiesResult), 'facilities'),
    services: normalizeRelationship(ensureNoError(servicesResult), 'services'),
    evidence: ensureNoError(evidenceResult) || [],
    verificationRequest: ensureNoError(requestResult),
    directoryDoctors: ensureNoError(directoryDoctorsResult) || [],
    providerDoctors: ensureNoError(providerDoctorsResult) || [],
  };
}

export async function updateHospitalProfile(hospitalId, values) {
  const updates = Object.fromEntries(
    PROFILE_FIELDS
      .filter(field => Object.prototype.hasOwnProperty.call(values, field))
      .map(field => [field, values[field]]),
  );

  return ensureNoError(await supabase
    .from('hospitals')
    .update(updates)
    .eq('id', hospitalId)
    .select('*')
    .single());
}

export async function getTaxonomy(kind) {
  const table = kind === 'specialties' ? 'specialties' : kind === 'facilities' ? 'facilities' : 'services';
  return ensureNoError(await supabase
    .from(table)
    .select('id, slug, name, description')
    .eq('active', true)
    .order('name')) || [];
}

export async function addHospitalRelationship(kind, hospitalId, itemId) {
  const config = relationshipConfig[kind];
  if (!config) throw new Error('Unsupported hospital relationship.');
  return ensureNoError(await supabase
    .from(config.table)
    .insert({ hospital_id: hospitalId, ...config.insert(itemId) })
    .select(config.select)
    .single());
}

export async function removeHospitalRelationship(kind, hospitalId, itemId) {
  const config = relationshipConfig[kind];
  if (!config) throw new Error('Unsupported hospital relationship.');
  const removed = ensureNoError(await supabase
    .from(config.table)
    .delete()
    .eq('hospital_id', hospitalId)
    .eq(config.foreignKey, itemId)
    .select(config.foreignKey));
  return Array.isArray(removed) && removed.length > 0;
}

export async function submitHospitalVerificationRequest(hospitalId, userId) {
  return ensureNoError(await supabase
    .from('verification_requests')
    .insert({
      subject_type: 'hospital',
      subject_id: hospitalId,
      submitted_by: userId,
      request_type: 'profile_verification',
    })
    .select('id, status, request_type, submitted_at, reviewed_at')
    .single());
}

export function getHospitalCompleteness(workspace) {
  const hospital = workspace?.hospital || {};
  const checks = [
    Boolean(hospital.name?.trim()),
    Boolean(hospital.hospital_type?.trim()),
    Boolean(hospital.locality?.trim() && hospital.city?.trim()),
    Boolean(hospital.address_line_1?.trim()),
    Boolean(hospital.public_phone?.trim() || hospital.public_email?.trim() || hospital.website?.trim()),
    (workspace?.specialties?.length || 0) > 0,
    (workspace?.facilities?.length || 0) > 0,
    (workspace?.services?.length || 0) > 0,
    hospital.total_beds != null || hospital.icu_beds != null,
    hospital.data_status === 'verified' || Boolean(workspace?.evidence?.some(item => ['source_matched', 'manually_reviewed'].includes(item.review_status))),
  ];
  const completed = checks.filter(Boolean).length;
  return { completed, total: checks.length, percentage: completed * 10 };
}

export function canManageHospital(workspace) {
  return ['owner', 'admin', 'editor'].includes(workspace?.membership?.membership_role);
}
