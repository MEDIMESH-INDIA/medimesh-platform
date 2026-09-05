export function formatHospitalType(type) {
  if (!type) return 'Type not provided';
  const mapping = {
    'general_hospital': 'General Hospital',
    'speciality_hospital': 'Speciality Hospital',
    'multispeciality': 'Multi-Speciality Hospital',
    'mother_child_health_center': 'Mother & Child Health Centre',
    'nursing_home': 'Nursing Home',
    'trauma_care': 'Trauma Care'
  };
  return mapping[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatReviewStatus(status) {
  if (!status) return 'Unreviewed';
  const mapping = {
    'source_matched': 'Source matched',
    'manually_reviewed': 'Verified',
    'demonstration': 'Demonstration',
    'self_reported': 'Self reported'
  };
  return mapping[status] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
