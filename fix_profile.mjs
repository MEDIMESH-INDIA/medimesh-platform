import fs from 'fs';

let content = fs.readFileSync('src/pages/App/Doctor/Profile.jsx', 'utf8');

content = content.replace(
  `const { getProfile, updateProfile, loading: saving } = useDoctorPortal();`,
  `const { getCanonicalProfile, updateCanonicalProfile, loading: saving } = useDoctorPortal();
  const [canonicalId, setCanonicalId] = useState(null);`
);

content = content.replace(
  `public_display_name: '',
    professional_summary: '',
    years_of_experience: '',
    city: '',
    state: '',
    slug: '',`,
  `full_name: '',
    specialization: '',
    experience_years: '',
    locality: '',
    city: '',
    state: '',`
);

content = content.replace(
  `const p = await getProfile();`,
  `const p = await getCanonicalProfile();`
);

content = content.replace(
  `if (p) {
        setFormData({
          public_display_name: p.public_display_name || '',
          professional_summary: p.professional_summary || '',
          years_of_experience: p.years_of_experience || '',
          city: p.city || '',
          state: p.state || '',
          slug: p.slug || '',
        });
      }`,
  `if (p) {
        setCanonicalId(p.id);
        setFormData({
          full_name: p.full_name || '',
          specialization: p.specialization || '',
          experience_years: p.experience_years || '',
          locality: p.locality || '',
          city: p.city || '',
          state: p.state || '',
        });
      }`
);

content = content.replace(
  `const result = await updateProfile({`,
  `if (!canonicalId) return;
    const result = await updateCanonicalProfile(canonicalId, {`
);

content = content.replace(
  `if (loading) return <AppPageContainer><LoadingState message="Loading profile..." /></AppPageContainer>;`,
  `if (loading) return <AppPageContainer><LoadingState message="Loading profile..." /></AppPageContainer>;

  if (!canonicalId) {
    return (
      <AppPageContainer className="!max-w-[700px] space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Professional Profile
          </h1>
        </div>
        <FrostedPanel className="p-8 rounded-[24px] text-center border-amber-200 bg-amber-50/50">
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Profile Not Linked</h2>
          <p className="text-amber-700">Your public MEDIMESH directory profile has not been linked yet.</p>
        </FrostedPanel>
      </AppPageContainer>
    );
  }`
);

// We need to fix the JSX form fields
content = content.replace(/public_display_name/g, 'full_name');
content = content.replace(
  /label="Display Name"/g,
  'label="Full Name"'
);
content = content.replace(/professional_summary/g, 'specialization');
content = content.replace(
  /label="Professional Summary"/g,
  'label="Primary Specialization"'
);
content = content.replace(
  /placeholder="Brief bio about your practice and expertise"/g,
  'placeholder="e.g. Cardiologist"'
);
// replace textarea with input for specialization
content = content.replace(/as="textarea"\s*rows=\{4\}/g, '');

content = content.replace(/years_of_experience/g, 'experience_years');
content = content.replace(
  /label="Slug \(Profile URL\)"/g,
  'label="Locality"'
);
content = content.replace(/slug/g, 'locality');
content = content.replace(
  /disabled\s+helperText="Contact support to change your profile URL\."/g,
  'placeholder="e.g. Vashi"'
);

fs.writeFileSync('src/pages/App/Doctor/Profile.jsx', content);
