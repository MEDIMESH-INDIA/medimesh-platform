import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/VITE_SUPABASE_SERVICE_ROLE_KEY="?([^"\n]+)"?/); // we need service role to update claimed_by_user_id
const supabase = createClient(urlMatch[1], keyMatch[1] || env.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/)[1]);

async function run() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users) return;
  const demoDoc = users.users.find(u => u.email === 'doctor@medimesh.local' || u.email === 'dr.demo@medimesh.local' || u.email === 'dr.patel@example.com');
  
  if (demoDoc) {
    const { data: existing } = await supabase.from('doctors').select('*').eq('claimed_by_user_id', demoDoc.id).maybeSingle();
    if (!existing) {
      console.log('Creating demo canonical doctor for', demoDoc.email);
      await supabase.from('doctors').insert({
        slug: 'dr-demo-patel',
        full_name: 'Dr. Demonstration Patel',
        specialization: 'General Physician',
        experience_years: 15,
        medical_registration_number: 'DEMO-12345',
        locality: 'Vashi',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        verification_status: 'verified',
        publication_status: 'published',
        claimed_by_user_id: demoDoc.id,
        offers_home_visits: false,
        source_dataset: 'Demonstration System'
      });
    } else {
      console.log('Demo canonical doctor already exists for', demoDoc.email);
    }
  }
}
run();
