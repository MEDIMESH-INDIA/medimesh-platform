import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Award, Stethoscope, Building2, ShieldCheck, Home, ArrowRight } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import FrostedPanel from '../../../components/common/FrostedPanel';
import LoadingState from '../../../components/common/LoadingState';
import { useDoctorPortal } from '../../../hooks/useDoctorPortal';
import { useAuth } from '../../../hooks/useAuth';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const { getProfile, getQualifications, getSpecializations, getAffiliations } = useDoctorPortal();
  
  const [data, setData] = useState({
    docProfile: null,
    qualifications: [],
    specialization: null,
    affiliations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [docProfile, qualifications, specialization, affiliations] = await Promise.all([
        getProfile(),
        getQualifications(),
        getSpecializations(),
        getAffiliations()
      ]);
      setData({ docProfile, qualifications, specialization, affiliations });
      setLoading(false);
    }
    load();
  }, [getProfile, getQualifications, getSpecializations, getAffiliations]);

  if (loading) return <AppPageContainer><LoadingState message="Loading dashboard..." /></AppPageContainer>;

  const { docProfile, qualifications, specialization, affiliations } = data;
  
  const profileComplete = docProfile?.public_display_name && docProfile?.years_of_experience && docProfile?.city;
  const hasSpec = specialization?.primary_specialization ? true : false;
  
  let completePoints = 0;
  if (profileComplete) completePoints++;
  if (qualifications.length > 0) completePoints++;
  if (hasSpec) completePoints++;
  if (affiliations.length > 0) completePoints++;
  
  const completion = Math.round((completePoints / 4) * 100);

  const stats = [
    { label: 'Profile', status: profileComplete ? 'Configured' : 'Needs attention', icon: User, href: '/doctor/profile' },
    { label: 'Qualifications', status: `${qualifications.length} records`, icon: Award, href: '/doctor/qualifications' },
    { label: 'Specializations', status: hasSpec ? specialization.primary_specialization : 'None set', icon: Stethoscope, href: '/doctor/specializations' },
    { label: 'Affiliations', status: `${affiliations.length} hospitals`, icon: Building2, href: '/doctor/affiliations' },
    { label: 'Home Visits', status: docProfile?.offers_home_visits ? 'Enabled' : 'Disabled', icon: Home, href: '/doctor/home-visits' },
    { label: 'Verification', status: profile?.verification_status || 'Pending', icon: ShieldCheck, href: '/doctor/verification' },
  ];

  return (
    <AppPageContainer className="!max-w-[1000px] space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Doctor Portal</h1>
        <p className="text-muted-foreground">Manage your professional profile, credentials, and settings.</p>
      </div>

      <FrostedPanel className="p-6 rounded-[24px]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Profile Completeness</h2>
          <span className="text-primary font-bold">{completion}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-primary/10 mb-5">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completion}%` }} />
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map(stat => (
            <Link key={stat.label} to={stat.href} className="p-4 rounded-xl border border-border/60 bg-surface/40 hover:bg-surface hover:border-primary/20 transition-all group flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-primary/10 text-primary rounded-lg">
                  <stat.icon className="w-5 h-5" />
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{stat.label}</h3>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{stat.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </FrostedPanel>

      <FrostedPanel className="p-6 rounded-[24px] bg-primary/5 border-primary/10 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Public Profile</h3>
          <p className="text-sm text-muted-foreground">See how patients view your profile in the directory.</p>
        </div>
        <Link 
          to={docProfile?.slug ? `/doctors/${docProfile.slug}` : '/doctors'}
          className="px-5 py-2.5 rounded-xl bg-white text-primary font-semibold text-sm border border-primary/20 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
        >
          View Profile
        </Link>
      </FrostedPanel>
    </AppPageContainer>
  );
}
