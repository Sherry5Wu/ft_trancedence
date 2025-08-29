// src/components/ProtectedRoute.tsx

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const ProtectedRoute = () => {
	const { user, refreshDone, tokenReceived } = useUserContext();
	const location = useLocation();

	if (!refreshDone)
		return <div className='bg-[#FFCC00]'>Loading...</div>
		
	if (tokenReceived && user)
		return <Outlet />;

	// Redirect unauthenticated users to /signin, keeping the page they tried to access
	return <Navigate to="/signin" state={{ from: location }} replace />;
};

export default ProtectedRoute;
