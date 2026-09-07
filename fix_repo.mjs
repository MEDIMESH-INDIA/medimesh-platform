import fs from 'fs';

let content = fs.readFileSync('src/lib/data/doctorRepository.js', 'utf8');

// Update select fields
content = content.replace(/professional_summary,\s*/g, '');
content = content.replace(/years_of_experience/g, 'experience_years');

// Update normalizer mapping
content = content.replace(/yearsOfExperience: doc\.experience_years \?\? null,/g, 'yearsOfExperience: doc.experience_years ?? null,');
content = content.replace(/summary: doc\.professional_summary \|\| null,/g, 'summary: null,');

fs.writeFileSync('src/lib/data/doctorRepository.js', content);
