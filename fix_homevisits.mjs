import fs from 'fs';

let content = fs.readFileSync('src/pages/App/Doctor/HomeVisits.jsx', 'utf8');

content = content.replace(
  `const { getProfile, updateProfile, loading: saving } = useDoctorPortal();`,
  `const { getCanonicalProfile, updateCanonicalProfile, loading: saving } = useDoctorPortal();
  const [canonicalId, setCanonicalId] = useState(null);`
);

content = content.replace(
  `professional_contact_phone: '',
    whatsapp_contact: '',`,
  `professional_phone: '',
    whatsapp_number: '',`
);

content = content.replace(
  `const data = await getProfile();`,
  `const data = await getCanonicalProfile();`
);

content = content.replace(
  `if (data) {`,
  `if (data) {
        setCanonicalId(data.id);`
);

content = content.replace(
  `professional_contact_phone: data.professional_contact_phone || '',
          whatsapp_contact: data.whatsapp_contact || '',`,
  `professional_phone: data.professional_phone || '',
          whatsapp_number: data.whatsapp_number || '',`
);

content = content.replace(
  `const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);`,
  `const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canonicalId) return;
    const success = await updateCanonicalProfile(canonicalId, formData);`
);

content = content.replace(
  `formData.professional_contact_phone`,
  `formData.professional_phone`
);

content = content.replace(
  `formData.whatsapp_contact`,
  `formData.whatsapp_number`
);

content = content.replace(
  `setFormData({ ...formData, professional_contact_phone`,
  `setFormData({ ...formData, professional_phone`
);

content = content.replace(
  `setFormData({ ...formData, whatsapp_contact`,
  `setFormData({ ...formData, whatsapp_number`
);

content = content.replace(
  `value={formData.professional_contact_phone}`,
  `value={formData.professional_phone}`
);

content = content.replace(
  `value={formData.whatsapp_contact}`,
  `value={formData.whatsapp_number}`
);

content = content.replace(
  `if (loading) return <AppPageContainer><LoadingState message="Loading settings..." /></AppPageContainer>;`,
  `if (loading) return <AppPageContainer><LoadingState message="Loading settings..." /></AppPageContainer>;

  if (!canonicalId) {
    return (
      <AppPageContainer className="!max-w-[800px] space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
            <Home className="w-8 h-8 text-primary" />
            Home Visit Settings
          </h1>
        </div>
        <FrostedPanel className="p-8 rounded-[24px] text-center border-amber-200 bg-amber-50/50">
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Profile Not Linked</h2>
          <p className="text-amber-700">Your public MEDIMESH directory profile has not been linked yet. You must have a verified canonical profile to offer Home Visits through the directory.</p>
        </FrostedPanel>
      </AppPageContainer>
    );
  }`
);

fs.writeFileSync('src/pages/App/Doctor/HomeVisits.jsx', content);
