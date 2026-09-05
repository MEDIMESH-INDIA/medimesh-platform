import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProtectedRouteState } from './authGuardState';

export const ProtectedRoute = ({ children }) => {
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
  const routeState = getProtectedRouteState({
    authLoading,
    user,
    profileLoading,
    profileError,
    profile,
    role,
    pathname: location.pathname,
  });

  if (routeState.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
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
            Protected pages stay locked until your MEDIMESH profile is available.
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

  return children;
};
