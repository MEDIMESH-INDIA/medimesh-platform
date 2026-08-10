import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
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

  if (role && !allowedRoles.includes(role)) {
    // If the user's role is not allowed, redirect them to their respective dashboard
    if (role === 'patient') return <Navigate to="/app" replace />;
    if (role === 'doctor') return <Navigate to="/doctor" replace />;
    if (role === 'hospital') return <Navigate to="/hospital" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    
    // Fallback if role is unknown or invalid
    return <Navigate to="/" replace />;
  }

  return children;
};
