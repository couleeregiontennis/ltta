import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export const ProtectedRoute = ({ children, requireAdmin, requireCaptain, allowIncompleteProfile = false }) => {
  const { session, loading, userRole, hasProfile } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-state">Loading...</div>;
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Force onboarding if the user lacks a profile, unless the route explicitly allows it
  if (hasProfile === false && !allowIncompleteProfile) {
    return <Navigate to="/welcome" replace />;
  }

  if (requireAdmin && !userRole?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireCaptain && !userRole?.isCaptain) {
    return <Navigate to="/" replace />;
  }

  return children;
};
