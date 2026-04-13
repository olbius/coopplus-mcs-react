import { type FC, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, permission }) => {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
