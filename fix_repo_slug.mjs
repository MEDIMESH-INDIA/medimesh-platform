import fs from 'fs';
let content = fs.readFileSync('src/lib/data/doctorRepository.js', 'utf8');

const target = `.select(\`
        id, slug, full_name, experience_years,
        city, state, medical_registration_number, publication_status, verification_status, created_at,
        offers_home_visits, professional_phone, whatsapp_number,`;

const replace = `.select(\`
        id, slug, full_name, experience_years, specialization, locality,
        city, state, medical_registration_number, publication_status, verification_status, created_at,
        offers_home_visits, professional_phone, whatsapp_number,`;

content = content.replace(target, replace);
fs.writeFileSync('src/lib/data/doctorRepository.js', content);
