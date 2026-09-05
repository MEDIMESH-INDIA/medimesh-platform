// Shared normalizer for MEDIMESH hospital data
export function normalizeHospital(h, recordType = 'canonical') {
  const specs = h.hospital_specialties?.map(s => s.specialties?.name).filter(Boolean) || [];
  const facs = h.hospital_facilities?.map(f => f.facilities?.name).filter(Boolean) || [];
  
  // Provenance extraction rule:
  // 1. manually_reviewed, 2. source_matched, 3. self_reported, 4. unreviewed
  let source = null;
  if (h.hospital_evidence && h.hospital_evidence.length > 0) {
    const sorted = [...h.hospital_evidence].sort((a, b) => {
      const order = { manually_reviewed: 1, source_matched: 2, self_reported: 3, unreviewed: 4 };
      const rankA = order[a.review_status] || 99;
      const rankB = order[b.review_status] || 99;
      if (rankA !== rankB) return rankA - rankB;
      // fallback to recently checked
      const dateA = a.checked_at ? new Date(a.checked_at).getTime() : 0;
      const dateB = b.checked_at ? new Date(b.checked_at).getTime() : 0;
      return dateB - dateA;
    });
    
    const best = sorted[0];
    source = {
      sourceType: best.data_sources?.source_type || null,
      sourceName: best.data_sources?.name || null,
      reviewStatus: best.review_status || null,
      checkedAt: best.checked_at || null
    };
  }

  return {
    id: h.id,
    slug: h.slug,
    name: h.name,
    location: {
      locality: h.locality,
      city: h.city,
      state: h.state
    },
    type: h.hospital_type,
    specialties: specs,
    facilities: facs,
    metrics: {
      emergency: h.emergency_department ?? null,
      ambulance: h.ambulance_available ?? null,
      totalBeds: h.total_beds ?? null,
      icuBeds: h.icu_beds === null ? null : (h.icu_beds > 0)
    },
    provenance: source,
    recordType
  };
}

export function normalizeDemoHospital(h) {
  return {
    id: h.id || h.slug,
    slug: h.slug,
    name: h.name,
    location: { locality: h.location, city: null, state: null },
    type: h.type,
    specialties: h.specialties || [],
    facilities: h.facilities || [],
    metrics: {
      emergency: null,
      ambulance: null,
      totalBeds: null,
      icuBeds: null
    },
    provenance: h.trustMetadata ? {
      sourceType: 'demonstration',
      sourceName: 'Demo Data',
      reviewStatus: 'demonstration',
      checkedAt: new Date().toISOString()
    } : null,
    recordType: 'demo'
  };
}
