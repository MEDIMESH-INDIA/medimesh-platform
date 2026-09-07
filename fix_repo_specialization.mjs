import fs from 'fs';

let content = fs.readFileSync('src/lib/data/doctorRepository.js', 'utf8');

content = content.replace(
  /const specialization = primaryAffiliation\?\.department \|\| 'Medical Specialist';/,
  "const specialization = doc.specialization || primaryAffiliation?.department || 'Medical Specialist';"
);

// also remove `consultation_modes` and `languages_spoken` from query if they were there (I removed them earlier maybe? No wait I replaced consultation_modes with medical_registration_number, but let's be sure).
fs.writeFileSync('src/lib/data/doctorRepository.js', content);
