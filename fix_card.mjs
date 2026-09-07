import fs from 'fs';

let content = fs.readFileSync('src/components/doctor/DoctorCard.jsx', 'utf8');

const target = `{homeVisit?.enabled && homeVisit?.contactPublic && (
            <div className="flex items-center gap-2">`;

const replace = `{homeVisit?.enabled && (!homeVisit?.contactPublic || (!homeVisit?.professionalPhone && !homeVisit?.whatsappNumber)) && (
            <span className="text-xs text-muted-foreground italic mr-2">Contact info not provided</span>
          )}
          {homeVisit?.enabled && homeVisit?.contactPublic && (homeVisit?.professionalPhone || homeVisit?.whatsappNumber) && (
            <div className="flex items-center gap-2">`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/doctor/DoctorCard.jsx', content);
