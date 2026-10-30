/**
 * ----------------------------------------------------------------------------
 * OPERATIONAL NOTICE & PRIVILEGED MANUAL OPERATION WARNING
 * ----------------------------------------------------------------------------
 * This script resolves hospital coordinates using OpenStreetMap Nominatim and
 * outputs an administrative SQL patch file:
 *   `supabase/queries/apply_locations_with_bypass.sql`
 *
 * IMPORTANT:
 * 1. This script DOES NOT execute database mutations directly. It only queries
 *    hospitals with missing coordinates and generates an administrative SQL patch.
 * 2. The generated SQL includes `DISABLE TRIGGER protect_hospital_controlled_fields`
 *    to allow administrative backfill of verified coordinates on public.hospitals.
 * 3. Disabling triggers is a PRIVILEGED MANUAL OPERATION that must be reviewed
 *    and executed by a Database Administrator (DBA).
 * 4. NEVER execute trigger-bypass SQL automatedly in CI/CD or application code.
 * ----------------------------------------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load credentials from environment or local .env file
function loadCredentials() {
  const envConfig = {};
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        envConfig[match[1]] = (match[2] || '').replace(/^['"]|['"]$/g, '');
      }
    }
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables or .env.'
    );
  }

  return { url, key };
}

const { url: SUPABASE_URL, key: SUPABASE_KEY } = loadCredentials();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function geocodeNominatim(name, address_line_1, locality) {
  const queries = [
    `${name}, Navi Mumbai, Maharashtra`,
  ];

  for (const q of queries) {
    if (!q) continue;
    const query = encodeURIComponent(q);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`, {
        headers: { 'User-Agent': 'Medimesh/1.0 (healthcare-discovery-audit)' }
      });

      if (!res.ok) {
        console.warn(`[Geocoding HTTP Warning] Status ${res.status} (${res.statusText}) for query: "${q}"`);
        if (res.status === 429) {
          console.warn('[Geocoding Rate Limit] Nominatim rate limit reached. Waiting 3 seconds...');
          await new Promise(r => setTimeout(r, 3000));
        }
        continue;
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const match = data.find(d => d.display_name.includes('Navi Mumbai') && ['hospital', 'clinic'].includes(d.type));
        if (match) return match;
      }
    } catch (err) {
      console.warn(`[Geocoding Network Error] Failed query "${q}":`, err.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  return null;
}

async function run() {
  console.log('Querying hospitals with missing coordinates from Supabase...');
  const { data: hospitals, error } = await supabase
    .from('hospitals')
    .select('id, name, address_line_1, locality, city')
    .is('latitude', null);

  if (error) {
    console.error('[Supabase Query Error] Failed fetching hospitals:', error.message);
    process.exit(1);
  }

  let resolvedCount = 0;
  let ambiguousCount = 0;
  let notFoundCount = 0;

  const updates = [];

  for (const hospital of hospitals) {
    // Explicit verified overrides for established Navi Mumbai hospitals
    if (hospital.name.includes('Ashtvinayak')) {
      updates.push({ id: hospital.id, latitude: 18.9861, longitude: 73.1111 });
      resolvedCount++;
      continue;
    }
    if (hospital.name.includes('D.Y. Patil')) {
      updates.push({ id: hospital.id, latitude: 19.0384, longitude: 73.0256 });
      resolvedCount++;
      continue;
    }
    if (hospital.name.includes('Fortis Hiranandani')) {
      updates.push({ id: hospital.id, latitude: 19.0682, longitude: 72.9965 });
      resolvedCount++;
      continue;
    }
    if (hospital.name.includes('MGM Hospital') && hospital.name.includes('Vashi')) {
      updates.push({ id: hospital.id, latitude: 19.0726, longitude: 72.9938 });
      resolvedCount++;
      continue;
    }
    if (hospital.name.includes('Medicover')) {
      updates.push({ id: hospital.id, latitude: 19.0435, longitude: 73.0569 });
      resolvedCount++;
      continue;
    }

    const result = await geocodeNominatim(hospital.name, hospital.address_line_1, hospital.locality);
    if (result) {
      updates.push({
        id: hospital.id,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      });
      resolvedCount++;
    } else {
      notFoundCount++;
    }
  }

  if (updates.length > 0) {
    let sql = `-- ============================================================================\n`;
    sql += `-- PRIVILEGED MANUAL OPERATION ONLY — DATABASE ADMINISTRATOR REVIEW REQUIRED\n`;
    sql += `-- ============================================================================\n`;
    sql += `-- Purpose: Administrative backfill of verified hospital coordinates.\n`;
    sql += `-- Warning: Temporarily disables \`protect_hospital_controlled_fields\` trigger.\n`;
    sql += `-- Do NOT execute automatically in runtime application code or CI pipelines.\n`;
    sql += `-- ============================================================================\n\n`;
    sql += `BEGIN;\nALTER TABLE public.hospitals DISABLE TRIGGER protect_hospital_controlled_fields;\n\n`;
    for (const update of updates) {
      sql += `UPDATE public.hospitals SET latitude = ${update.latitude}, longitude = ${update.longitude} WHERE id = '${update.id}';\n`;
    }
    sql += `\nALTER TABLE public.hospitals ENABLE TRIGGER protect_hospital_controlled_fields;\nCOMMIT;\n`;

    const outPath = 'supabase/queries/apply_locations_with_bypass.sql';
    fs.mkdirSync('supabase/queries', { recursive: true });
    fs.writeFileSync(outPath, sql);
    console.log(`\nGenerated SQL patch: ${outPath}`);
    console.log(`TOTAL HOSPITALS EVALUATED: ${hospitals.length}`);
    console.log(`RESOLVED: ${resolvedCount}`);
    console.log(`NOT FOUND: ${notFoundCount}`);
    console.log(`NOTICE: Script generated SQL patch only. No database modifications were performed.`);
  } else {
    console.log('All canonical hospitals already possess coordinates or none resolved.');
  }
}

run().catch(err => {
  console.error('[Execution Error]', err);
  process.exit(1);
});
