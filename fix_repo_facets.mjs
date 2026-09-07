import fs from 'fs';

let content = fs.readFileSync('src/lib/data/doctorRepository.js', 'utf8');

const target = `export async function getDoctorFacets() {
  if (!USE_DEMO_FALLBACK) {
    return { locations: [], specializations: [], hospitals: [], languages: [], serviceAreas: [] };
  }

  const locations = [...new Set(starterDoctors.flatMap(d => [d.location.locality, d.location.city]).filter(Boolean))].sort();`;

const replace = `export async function getDoctorFacets() {
  if (!USE_DEMO_FALLBACK) {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('locality, city, specialization, home_visit_service_areas, doctor_affiliations_directory(hospital_name, hospitals(name))')
        .eq('publication_status', 'published');
        
      if (!error && data) {
        const locations = [...new Set(data.flatMap(d => [d.locality, d.city]).filter(Boolean))].sort();
        const specializations = [...new Set(data.map(d => d.specialization).filter(Boolean))].sort();
        const serviceAreas = [...new Set(data.flatMap(d => d.home_visit_service_areas || []).filter(Boolean))].sort();
        
        const hospitals = [...new Set(data.flatMap(d => 
          d.doctor_affiliations_directory?.map(a => a.hospital_name || a.hospitals?.name) || []
        ).filter(Boolean))].sort();
        
        return { locations, specializations, hospitals, languages: ['English', 'Hindi', 'Marathi'], serviceAreas };
      }
    } catch (err) {
      console.warn('Facets query error:', err);
    }
    return { locations: [], specializations: [], hospitals: [], languages: [], serviceAreas: [] };
  }

  const locations = [...new Set(starterDoctors.flatMap(d => [d.location.locality, d.location.city]).filter(Boolean))].sort();`;

content = content.replace(target, replace);
fs.writeFileSync('src/lib/data/doctorRepository.js', content);
