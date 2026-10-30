import xlsx from 'xlsx';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

const imrPath = '../raw_data/MEDIMESH_Doctors_IMR_Mapped.xlsx';
const hvPath = '../raw_data/Navi_Mumbai_Home_Visit_Doctors_Only.xlsx';

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeName(name) {
  return (name || '').trim().replace(/\s+/g, ' ').replace(/^Dr\.?\s*/i, '').trim();
}

async function run() {
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

  const valuesToInsert = Array.from(records.values()).map(r => {
    const { _affiliation, ...rest } = r;
    return rest;
  });

  const { data: insertedDoctors, error: insertError } = await supabase
    .from('doctors')
    .upsert(valuesToInsert, { onConflict: 'slug' })
    .select('id, slug');

  if (insertError) {
    console.error('Error inserting doctors:', insertError);
    return;
  }
  
  console.log(`Inserted/upserted ${insertedDoctors.length} doctors`);

  const slugToId = new Map(insertedDoctors.map(d => [d.slug, d.id]));

  // Now insert affiliations
  const affiliationsToInsert = [];
  
  // get canonical hospitals
  const { data: hospitals } = await supabase.from('hospitals').select('id, name');
  
  for (const [slug, record] of records.entries()) {
    if (record._affiliation) {
      // Very rudimentary matching
      const docId = slugToId.get(slug);
      let match = null;
      for (const h of hospitals || []) {
        // e.g. "Apollo Hospitals" matches "Apollo"
        if (record._affiliation.toLowerCase().includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(record._affiliation.toLowerCase())) {
          match = h.id;
          break;
        }
      }
      
      affiliationsToInsert.push({
        doctor_id: docId,
        hospital_id: match,
        hospital_name: match ? null : record._affiliation,
        department: record.specialization,
        source_dataset: record.source_dataset
      });
    }
  }

  if (affiliationsToInsert.length > 0) {
    // Clear old affiliations to avoid duplicates
    await supabase.from('doctor_affiliations_directory').delete().in('doctor_id', insertedDoctors.map(d => d.id));
    
    const { error: affilError } = await supabase
      .from('doctor_affiliations_directory')
      .insert(affiliationsToInsert);
      
    if (affilError) console.error('Error inserting affiliations:', affilError);
    else console.log(`Inserted ${affiliationsToInsert.length} affiliations`);
  }
  
  console.log('DONE.');
}
run();
