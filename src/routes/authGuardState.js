import { getRoleDashboardPath, getPostAuthDestination } from './roleDashboardPaths.js';

export const getCachedUserId = () => {
  if (typeof localStorage === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && ((key.startsWith('sb-') && key.endsWith('-auth-token')) || key === 'supabase.auth.token')) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          const userId = parsed?.user?.id || parsed?.currentSession?.user?.id;
          if (typeof userId === 'string' && userId.length > 0) {
            return userId;
          }
        }
      }
    }
  } catch {
    // Ignore quota/permission/parsing errors
  }
  return null;
};

export const getAuthIdentityTransition = (currentUserId, nextSession) => {
  const nextUser = nextSession?.user ?? null;
  const nextUserId = nextUser?.id ?? null;
  const identityChanged = currentUserId !== nextUserId;

  return {
    nextUser,
    nextUserId,
    identityChanged,
    shouldClearProfile: !nextUser || identityChanged,
    shouldLoadProfile: Boolean(nextUser) && identityChanged,
  };
};

export const getProtectedRouteState = ({
  authLoading,
  user,
  profileLoading,
  profileError,
  profile,
  role,
  pathname,
}) => {
  if (authLoading || (user && profileLoading)) return { status: 'loading' };

  if (!user) {
    return {
      status: 'redirect',
      to: `/login?redirect=${encodeURIComponent(pathname)}`,
    };
  }

  if (profileError || !profile || profile.id !== user.id || !role) {
    return { status: 'profile-error' };
  }

  const isOnboardingRoute = pathname === '/onboarding';

  if (!profile.onboarding_completed && !isOnboardingRoute) {
    return { status: 'redirect', to: '/onboarding' };
  }

  if (profile.onboarding_completed && isOnboardingRoute) {
    return {
      status: 'redirect',
      to: getRoleDashboardPath(role) ?? '/',
    };
  }

  return { status: 'allow' };
};

export const getRoleRouteState = ({
  authLoading,
  user,
  profileLoading,
  profileError,
  profile,
  role,
  pathname,
  allowedRoles,
}) => {
  if (authLoading || (user && profileLoading)) return { status: 'loading' };

  if (!user) {
    return {
      status: 'redirect',
      to: `/login?redirect=${encodeURIComponent(pathname)}`,
    };
  }

  if (profileError || !profile || profile.id !== user.id || !role) {
    return { status: 'redirect', to: '/' };
  }

  if (!profile.onboarding_completed) {
    return { status: 'redirect', to: '/onboarding' };
  }

  if (!Array.isArray(allowedRoles) || !allowedRoles.includes(role)) {
    return {
      status: 'redirect',
      to: getRoleDashboardPath(role) ?? '/',
    };
  }

  return { status: 'allow' };
};

export const getGuestRouteState = ({
  authLoading,
  user,
  profileLoading,
  profileError,
  profile,
  role,
  requestedPath,
}) => {
  if (authLoading || (user && profileLoading)) return { status: 'loading' };

  if (!user) {
    return { status: 'allow' };
  }

  if (profileError || !profile || profile.id !== user.id || !role) {
    return { status: 'profile-error' };
  }

  return {
    status: 'redirect',
    to: getPostAuthDestination({ profile, role, requestedPath }),
  };
};
