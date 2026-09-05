import AppPageContainer from '../../components/layout/AppPageContainer';
import { useParams, Link } from 'react-router-dom';
import { Heart, GitCompare, ArrowLeft, MapPin, Building2, Phone, Globe, Bed, Activity, PlusSquare, Check } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';
import TrustMetadata from '../../components/hospital/TrustMetadata';
import { useSavedHospitals } from '../../hooks/useSavedHospitals';
import { useCompare } from '../../hooks/useCompare';
import FrostedPanel from '../../components/common/FrostedPanel';

export default function HospitalDetail() {
  const { slug } = useParams();
  const { savedSlugs, toggleSave } = useSavedHospitals();
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();
  
  // Use demo data for now
  const hospital = demoHospitals.find(h => h.slug === slug);

  if (!hospital) {
    return (
      <AppPageContainer>
        <div className="text-center py-16 px-4 max-w-lg mx-auto bg-white rounded-2xl border border-border shadow-sm space-y-4 my-8">
          <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto text-muted-foreground border border-border">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Hospital not found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The facility record for &ldquo;{slug}&rdquo; could not be found. It may be an external search result or no longer in the demo database.
          </p>
          <div className="pt-2">
            <Link
              to="/app/discover"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to discovery
            </Link>
          </div>
        </div>
      </AppPageContainer>
    );
  }

  const { name, location, type, specialties, facilities, capacity, contact, trustMetadata } = hospital;

  return (
    <AppPageContainer>
      <Link to="/app/discover" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to search
      </Link>

      <FrostedPanel variant="elevated" className="overflow-hidden rounded-[28px]">
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-3">{name || 'Not provided'}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{location || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{type || 'Not provided'}</span>
                </div>
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
            <TrustMetadata trustMetadata={trustMetadata} />
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
                    <span className="font-semibold text-foreground">{capacity?.totalBeds ?? 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">ICU Beds</span>
                    <span className="font-semibold text-foreground">{capacity?.icuBeds ?? 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Emergency</span>
                    <span className="font-semibold text-foreground">{capacity?.emergency ?? 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ambulance</span>
                    <span className="font-semibold text-foreground">{capacity?.ambulance ?? 'Not provided'}</span>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" /> Contact
                </h2>
                <div className="space-y-4">
                  {contact?.address ? (
                    <div className="flex items-start gap-3 text-sm text-foreground">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{contact.address}</span>
                    </div>
                  ) : <p className="text-sm text-muted-foreground">Address not provided</p>}
                  
                  {contact?.phone && (
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}

                  {contact?.website && (
                    <div className="flex items-center gap-3 text-sm text-primary">
                      <Globe className="w-4 h-4 shrink-0" />
                      <a href={`https://${contact.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {contact.website}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </FrostedPanel>
    </AppPageContainer>
  );
}
