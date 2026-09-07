import xlsx from 'xlsx';
import fs from 'fs';

const imrPath = '../raw_data/MEDIMESH_Doctors_IMR_Mapped.xlsx';
const hvPath = '../raw_data/Navi_Mumbai_Home_Visit_Doctors_Only.xlsx';

const imrData = xlsx.readFile(imrPath);
const imrSheet = imrData.Sheets['Verified Doctors'] || imrData.Sheets[imrData.SheetNames[0]];
const imrRows = xlsx.utils.sheet_to_json(imrSheet);

const hvData = xlsx.readFile(hvPath);
const hvSheet = hvData.Sheets['Home Visit Doctors'] || hvData.Sheets[hvData.SheetNames[0]];
const hvRows = xlsx.utils.sheet_to_json(hvSheet);

console.log(`IMR Rows: ${imrRows.length}`);
console.log(JSON.stringify(imrRows[0], null, 2));

console.log(`HV Rows: ${hvRows.length}`);
console.log(JSON.stringify(hvRows[0], null, 2));
