import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';

export default function Saved() {
  const navigate = useNavigate();
  // Mock saved hospitals state for MVP
  const [savedHospitals, setSavedHospitals] = useState([demoHospitals[0]]);

  const handleRemove = (hospital) => {
    setSavedHospitals(prev => prev.filter(h => h.id !== hospital.id));
  };

  if (savedHospitals.length === 0) {
    return (
      <div className="text-center py-20 px-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-foreground mb-4">You haven&apos;t saved any hospitals yet.</h3>
        <p className="text-muted-foreground mb-8 text-lg">Save hospitals to easily find them later and compare them.</p>
        <Link to="/app/discover" className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
          <Search className="w-5 h-5" /> Discover hospitals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Saved Hospitals</h1>
        <p className="text-muted-foreground mt-2">You have {savedHospitals.length} saved hospital{savedHospitals.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-6">
        {savedHospitals.map(hospital => (
          <HospitalCard 
            key={hospital.id} 
            hospital={hospital}
            isSaved={true}
            onSave={handleRemove}
            onCompare={() => navigate(`/app/compare?add=${hospital.slug}`)}
          />
        ))}
      </div>
    </div>
  );
}

