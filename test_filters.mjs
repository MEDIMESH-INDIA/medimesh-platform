import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const filters = {};
  const offset = 0;
  const pageSize = 12;
  const sort = 'name_asc';
  
  let query = supabase
      .from('doctors')
      .select(`
        id, slug, full_name, experience_years, specialization, locality,
        city, state, medical_registration_number, publication_status, verification_status, created_at,
        offers_home_visits, professional_phone, whatsapp_number,
        home_visit_contact_public, home_visit_service_areas, home_visit_days,
        home_visit_start_time, home_visit_end_time, home_visit_fee, home_visit_note,
        doctor_affiliations_directory(
          id, department, position, is_current,
          hospital_name, hospitals(id, slug, name, city, locality)
        )
      `, { count: 'exact' })
      .eq('publication_status', 'published');

    query = query.range(offset, offset + pageSize - 1);
    
    const { data, count, error } = await query;
    if (error) {
      console.error(error);
      return;
    }
    console.log("SUCCESS, data length:", data?.length, "count:", count);
}
run();
