export const ROLE_DASHBOARD_PATHS = Object.freeze({
  patient: '/app',
  doctor: '/doctor',
  hospital: '/hospital',
  admin: '/admin',
});

export const getRoleDashboardPath = (role) => ROLE_DASHBOARD_PATHS[role] ?? null;
