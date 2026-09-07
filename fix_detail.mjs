import fs from 'fs';

let content = fs.readFileSync('src/pages/App/DoctorDetailExperience.jsx', 'utf8');

const target = `{doctor.homeVisit.contactPublic && (
                    <div className="pt-2 flex flex-col gap-2.5">`;

const replace = `
                  {(!doctor.homeVisit.contactPublic || (!doctor.homeVisit.professionalPhone && !doctor.homeVisit.whatsappNumber)) ? (
                    <div className="pt-2">
                      <div className="bg-surface/50 rounded-xl p-4 border border-border/60 text-sm text-center text-muted-foreground italic">
                        Contact information not provided
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 flex flex-col gap-2.5">`;

content = content.replace(target, replace);
fs.writeFileSync('src/pages/App/DoctorDetailExperience.jsx', content);
