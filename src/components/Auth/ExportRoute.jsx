// /src/components/Auth/ExportRoute.jsx
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ExportRoute = ({ children }) => {
  const { userRole, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  // Redirect clients to their dashboard
  if (userRole === 'client') {
    return <Navigate to="/client/EmailMarketingRoutes" replace />;
  }
  
  // Allow admin and staff
  if (userRole === 'admin' || userRole === 'staff') {
    return children;
  }
  
  // Default to login for unauthenticated users
  return <Navigate to="/login" replace />;
};

export default ExportRoute;