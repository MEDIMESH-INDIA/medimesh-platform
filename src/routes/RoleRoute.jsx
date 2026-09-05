import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleRouteState } from './authGuardState';

export const RoleRoute = ({ children, allowedRoles }) => {
  const {
    user,
    profile,
    role,
    authLoading,
    profileLoading,
    profileError,
  } = useAuth();
  const location = useLocation();
  const routeState = getRoleRouteState({
    authLoading,
    user,
    profileLoading,
    profileError,
    profile,
    role,
    pathname: location.pathname,
    allowedRoles,
  });

  if (routeState.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
          role="status"
          aria-label="Loading account role"
        />
      </div>
    );
  }

  if (routeState.status === 'redirect') {
    return <Navigate to={routeState.to} replace />;
  }

  return children ?? <Outlet />;
};
