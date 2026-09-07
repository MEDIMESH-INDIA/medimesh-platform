import xlsx from 'xlsx';
import fs from 'fs';

const imrPath = '../raw_data/MEDIMESH_Doctors_IMR_Mapped.xlsx';
const hvPath = '../raw_data/Navi_Mumbai_Home_Visit_Doctors_Only.xlsx';

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const imrData = xlsx.readFile(imrPath);
const imrSheet = imrData.Sheets['Verified Doctors'] || imrData.Sheets[imrData.SheetNames[0]];
const imrRows = xlsx.utils.sheet_to_json(imrSheet);

const hvData = xlsx.readFile(hvPath);
const hvSheet = hvData.Sheets['Home Visit Doctors'] || hvData.Sheets[hvData.SheetNames[0]];
const hvRows = xlsx.utils.sheet_to_json(hvSheet);

const records = new Map();

for (const row of imrRows) {
  const rawName = row['Doctor Name'] || '';
  const slug = generateSlug(rawName);
  
  if (records.has(slug)) continue;
  
  const isVerified = (row['NMC Status'] || '').toLowerCase() === 'verified';
  
  let regNum = String(row['NMC Registration Number'] || '').trim();
  if (regNum.toLowerCase().includes('pending')) regNum = null;
  
  let regYear = row['Registration Year'] || null;
  if (String(regYear).toLowerCase().includes('pending')) regYear = null;
  
  records.set(slug, {
    slug,
    full_name: rawName,
    specialization: row['Speciality'],
    experience_years: parseInt(row['Years of Experience']) || null,
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    medical_registration_number: regNum,
    registration_year: regYear ? String(regYear) : null,
    medical_council: row['State Medical Council'] || null,
    publication_status: 'published',
    verification_status: isVerified ? 'verified' : 'pending',
    offers_home_visits: false,
    source_dataset: 'MEDIMESH Doctors IMR Mapped Dataset',
    _affiliation: (row['Hospital Affiliation'] || '').trim()
  });
}

for (const row of hvRows) {
  const rawName = row['Name / Provider'] || '';
  const slug = generateSlug(rawName);
  const isVerified = (row['NMC Status'] || '').toLowerCase() === 'verified';
  
  let locality = row['Locality'] || '';
  if (locality.toLowerCase().includes('across navi mumbai')) locality = 'Navi Mumbai';
  
  if (records.has(slug)) {
    const existing = records.get(slug);
    existing.offers_home_visits = true;
    existing.home_visit_service_areas = [locality];
    continue;
  }
  
  const affil = (row['Affiliation / Source'] || '').trim();
  let validAffil = affil;
  if (['JustDial', 'DocVisit', 'Medifyhome', 'Care247'].some(s => affil.includes(s))) {
    validAffil = null;
  }
  
  records.set(slug, {
    slug,
    full_name: rawName,
    specialization: row['Speciality'],
    locality,
    city: row['City'] || 'Navi Mumbai',
    state: 'Maharashtra',
    publication_status: 'published',
    verification_status: isVerified ? 'verified' : 'pending',
    offers_home_visits: true,
    home_visit_service_areas: [locality],
    source_dataset: 'Navi Mumbai Home Visit Doctors Dataset',
    _affiliation: validAffil
  });
}

const safeStr = (str) => {
  if (str === null || str === undefined || str === '') return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
};

const safeArr = (arr) => {
  if (!arr || arr.length === 0) return 'NULL';
  return `ARRAY[${arr.map(safeStr).join(', ')}]`;
};

let sql = `
-- IDEMPOTENT UPSERT DIRECTORY
WITH data (slug, full_name, specialization, experience_years, city, state, medical_registration_number, registration_year, medical_council, publication_status, verification_status, offers_home_visits, home_visit_service_areas, source_dataset, locality, _affiliation) AS (
  VALUES
`;

const lines = [];
for (const r of records.values()) {
  lines.push(`  (${safeStr(r.slug)}, ${safeStr(r.full_name)}, ${safeStr(r.specialization)}, ${r.experience_years || 'NULL'}, ${safeStr(r.city)}, ${safeStr(r.state)}, ${safeStr(r.medical_registration_number)}, ${safeStr(r.registration_year)}, ${safeStr(r.medical_council)}, ${safeStr(r.publication_status)}, ${safeStr(r.verification_status)}, ${r.offers_home_visits}, ${safeArr(r.home_visit_service_areas)}, ${safeStr(r.source_dataset)}, ${safeStr(r.locality)}, ${safeStr(r._affiliation)})`);
}
sql += lines.join(',\n') + '\n)';

sql += `
, upsert_doctors AS (
  INSERT INTO public.doctors (
    slug, full_name, specialization, experience_years, city, state, medical_registration_number, registration_year, medical_council, publication_status, verification_status, offers_home_visits, home_visit_service_areas, source_dataset, locality
  )
  SELECT slug, full_name, specialization, experience_years, city, state, medical_registration_number, registration_year, medical_council, publication_status, verification_status, offers_home_visits, home_visit_service_areas, source_dataset, locality
  FROM data
  ON CONFLICT (slug) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    specialization = EXCLUDED.specialization,
    experience_years = COALESCE(public.doctors.experience_years, EXCLUDED.experience_years),
    offers_home_visits = EXCLUDED.offers_home_visits,
    home_visit_service_areas = EXCLUDED.home_visit_service_areas,
    verification_status = EXCLUDED.verification_status
  RETURNING id, slug
)
INSERT INTO public.doctor_affiliations_directory (doctor_id, hospital_name, department, source_dataset)
SELECT u.id, d._affiliation, d.specialization, d.source_dataset
FROM upsert_doctors u
JOIN data d ON d.slug = u.slug
WHERE d._affiliation IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.doctor_affiliations_directory dad 
    WHERE dad.doctor_id = u.id AND dad.hospital_name = d._affiliation
  );

-- Link to existing canonical hospitals based on name matching
UPDATE public.doctor_affiliations_directory
SET hospital_id = h.id
FROM public.hospitals h
WHERE doctor_affiliations_directory.hospital_id IS NULL
  AND doctor_affiliations_directory.hospital_name IS NOT NULL
  AND (
    LOWER(doctor_affiliations_directory.hospital_name) LIKE '%' || LOWER(h.name) || '%'
    OR LOWER(h.name) LIKE '%' || LOWER(doctor_affiliations_directory.hospital_name) || '%'
  );
`;

fs.writeFileSync('supabase/migrations/20260907000002_seed_canonical_doctors.sql', sql);
console.log("Migration 2 created");
