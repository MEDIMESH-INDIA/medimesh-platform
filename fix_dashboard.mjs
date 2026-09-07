import fs from 'fs';

let content = fs.readFileSync('src/pages/App/Doctor/Dashboard.jsx', 'utf8');

content = content.replace(
  `const { getProfile, getQualifications, getSpecializations, getAffiliations } = useDoctorPortal();`,
  `const { getProfile, getCanonicalProfile, getQualifications, getSpecializations, getAffiliations } = useDoctorPortal();`
);

content = content.replace(
  `docProfile: null,`,
  `docProfile: null, canonicalProfile: null,`
);

content = content.replace(
  `const [docProfile, qualifications, specialization, affiliations] = await Promise.all([
        getProfile(),
        getQualifications(),
        getSpecializations(),
        getAffiliations()
      ]);`,
  `const [docProfile, canonicalProfile, qualifications, specialization, affiliations] = await Promise.all([
        getProfile(),
        getCanonicalProfile(),
        getQualifications(),
        getSpecializations(),
        getAffiliations()
      ]);`
);

content = content.replace(
  `setData({ docProfile, qualifications, specialization, affiliations });`,
  `setData({ docProfile, canonicalProfile, qualifications, specialization, affiliations });`
);

content = content.replace(
  `const { docProfile, qualifications, specialization, affiliations } = data;`,
  `const { docProfile, canonicalProfile, qualifications, specialization, affiliations } = data;`
);

content = content.replace(
  `const profileComplete = docProfile?.public_display_name && docProfile?.years_of_experience && docProfile?.city;`,
  `const profileComplete = docProfile?.public_display_name && docProfile?.city;`
);

content = content.replace(
  `{ label: 'Home Visits', status: docProfile?.offers_home_visits ? 'Enabled' : 'Disabled', icon: Home, href: '/doctor/home-visits' },`,
  `{ label: 'Home Visits', status: canonicalProfile ? (canonicalProfile.offers_home_visits ? 'Enabled' : 'Disabled') : 'Not Linked', icon: Home, href: '/doctor/home-visits' },`
);

content = content.replace(
  `{ label: 'Verification', status: profile?.verification_status || 'Pending', icon: ShieldCheck, href: '/doctor/verification' },`,
  `{ label: 'Verification', status: canonicalProfile ? (canonicalProfile.verification_status || 'Pending') : (profile?.verification_status || 'Pending'), icon: ShieldCheck, href: '/doctor/verification' },`
);

content = content.replace(
  `<Link 
          to={docProfile?.slug ? \`/doctors/\${docProfile.slug}\` : '/doctors'}
          className="px-5 py-2.5 rounded-xl bg-white text-primary font-semibold text-sm border border-primary/20 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
        >
          View Profile
        </Link>`,
  `{canonicalProfile ? (
          <Link 
            to={\`/doctors/\${canonicalProfile.slug}\`}
            className="px-5 py-2.5 rounded-xl bg-white text-primary font-semibold text-sm border border-primary/20 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
          >
            View Profile
          </Link>
        ) : (
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">Not Linked</span>
        )}`
);

fs.writeFileSync('src/pages/App/Doctor/Dashboard.jsx', content);
