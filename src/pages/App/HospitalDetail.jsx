import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Building2, 
  Activity, 
  Bed,
  PlusSquare,
  ArrowLeft,
  Heart,
  GitCompare,
  Check
} from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import FrostedPanel from '../../components/common/FrostedPanel';
import { useCompare } from '../../hooks/useCompare';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import TrustMetadata from '../../components/hospital/TrustMetadata';
import { useHospitalDetail } from '../../hooks/useHospitalDetail';

export default function HospitalDetail() {
  const { slug } = useParams();
  // TODO: Add toggle for demo/canonical based on a context or leave it hardcoded canonical for now
  const { hospital, loading, error } = useHospitalDetail(slug, { mode: 'canonical' });
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();
  const { savedSlugs, toggleSave } = useSavedHospitals();

  if (loading) {
    return (
      <AppPageContainer>
        <div className="animate-pulse space-y-8">
          <div className="h-40 bg-surface rounded-[26px]"></div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="h-64 bg-surface rounded-[26px]"></div>
            <div className="h-64 bg-surface rounded-[26px]"></div>
          </div>
        </div>
      </AppPageContainer>
    );
  }

  if (error || !hospital) {
    return (
      <AppPageContainer>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Hospital not found</h2>
          <p className="text-muted-foreground mb-8">
            {error ? 'Unable to load data from the database.' : 'This hospital might have been removed or the URL is incorrect.'}
          </p>
          <Link to="/app/discover" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Discover
          </Link>
        </div>
      </AppPageContainer>
    );
  }

  const {
    name,
    location,
    type,
    specialties,
    facilities,
    metrics,
    provenance,
  } = hospital;

  const locString = location.locality && location.city 
    ? `${location.locality}, ${location.city}` 
    : location.locality || location.city || 'Location not provided';

  return (
    <AppPageContainer>
      <Link to="/app/discover" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Discover
      </Link>

      <FrostedPanel className="rounded-[26px] overflow-hidden">
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-3">{name || 'Not provided'}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{locString}</span>
                </div>
                {type && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{type}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => toggleSave(slug)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  savedSlugs.has(slug) 
                    ? 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20' 
                    : 'border-border bg-white text-foreground hover:bg-surface'
                }`}
                title={savedSlugs.has(slug) ? "Unsave hospital" : "Save hospital"}
              >
                <Heart className={`w-4 h-4 ${savedSlugs.has(slug) ? 'fill-current' : ''}`} /> 
                {savedSlugs.has(slug) ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={() => {
                  if (isCompared(slug)) {
                    removeHospital(slug);
                  } else if (canAdd) {
                    addHospital(slug);
                  } else {
                    alert("You can compare up to 3 hospitals.");
                  }
                }}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                  isCompared(slug)
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border bg-white text-foreground hover:bg-surface'
                }`}
                title="Compare hospital"
              >
                {isCompared(slug) ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                {isCompared(slug) ? 'Added to compare' : '+ Add to compare'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 space-y-12">
          {/* Trust Metadata */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Data Source & Trust</h2>
            <TrustMetadata provenance={provenance} />
          </section>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-12">
              {/* Specialties */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {specialties?.length ? specialties.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-lg bg-surface border border-border/50 text-sm font-medium text-foreground">
                      {s}
                    </span>
                  )) : (
                    <p className="text-muted-foreground text-sm">Not provided</p>
                  )}
                </div>
              </section>

              {/* Facilities */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <PlusSquare className="w-5 h-5 text-primary" /> Facilities
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {facilities?.length ? facilities.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                      {f}
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-sm">Not provided</p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-12">
              {/* Capacity */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" /> Capacity
                </h2>
                <div className="bg-surface/50 rounded-xl p-5 border border-border/50 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Total Beds</span>
                    <span className="font-semibold text-foreground">{metrics?.totalBeds ?? 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">ICU Beds</span>
                    <span className="font-semibold text-foreground">
                      {metrics?.icuBeds !== null ? (metrics.icuBeds ? 'Available' : 'No') : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Emergency</span>
                    <span className="font-semibold text-foreground">
                      {metrics?.emergency === true ? '24/7' : metrics?.emergency === false ? 'No' : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ambulance</span>
                    <span className="font-semibold text-foreground">
                      {metrics?.ambulance === true ? 'Available' : metrics?.ambulance === false ? 'No' : 'Not provided'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </FrostedPanel>
    </AppPageContainer>
  );
}
