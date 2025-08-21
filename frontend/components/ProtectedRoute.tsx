// src/components/ProtectedRoute.tsx

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const ProtectedRoute = () => {
  const { user } = useUserContext();
  const location = useLocation();

  if (!user) {
    // Redirect unauthenticated users to /signin, keeping the page they tried to access
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
