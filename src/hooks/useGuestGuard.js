import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getRoleDashboardPath } from '../routes/roleDashboardPaths';

export const useGuestGuard = () => {
  const { user, profile, role, authLoading, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading && user && profile) {
      if (profile.onboarding_completed) {
        navigate(getRoleDashboardPath(role) ?? '/');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, profile, authLoading, profileLoading, role, navigate]);
};
