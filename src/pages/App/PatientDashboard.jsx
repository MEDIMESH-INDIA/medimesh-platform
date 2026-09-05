import { useAuth } from '../../hooks/useAuth';
import { Search, HeartPulse, Brain, Cross, Bone, Baby, Stethoscope, ChevronRight, Info, Filter, GitCompare, Database, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import HospitalCard from '../../components/hospital/HospitalCard';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useState } from 'react';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import AppPageContainer from '../../components/layout/AppPageContainer';
import { motion } from 'framer-motion';

const specialtyPills = [
  { label: 'Cardiology', icon: HeartPulse, query: 'cardiology', colorClass: 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100 hover:border-rose-200' },
  { label: 'Neurology', icon: Brain, query: 'neurology', colorClass: 'text-violet-600 bg-violet-50 border-violet-100 hover:bg-violet-100 hover:border-violet-200' },
  { label: 'Pediatrics', icon: Baby, query: 'pediatrics', colorClass: 'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100 hover:border-orange-200' },
  { label: 'Orthopedics', icon: Bone, query: 'orthopedics', colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200' },
  { label: 'Emergency', icon: Stethoscope, query: 'emergency', colorClass: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100 hover:border-amber-200' },
  { label: 'Diagnostics', icon: Cross, query: 'diagnostics', colorClass: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200' },
];

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AppPageContainer className="space-y-12">
      
      {/* Disclaimer */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-amber-50/80 border border-amber-200/60 px-3 py-1.5 rounded-full">
        <Info className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-medium text-amber-800 tracking-wide">
          <span className="font-bold">SIH PROTOTYPE:</span> Illustrative hospital data unless a source is explicitly provided.
        </span>
      </motion.div>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* LEFT: Copy & Search */}
        <div className="flex-1 space-y-8 w-full max-w-2xl lg:max-w-none">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-primary tracking-[0.2em] uppercase">
              Your Healthcare Discovery Space
            </h2>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-[1.15]">
              Good evening, {profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Guest'}.<br />
              <span className="text-muted-foreground">Find healthcare with more context, less guesswork.</span>
            </h1>
            <p className="text-lg text-muted-foreground/80 max-w-xl">
              Search, compare and understand healthcare options with transparent source information.
            </p>
          </div>

          <div className="max-w-xl">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-14 pr-32 py-5 rounded-[20px] border border-white/80 bg-white/75 backdrop-blur-xl text-foreground shadow-[0_16px_44px_rgba(15,40,35,0.07)] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg placeholder:text-muted-foreground/60 focus:-translate-y-0.5 outline-none"
                placeholder="Search hospitals, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div>
            <div className="flex flex-wrap gap-2.5">
              {specialtyPills.map((sp) => (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={sp.label}
                  onClick={() => navigate(`/app/discover?specialty=${sp.query}`)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all shadow-sm ${sp.colorClass}`}
                >
                  <sp.icon className="w-4 h-4" />
                  {sp.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Visual Composition */}
        <div className="hidden lg:block flex-1 relative w-full h-[400px] overflow-hidden rounded-3xl">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Connection Lines */}
            <svg className="absolute w-full h-full text-primary/20" style={{ zIndex: 0 }}>
              <path d="M 250 200 L 400 120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
              <path d="M 250 200 L 420 280" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            </svg>

            {/* Central Node */}
            <div className="absolute left-[200px] top-[180px] z-10 w-24 h-24 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              </div>
            </div>

            {/* Floating Card 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[80px] top-[60px] z-20 bg-white/90 backdrop-blur-sm border border-border p-4 rounded-2xl shadow-xl w-64"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Hospital options</div>
                  <div className="text-xs text-muted-foreground">Demonstration dataset</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute right-[40px] top-[240px] z-20 bg-white/90 backdrop-blur-sm border border-border p-4 rounded-2xl shadow-xl w-64"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <Database className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Source</div>
                  <div className="text-sm font-medium text-foreground">MEDIMESH Demo Data</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Discovery Journey Strip */}
      <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/68 p-6 shadow-[0_14px_40px_rgba(15,40,35,0.055)] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 max-w-4xl mx-auto relative">
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-0"></div>
          
          <div className="flex flex-col items-center text-center bg-white z-10 px-4 group">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-bold text-foreground">Search</div>
            <div className="text-xs text-muted-foreground mt-1">Find options</div>
          </div>
          
          <div className="flex flex-col items-center text-center bg-white z-10 px-4 group">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-bold text-foreground">Filter</div>
            <div className="text-xs text-muted-foreground mt-1">Narrow results</div>
          </div>

          <div className="flex flex-col items-center text-center bg-white z-10 px-4 group">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
              <GitCompare className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-bold text-foreground">Compare</div>
            <div className="text-xs text-muted-foreground mt-1">See differences</div>
          </div>

          <div className="flex flex-col items-center text-center bg-white z-10 px-4 group">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-bold text-foreground">Source</div>
            <div className="text-xs text-muted-foreground mt-1">Check provenance</div>
          </div>
        </div>
      </section>

      {/* Explore Sections */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground font-serif">Explore healthcare</h2>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/app/discover">
            <motion.div variants={item} whileHover={{ y: -4 }} className="group h-full p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="w-12 h-12 rounded-xl bg-white border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                Find a Hospital
              </h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">Search facilities, services and specialties across verified data sources.</p>
              <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                Start searching <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          </Link>
          
          <Link to="/app/compare">
            <motion.div variants={item} whileHover={{ y: -4 }} className="group h-full p-8 rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-transparent hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="w-12 h-12 rounded-xl bg-white border border-amber-200/50 flex items-center justify-center mb-6 shadow-sm">
                <GitCompare className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 group-hover:text-amber-700 transition-colors">
                Compare Options
              </h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">Side-by-side comparison of capacity, facilities and source provenance.</p>
              <div className="flex items-center text-sm font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
                Compare now <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          </Link>

          <Link to="/app/discover">
            <motion.div variants={item} whileHover={{ y: -4 }} className="group h-full p-8 rounded-2xl border border-border bg-surface/50 hover:bg-white hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center mb-6 shadow-sm">
                <Database className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 group-hover:text-slate-700 transition-colors">
                Understand Sources
              </h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">Learn where hospital data comes from and how it is verified.</p>
              <div className="flex items-center text-sm font-semibold text-slate-600 group-hover:translate-x-1 transition-transform">
                Explore data <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Featured / Demo Hospitals */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground font-serif">Demonstration hospitals</h2>
          <Link to="/app/discover" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid lg:grid-cols-2 gap-6">
          {demoHospitals.slice(0, 2).map((hospital) => (
            <motion.div variants={item} key={hospital.id}>
              <HospitalCard 
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
            </motion.div>
          ))}
        </motion.div>
      </section>
    </AppPageContainer>
  );
}
