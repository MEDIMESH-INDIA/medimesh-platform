import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const res = await supabase.from('doctors').select('*').limit(1);
  console.log("doctors table response:", res.error ? res.error.message : 'Exists');
}
run();
