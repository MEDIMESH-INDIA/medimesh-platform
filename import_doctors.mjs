import xlsx from 'xlsx';
import fs from 'fs';
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341'; // Just a random UUID for v5 namespace

const imrPath = '../raw_data/MEDIMESH_Doctors_IMR_Mapped.xlsx';
const hvPath = '../raw_data/Navi_Mumbai_Home_Visit_Doctors_Only.xlsx';

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeName(name) {
  return (name || '').trim().replace(/\s+/g, ' ').replace(/^Dr\.?\s*/i, '').trim();
}

const imrData = xlsx.readFile(imrPath);
const imrSheet = imrData.Sheets['Verified Doctors'] || imrData.Sheets[imrData.SheetNames[0]];
const imrRows = xlsx.utils.sheet_to_json(imrSheet);

const hvData = xlsx.readFile(hvPath);
const hvSheet = hvData.Sheets['Home Visit Doctors'] || hvData.Sheets[hvData.SheetNames[0]];
const hvRows = xlsx.utils.sheet_to_json(hvSheet);

const records = new Map();
let duplicatesSkipped = 0;
let autoVerifiedCount = 0;
let pendingCount = 0;
let homeVisitEnabledCount = 0;
let textAffiliations = 0;

for (const row of imrRows) {
  const rawName = row['Doctor Name'] || '';
  const normName = normalizeName(rawName);
  const slug = generateSlug(rawName);
  
  if (records.has(slug)) {
    duplicatesSkipped++;
    continue;
  }
  
  const isVerified = (row['NMC Status'] || '').toLowerCase() === 'verified';
  if (isVerified) autoVerifiedCount++;
  else pendingCount++;
  
  let regNum = String(row['NMC Registration Number'] || '').trim();
  if (regNum.toLowerCase().includes('pending')) regNum = null;
  
  let regYear = row['Registration Year'] || null;
  if (String(regYear).toLowerCase().includes('pending')) regYear = null;
  
  const affil = (row['Hospital Affiliation'] || '').trim();
  if (affil) textAffiliations++;
  
  records.set(slug, {
    doctor_id: uuidv5(slug, NAMESPACE),
    slug,
    public_display_name: rawName,
    professional_summary: `Medical professional specializing in ${row['Speciality']}.`,
    years_of_experience: parseInt(row['Years of Experience']) || null,
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    publication_status: 'published',
    data_status: isVerified ? 'verified' : 'pending',
    offers_home_visits: false,
    
    // extra info for related tables / future processing
    _speciality: row['Speciality'],
    _affiliation: affil,
    _regNum: regNum,
    _regYear: regYear,
    _council: row['State Medical Council'],
    _nmcStatus: row['NMC Status'],
    _source: 'MEDIMESH Doctors IMR Mapped Dataset'
  });
}

for (const row of hvRows) {
  const rawName = row['Name / Provider'] || '';
  const normName = normalizeName(rawName);
  const slug = generateSlug(rawName);
  
  const isVerified = (row['NMC Status'] || '').toLowerCase() === 'verified';
  
  if (records.has(slug)) {
    // update existing to add home visit
    const existing = records.get(slug);
    existing.offers_home_visits = true;
    existing.home_visit_service_areas = [row['Locality']];
    homeVisitEnabledCount++;
    continue;
  }
  
  if (isVerified) autoVerifiedCount++;
  else pendingCount++;
  
  const affil = (row['Affiliation / Source'] || '').trim();
  let validAffil = affil;
  if (['JustDial', 'DocVisit', 'Medifyhome', 'Care247'].some(s => affil.includes(s))) {
    validAffil = null;
  } else if (validAffil) {
    textAffiliations++;
  }
  
  let locality = row['Locality'] || '';
  if (locality.toLowerCase().includes('across navi mumbai')) locality = 'Navi Mumbai';
  
  records.set(slug, {
    doctor_id: uuidv5(slug, NAMESPACE),
    slug,
    public_display_name: rawName,
    professional_summary: `General practitioner offering home visits in ${locality}.`,
    years_of_experience: null,
    city: row['City'] || 'Navi Mumbai',
    state: 'Maharashtra',
    publication_status: 'published',
    data_status: isVerified ? 'verified' : 'pending',
    offers_home_visits: true,
    home_visit_service_areas: [locality],
    
    // extra info
    _speciality: row['Speciality'],
    _affiliation: validAffil,
    _source: 'Navi Mumbai Home Visit Doctors Dataset'
  });
  
  homeVisitEnabledCount++;
}

console.log('--- DRY RUN RESULTS ---');
console.log(`IMR source rows: ${imrRows.length}`);
console.log(`Home Visit source rows: ${hvRows.length}`);
console.log(`Unique doctors parsed: ${records.size}`);
console.log(`Duplicates skipped: ${duplicatesSkipped}`);
console.log(`NMC Verified: ${autoVerifiedCount}`);
console.log(`NMC Pending: ${pendingCount}`);
console.log(`Home Visit Enabled: ${homeVisitEnabledCount}`);
console.log(`Text-only affiliations: ${textAffiliations}`);

const sql = `
-- IDEMPOTENT UPSERT SEED SCRIPT
-- Run this AFTER 20260907000001_unclaimed_doctors.sql is applied

INSERT INTO public.doctor_profiles 
  (doctor_id, slug, public_display_name, professional_summary, years_of_experience, city, state, publication_status, data_status, offers_home_visits, home_visit_service_areas)
VALUES
${Array.from(records.values()).map(r => `  ('${r.doctor_id}', '${r.slug.replace(/'/g,"''")}', '${r.public_display_name.replace(/'/g,"''")}', '${r.professional_summary.replace(/'/g,"''")}', ${r.years_of_experience || 'NULL'}, '${r.city}', '${r.state}', '${r.publication_status}', '${r.data_status}', ${r.offers_home_visits}, ${r.home_visit_service_areas ? `ARRAY['${r.home_visit_service_areas[0].replace(/'/g,"''")}']` : 'NULL'})`).join(',\n')}
ON CONFLICT (slug) DO UPDATE SET
  public_display_name = EXCLUDED.public_display_name,
  professional_summary = EXCLUDED.professional_summary,
  years_of_experience = COALESCE(doctor_profiles.years_of_experience, EXCLUDED.years_of_experience),
  offers_home_visits = EXCLUDED.offers_home_visits,
  home_visit_service_areas = EXCLUDED.home_visit_service_areas;
`;

fs.writeFileSync('seed_doctors.sql', sql);
console.log('Generated seed_doctors.sql');
