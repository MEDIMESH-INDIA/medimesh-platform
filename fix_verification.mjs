import fs from 'fs';

let content = fs.readFileSync('src/pages/App/Doctor/Verification.jsx', 'utf8');

content = content.replace(
  `import { useAuth } from '../../../hooks/useAuth';`,
  `import { useAuth } from '../../../hooks/useAuth';\nimport { useDoctorPortal } from '../../../hooks/useDoctorPortal';`
);

content = content.replace(
  `const { profile } = useAuth();
  const [loading, setLoading] = useState(true);`,
  `const { profile } = useAuth();
  const { getCanonicalProfile } = useDoctorPortal();
  const [loading, setLoading] = useState(true);
  const [canonicalData, setCanonicalData] = useState(null);`
);

content = content.replace(
  `// In a real app we'd fetch verification_requests here.
    // For now, we simulate network loading and rely on profile.verification_status
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);`,
  `async function load() {
      const p = await getCanonicalProfile();
      setCanonicalData(p);
      setLoading(false);
    }
    load();`
);

content = content.replace(
  `const status = profile?.verification_status || 'unreviewed';`,
  `const status = canonicalData ? canonicalData.verification_status : (profile?.verification_status || 'unreviewed');`
);

const newFields = `
        {canonicalData && (
          <div className="py-6 border-b border-border/60">
            <h3 className="font-semibold text-foreground mb-4">Registration Details</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-3 bg-surface/50 border border-border/60 rounded-xl">
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Registration Number</span>
                <span className="font-medium text-foreground">{canonicalData.medical_registration_number || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-surface/50 border border-border/60 rounded-xl">
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Medical Council</span>
                <span className="font-medium text-foreground">{canonicalData.medical_council || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-surface/50 border border-border/60 rounded-xl">
                <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Registration Year</span>
                <span className="font-medium text-foreground">{canonicalData.registration_year || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}
`;

content = content.replace(
  `<div className="space-y-4 text-sm text-muted-foreground">`,
  newFields + `\n        <div className="space-y-4 text-sm text-muted-foreground">`
);

fs.writeFileSync('src/pages/App/Doctor/Verification.jsx', content);
