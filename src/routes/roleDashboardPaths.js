export const ROLE_DASHBOARD_PATHS = Object.freeze({
  patient: '/app',
  doctor: '/doctor',
  hospital: '/hospital',
  admin: '/admin',
});

export const getRoleDashboardPath = (role) => ROLE_DASHBOARD_PATHS[role] ?? null;

export const getPostAuthDestination = ({ profile, role, requestedPath }) => {
  if (profile && !profile.onboarding_completed) {
    return '/onboarding';
  }
  
  if (requestedPath) {
    // Only allow relative paths to prevent open redirect vulnerabilities
    if (requestedPath.startsWith('/') && !requestedPath.startsWith('//')) {
      // Basic role-based prefix check for internal paths (optional, but good practice)
      // e.g., patient shouldn't redirect to /admin even if requested
      const pathPrefix = requestedPath.split('/')[1];
      const validPrefixes = {
        patient: ['app', 'profile', 'settings'],
        doctor: ['doctor', 'profile', 'settings'],
        hospital: ['hospital', 'profile', 'settings'],
        admin: ['admin', 'profile', 'settings'],
      };
      
      const allowed = validPrefixes[role] || [];
      if (allowed.includes(pathPrefix) || pathPrefix === '') {
        return requestedPath;
      }
    }
  }

  return getRoleDashboardPath(role) || '/';
};
