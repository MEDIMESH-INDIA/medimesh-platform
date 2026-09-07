import fs from 'fs';
let content = fs.readFileSync('src/pages/App/Doctor/Specializations.jsx', 'utf8');

content = content.replace(
  `const { getSpecializations, updateSpecializations, loading: saving } = useDoctorPortal();`,
  `const { getSpecializations, updateSpecializations, getCanonicalProfile, updateCanonicalProfile, loading: saving } = useDoctorPortal();
  const [canonicalId, setCanonicalId] = useState(null);`
);

content = content.replace(
  `const data = await getSpecializations();`,
  `const [data, canonicalProfile] = await Promise.all([getSpecializations(), getCanonicalProfile()]);
      if (canonicalProfile) setCanonicalId(canonicalProfile.id);`
);

content = content.replace(
  `const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateSpecializations(formData);`,
  `const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateSpecializations(formData);
    if (result && canonicalId) {
      await updateCanonicalProfile(canonicalId, { specialization: formData.primary_specialization });
    }`
);

fs.writeFileSync('src/pages/App/Doctor/Specializations.jsx', content);
