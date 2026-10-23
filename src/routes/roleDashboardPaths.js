export const ROLE_DASHBOARD_PATHS = Object.freeze({
  patient: '/app',
  doctor: '/doctor',
  hospital: '/hospital',
  admin: '/admin',
});

export const getRoleDashboardPath = (role) => ROLE_DASHBOARD_PATHS[role] ?? null;

/**
 * Validates whether a requested return path is a safe, internal MEDIMESH route.
 * Strictly prevents open redirect attacks.
 */
export function isValidReturnDestination(requestedPath, role = 'patient') {
  if (!requestedPath || typeof requestedPath !== 'string') return false;

  // Must be a relative path starting with /
  if (!requestedPath.startsWith('/') || requestedPath.startsWith('//') || requestedPath.startsWith('/\\')) {
    return false;
  }

  // Must not contain scheme or backslashes
  if (requestedPath.includes('://') || requestedPath.includes('\\')) {
    return false;
  }

  // Clean query/hash to inspect path segments
  const pathPart = requestedPath.split('?')[0].split('#')[0];
  const segments = pathPart.split('/').filter(Boolean);
  const primaryPrefix = segments[0] || '';

  // Public discovery & care routes open to any role or guest
  const publicPrefixes = ['discover', 'doctors', 'hospitals', 'compare', 'care-finder', 'home-visits', 'about', ''];
  if (publicPrefixes.includes(primaryPrefix)) {
    return true;
  }

  // Role-specific workspace boundaries
  const rolePrefixes = {
    patient: ['app', 'profile', 'settings', 'saved'],
    doctor: ['doctor', 'profile', 'settings'],
    hospital: ['hospital', 'profile', 'settings'],
    admin: ['admin', 'profile', 'settings'],
  };

  const allowed = rolePrefixes[role] || [];
  return allowed.includes(primaryPrefix);
}

/**
 * Sanitizes a return destination, falling back to role dashboard or root.
 */
export function sanitizeReturnDestination(requestedPath, role = 'patient', fallback = null) {
  const safeFallback = fallback || getRoleDashboardPath(role) || '/';
  if (isValidReturnDestination(requestedPath, role)) {
    return requestedPath;
  }
  return safeFallback;
}

export const getPostAuthDestination = ({ profile, role, requestedPath }) => {
  if (profile && !profile.onboarding_completed) {
    return '/onboarding';
  }

  return sanitizeReturnDestination(requestedPath, role, getRoleDashboardPath(role) || '/');
};
