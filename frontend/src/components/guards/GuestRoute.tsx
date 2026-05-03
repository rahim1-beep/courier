import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Role } from '../../types';
import { AuthLoadingScreen } from '../layout/AuthLoadingScreen';

export const GuestRoute: React.FC = () => {
  const { isAuthenticated, isHydrating, user } = useAuthStore();
  const location = useLocation();

  if (isHydrating) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    // Redirect to the page they were trying to access, or dashboard
    const from = (location.state as any)?.from?.pathname;
    
    if (from) {
      return <Navigate to={from} replace />;
    }
    
    if (user?.role === Role.CUSTOMER) {
      return <Navigate to="/customer-portal" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
