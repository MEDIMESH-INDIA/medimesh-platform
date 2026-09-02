import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, GitCompare, ArrowLeft, MapPin, Building2, Phone, Globe, Bed, Activity, PlusSquare } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';
import TrustMetadata from '../../components/hospital/TrustMetadata';

export default function HospitalDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Use demo data for now
  const hospital = demoHospitals.find(h => h.slug === slug);

  if (!hospital) {
    return (
      <div className="text-center py-20 px-4">
        <h3 className="text-xl font-semibold text-foreground mb-2">Hospital not found</h3>
        <p className="text-muted-foreground mb-6">The hospital information couldn&apos;t be loaded.</p>
        <Link to="/app/discover" className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          Back to discovery
        </Link>
      </div>
    );
  }

  const { name, location, type, specialties, facilities, capacity, contact, trustMetadata } = hospital;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Link to="/app/discover" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to search
      </Link>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
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
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-surface transition-colors"
                title="Save hospital"
              >
                <Heart className="w-4 h-4" /> Save
              </button>
              <button 
                onClick={() => navigate(`/app/compare?add=${slug}`)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                title="Compare hospital"
              >
                <GitCompare className="w-4 h-4" /> Compare
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
                <div className="grid grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}

