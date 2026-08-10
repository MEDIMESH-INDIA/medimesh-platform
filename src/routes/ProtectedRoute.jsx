import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Then check onboarding
  const isOnboardingRoute = location.pathname === '/onboarding';
  
  if (user && profile && !profile.onboarding_completed && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }
  
  if (user && profile && profile.onboarding_completed && isOnboardingRoute) {
    return <Navigate to="/app" replace />;
  }

  return children;
};
