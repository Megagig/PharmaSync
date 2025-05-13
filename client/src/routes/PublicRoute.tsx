import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  return isAuthenticated ? <Navigate to={from} replace /> : <Outlet />;
};

export default PublicRoute;
