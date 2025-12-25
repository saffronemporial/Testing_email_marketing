// src/components/Auth/ProtectedRoute.jsx
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { useExport } from '../../context/ExportContext';

const ProtectedRoute = ({ children, requiredRole, requiredPermissions = [] }) => {
  const { user, userRole, loading, isAdmin, isClient, isStaff } = useAuth();
  const { hasExportAccess } = useExport(); // ensure this is a boolean or a function

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ handle export access correctly
  if (window.location.pathname.includes('/export')) {
    const allowed =
      typeof hasExportAccess === 'function'
        ? hasExportAccess()
        : !!hasExportAccess; // treat non-function as boolean
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on user's actual role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/EmailMarketingRoutes" replace />;
      case 'client':
        return <Navigate to="/EmailMarketingRoutes" replace />;
      case 'staff':
        return <Navigate to="/EmailMarketingRoutes" replace />;
      default:
        return <Navigate to="/EmailMarketingRoutes" replace />;
    }
  }

  // Additional permission checks
  if (requiredPermissions.length > 0) {
    // Implement permission checking logic based on your user profile structure
    const hasPermission = false; // Replace with actual permission check
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

/* -----------------------------
   🔧 Extra helper exports
   ----------------------------- */

// Exported utility functions for reuse in other files

export const checkExportAccess = (hasExportAccess) => {
  return typeof hasExportAccess === 'function'
    ? hasExportAccess()
    : !!hasExportAccess;
};

export const redirectByRole = (userRole) => {
  switch (userRole) {
    case 'admin':
      return '/EmailOverviewDashboard';
    case 'client':
      return '/EmailOverviewDashboard';
    case 'staff':
      return '/EmailOverviewDashboard';
    default:
      return '/EmailOverviewDashboard';
  }
};

export const hasRequiredPermissions = (userPermissions = [], requiredPermissions = []) => {
  // Simple check: all requiredPermissions must be in userPermissions
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
};
