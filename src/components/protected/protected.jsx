import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/authContext';

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.token) { // Check for user and token
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) { // Check for role authorization
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
