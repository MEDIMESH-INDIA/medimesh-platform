import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGuestRouteState } from './authGuardState';
import MedimeshLogo from '../components/brand/MedimeshLogo';

export const GuestRoute = ({ children }) => {
  const {
    user,
    profile,
    role,
    authLoading,
    profileLoading,
    profileError,
    refreshProfile,
    signOut,
  } = useAuth();
  const location = useLocation();
  const requestedPath = new URLSearchParams(location.search).get('redirect') || null;

  const routeState = getGuestRouteState({
    authLoading,
    user,
    profileLoading,
    profileError,
    profile,
    role,
    requestedPath,
  });

  if (routeState.status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <MedimeshLogo variant="mark" size="lg" className="animate-pulse" />
        <div
          className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-50"
          role="status"
          aria-label="Loading account"
        />
      </div>
    );
  }

  if (routeState.status === 'redirect') {
    return <Navigate to={routeState.to} replace />;
  }

  if (routeState.status === 'profile-error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-white p-6 text-center shadow-sm" role="alert">
          <h1 className="text-xl font-semibold text-foreground">We could not load your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There was a problem loading your MEDIMESH profile.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              onClick={() => void refreshProfile()}
            >
              Try again
            </button>
            <button
              type="button"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground"
              onClick={() => void signOut()}
            >
              Sign in again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children ?? <Outlet />;
};
