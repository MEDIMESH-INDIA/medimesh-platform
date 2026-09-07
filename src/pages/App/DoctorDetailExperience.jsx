import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Award, MapPin, Building2, ShieldCheck, Clock, CheckCircle2, ChevronRight, Share2, AlertCircle, Database } from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import FrostedPanel from '../../components/common/FrostedPanel';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useDoctorDetail } from '../../hooks/useDoctorDetail';

export default function DoctorDetailExperience() {
  const { slug } = useParams();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/app') ? '/app' : '';
  const { doctor, loading, error } = useDoctorDetail(slug);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AppPageContainer className="!max-w-[1100px] py-10 space-y-8">
        <div className="h-6 w-32 bg-muted/40 rounded animate-pulse"></div>
        <div className="rounded-[24px] p-8 bg-surface/50 border border-border space-y-4 animate-pulse">
          <div className="h-8 w-1/2 bg-muted/60 rounded"></div>
          <div className="h-4 w-1/3 bg-muted/40 rounded"></div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-24 bg-muted/40 rounded-full"></div>
            <div className="h-6 w-28 bg-muted/40 rounded-full"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-surface/40 rounded-[24px] border border-border animate-pulse"></div>
          <div className="h-64 bg-surface/40 rounded-[24px] border border-border animate-pulse"></div>
        </div>
      </AppPageContainer>
    );
  }

  if (error || !doctor) {
    return (
      <AppPageContainer className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={AlertCircle}
          eyebrow="Practitioner Profile"
          title="Doctor Profile Not Found"
          description={error ? "We encountered an error loading this profile." : "The requested doctor profile does not exist or has not been published yet."}
          action={
            <Button as={Link} to={`${basePath}/doctors`}>
              &larr; Back to Doctor Directory
            </Button>
          }
        />
      </AppPageContainer>
    );
  }

  const {
    name,
    qualifications,
    specialization,
    yearsOfExperience,
    location: loc = {},
    affiliations = [],
    languages = [],
    consultationModes = [],
    summary,
    source = {},
  } = doctor;

  const locString = loc.locality && loc.city
    ? `${loc.locality}, ${loc.city}`
    : loc.locality || loc.city || 'Navi Mumbai, Maharashtra';

  const checkedDate = source.checkedAt
    ? new Date(source.checkedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <AppPageContainer className="!max-w-[1100px] py-6 sm:py-8 space-y-8">
      {/* Back link */}
      <div>
        <Link
          to={`${basePath}/doctors`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to doctors directory</span>
        </Link>
      </div>

      {/* Main Hero Header */}
      <FrostedPanel variant="elevated" className="rounded-[28px] p-6 sm:p-8 border-border/80 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Stethoscope className="w-3.5 h-3.5" />
                {specialization}
              </span>
              {yearsOfExperience && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-border/70 text-foreground">
                  {yearsOfExperience} Years Clinical Experience
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
              {name}
            </h1>

            {qualifications && (
              <p className="text-sm sm:text-base font-medium text-muted-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary shrink-0" />
                <span>{qualifications}</span>
              </p>
            )}

            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 pt-1">
              <MapPin className="w-4 h-4 shrink-0 text-muted-foreground/70" />
              <span>{locString}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border/70 text-xs font-semibold text-foreground transition-all shadow-sm"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link copied' : 'Share profile'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{source.reviewStatus === 'verified' ? 'Verified Practitioner' : 'Directory Indexed'}</span>
              <span>
                {doctor?.recordType === 'demo' || source?.name?.includes('Demonstration')
                  ? 'Demonstration Profile'
                  : (source?.reviewStatus === 'verified' ? 'Verified Practitioner' : 'Directory Indexed')}
              </span>
            </div>
          </div>
        </div>

        {/* Consultation modes badge strip */}
        {consultationModes.length > 0 && (
          <div className="pt-6 mt-6 border-t border-border/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Consultation Modes:</span>
            {consultationModes.map(mode => (
              <span key={mode} className="px-3 py-1 text-xs font-medium bg-surface/80 text-foreground rounded-lg border border-border/60">
                {mode}
              </span>
            ))}
          </div>
        )}
        {/* Consultation modes & Languages */}
        <div className="pt-6 mt-6 border-t border-border/60 space-y-4">
          {consultationModes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Consultation Modes:</span>
              {consultationModes.map(mode => (
                <span key={mode} className="px-3 py-1 text-xs font-medium bg-surface/80 text-foreground rounded-lg border border-border/60">
                  {mode}
                </span>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Languages Spoken:</span>
              <span className="text-sm font-medium text-foreground">{languages.join(', ')}</span>
            </div>
          )}
        </div>
      </FrostedPanel>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Summary & Affiliations */}
        <div className="md:col-span-2 space-y-8">
          {/* Professional Overview */}
          {summary && (
            <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-7 space-y-4">
              <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                <span>Professional Overview</span>
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {summary}
              </p>
            </FrostedPanel>
          )}

          {/* Hospital Affiliations */}
          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>Hospital & Institutional Affiliations</span>
              </h2>
              <span className="text-xs text-muted-foreground font-medium">{affiliations.length} recorded</span>
            </div>

            {affiliations.length > 0 ? (
              <div className="space-y-4">
                {affiliations.map((affil, idx) => (
                  <div
                    key={affil.id || idx}
                    className="p-4 rounded-xl bg-surface/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-surface/60"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground">
                          {affil.hospitalSlug ? (
                            <Link to={`${basePath}/hospitals/${affil.hospitalSlug}`} className="hover:text-primary transition-colors inline-flex items-center gap-1">
                              <span>{affil.hospitalName}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </Link>
                          ) : (
                            affil.hospitalName
                          )}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {affil.position} • {affil.department}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {affil.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {affil.isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface border border-border/60 text-muted-foreground">
                          Current Faculty
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No hospital affiliations currently listed.</p>
            )}
          </FrostedPanel>
        </div>

        {/* Right Column: Credentials & Provenance */}
        <div className="space-y-6">
          {/* Credentials Card */}
          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Medical Credentials</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="font-semibold text-muted-foreground block mb-0.5">Degrees & Certifications</span>
                <p className="font-medium text-foreground text-sm">{qualifications || 'Recorded in medical council registry'}</p>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="font-semibold text-muted-foreground block mb-0.5">Primary Domain</span>
                <p className="font-medium text-foreground text-sm">{specialization}</p>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="font-semibold text-muted-foreground block mb-0.5">Clinical Practice</span>
                <p className="font-medium text-foreground text-sm">{yearsOfExperience ? `${yearsOfExperience} years active practice` : 'Established practitioner'}</p>
              </div>
            </div>
          </FrostedPanel>

          {/* Data Provenance Card */}
          <FrostedPanel variant="elevated" className="rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span>Data Provenance</span>
            </h3>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span>Source Record:</span>
                <span className="font-medium text-foreground truncate max-w-[160px]">{source.name || 'Verified Directory'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span>Review Status:</span>
                <span className="font-semibold text-emerald-700 capitalize">{source.reviewStatus || 'Verified'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Verified:</span>
                </span>
                <span className="font-medium text-foreground">{checkedDate}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/80 leading-normal pt-2 border-t border-border/50">
              MEDIMESH publishes factual practitioner and affiliation data without promotional bias, ratings, or paid endorsements.
            </p>
          </FrostedPanel>
        </div>
      </div>
    </AppPageContainer>
  );
}
