const XLSX = require('xlsx');
const fs = require('fs');
const crypto = require('crypto');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Hospitals
function importHospitals() {
  const wb = XLSX.readFile('../raw_data/MEDIMESH_Sindhudurg_Rural_Hospitals.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  let sql = 'BEGIN;\n';
  data.forEach(row => {
    let city = row.city;
    let district = 'Sindhudurg';
    if (city === 'Sindhudurg' && row.locality) {
      city = row.locality.split('/')[0].trim();
    }
    
    let totalBeds = parseInt(row.total_beds);
    if (isNaN(totalBeds)) {
      totalBeds = null;
    }
    
    const id = crypto.randomUUID();
    const slug = (row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    sql += `INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '${id}', ${escapeSql(slug)}, ${escapeSql(row.name)}, ${escapeSql(row.locality)}, ${escapeSql(city)}, ${escapeSql(district)}, 'Maharashtra', ${escapeSql(row.hospital_type)}, ${escapeSql(totalBeds)}, ${escapeSql(row.phone)}, 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;\n`;
    
  });
  sql += 'COMMIT;\n';
  fs.writeFileSync('supabase/import_sindhudurg_hospitals.sql', sql);
}
importHospitals();
