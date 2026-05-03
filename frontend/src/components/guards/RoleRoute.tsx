import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Role } from '../../types';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If they are a customer and try to access admin routes, redirect to customer portal
    if (user.role === Role.CUSTOMER) {
      return <Navigate to="/customer-portal" replace />;
    }
    // Otherwise redirect to main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
