import { useAuth } from '../../hooks/useAuth';
import { Search, HeartPulse, Brain, Cross, Bone, Baby, Stethoscope, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useState } from 'react';

const specialtyPills = [
  { label: 'Cardiology', icon: HeartPulse, query: 'cardiology' },
  { label: 'Neurology', icon: Brain, query: 'neurology' },
  { label: 'Oncology', icon: Cross, query: 'oncology' },
  { label: 'Orthopedics', icon: Bone, query: 'orthopedics' },
  { label: 'Pediatrics', icon: Baby, query: 'pediatrics' },
  { label: 'Emergency Care', icon: Stethoscope, query: 'emergency' },
];

import { useSavedHospitals } from '../../hooks/useSavedHospitals';

export default function PatientDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { savedSlugs, toggleSave } = useSavedHospitals();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header & Search */}
      <section className="space-y-6 text-center md:text-left pt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Good evening, {profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Guest'}.
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Find healthcare options with information you can understand.
          </p>
        </div>

        <div className="max-w-2xl pt-2">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 rounded-xl border border-border bg-white text-foreground shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg placeholder:text-muted-foreground/70"
              placeholder="Search hospitals, specialties, facilities or locations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>

        <div className="pt-2">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick search</h2>
          <div className="flex flex-wrap gap-3">
            {specialtyPills.map((sp) => (
              <button
                key={sp.label}
                onClick={() => navigate(`/app/discover?specialty=${sp.query}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors shadow-sm group"
              >
                <sp.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Sections */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6 font-serif">Explore healthcare</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/app/discover" className="group p-6 rounded-xl border border-border bg-white hover:border-primary/50 hover:shadow-md transition-all">
            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
              Hospitals
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-muted-foreground">Search facilities, services and specialties.</p>
          </Link>
          <div className="p-6 rounded-xl border border-border bg-surface/50 opacity-70">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center justify-between">
              Doctors
            </h3>
            <p className="text-sm text-muted-foreground">Browse professional profiles. (Coming soon)</p>
          </div>
          <Link to="/app/compare" className="group p-6 rounded-xl border border-border bg-white hover:border-primary/50 hover:shadow-md transition-all">
            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
              Compare
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-muted-foreground">Compare structured hospital information.</p>
          </Link>
        </div>
      </section>

      {/* Featured / Demo Hospitals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground font-serif">Recently explored / Featured</h2>
          <Link to="/app/discover" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-6">
          {demoHospitals.slice(0, 2).map(hospital => (
            <HospitalCard 
              key={hospital.id} 
              hospital={hospital}
              isSaved={savedSlugs.has(hospital.slug)}
              onSave={() => toggleSave(hospital.slug)}
              onCompare={() => {
                const list = JSON.parse(localStorage.getItem('compareList') || '[]');
                if (list.length < 3 && !list.includes(hospital.slug)) {
                  list.push(hospital.slug);
                  localStorage.setItem('compareList', JSON.stringify(list));
                  window.dispatchEvent(new Event('compare-updated'));
                }
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
