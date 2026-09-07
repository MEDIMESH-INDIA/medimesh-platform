import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { count, error } = await supabase.from('doctor_profiles').select('*', { count: 'exact', head: true });
  console.log('doctor_profiles count:', count);
}
check();
