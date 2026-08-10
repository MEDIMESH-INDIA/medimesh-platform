import { useAuth } from '../../hooks/useAuth';
import PatientOnboarding from '../../components/onboarding/PatientOnboarding';
import DoctorOnboarding from '../../components/onboarding/DoctorOnboarding';
import HospitalOnboarding from '../../components/onboarding/HospitalOnboarding';
import { Navigate } from 'react-router-dom';

export default function Onboarding() {
  const { role, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {role === 'patient' && <PatientOnboarding />}
      {role === 'doctor' && <DoctorOnboarding />}
      {role === 'hospital' && <HospitalOnboarding />}
    </div>
  );
}
