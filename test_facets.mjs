import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data, error } = await supabase
        .from('doctors')
        .select('locality, city, specialization, home_visit_service_areas, doctor_affiliations_directory(hospital_name, hospitals(name))')
        .eq('publication_status', 'published');
        
  if (error) console.error(error);
  else {
    const locations = [...new Set(data.flatMap(d => [d.locality, d.city]).filter(Boolean))].sort();
    const specializations = [...new Set(data.map(d => d.specialization).filter(Boolean))].sort();
    const serviceAreas = [...new Set(data.flatMap(d => d.home_visit_service_areas || []).filter(Boolean))].sort();
    
    const hospitals = [...new Set(data.flatMap(d => 
      d.doctor_affiliations_directory?.map(a => a.hospital_name || a.hospitals?.name) || []
    ).filter(Boolean))].sort();
    
    console.log({ locations, specializations, hospitals, serviceAreas });
  }
}
run();
