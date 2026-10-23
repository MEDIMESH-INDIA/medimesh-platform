import CareFinderExperience from './CareFinder/CareFinderExperience';

export default function PublicCareFinder() {
  const mode = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'canonical' : 'demo';
  return <CareFinderExperience mode={mode} />;
}

