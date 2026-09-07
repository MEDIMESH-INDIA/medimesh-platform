import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { count: total, error } = await supabase.from('doctors').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Error fetching total:', error.message);
    return;
  }
  const { count: published } = await supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('publication_status', 'published');
  const { count: verified } = await supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified');
  const { count: pending } = await supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending');
  const { count: hv } = await supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('offers_home_visits', true);

  console.log(`DB REPORT:`);
  console.log(`Canonical doctors: ${total}`);
  console.log(`Published doctors: ${published}`);
  console.log(`NMC verified: ${verified}`);
  console.log(`Pending verification: ${pending}`);
  console.log(`Home Visit enabled: ${hv}`);
}
run();
