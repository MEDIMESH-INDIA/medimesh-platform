/**
 * Canonical profile completeness calculation for MEDIMESH patients.
 * 
 * Accounts for core personal identity and contact fields.
 * Optional medical profile information (blood group, allergies, etc.) and
 * emergency contacts do NOT block 100% account completeness for ordinary use,
 * but are tracked as additional enrichment data.
 */

export function calculateProfileCompleteness(profile) {
  const coreFields = [
    { key: 'display_name', label: 'Display name', completed: Boolean(profile?.display_name?.trim()) },
    { key: 'phone', label: 'Contact phone', completed: Boolean(profile?.phone?.trim()) },
    { key: 'city', label: 'City', completed: Boolean(profile?.city?.trim()) },
    { key: 'country', label: 'Country', completed: Boolean(profile?.country?.trim()) },
  ];

  const completedCoreCount = coreFields.filter(f => f.completed).length;
  const percentage = Math.round((completedCoreCount / coreFields.length) * 100);
  const missingCoreFields = coreFields.filter(f => !f.completed).map(f => f.label);

  return {
    percentage,
    completedCount: completedCoreCount,
    totalCount: coreFields.length,
    missingFields: missingCoreFields,
    isComplete: completedCoreCount === coreFields.length,
    fields: coreFields,
  };
}

