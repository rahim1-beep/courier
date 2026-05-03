import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { AuthLoadingScreen } from '../layout/AuthLoadingScreen';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, accessToken, isHydrating, setUser, setHydrated, logout } = useAuthStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // If we have a token but no user object, or we just loaded, we should verify token
      // In this memory-only implementation, if there's no token, we just redirect.
      if (!accessToken) {
        setHydrated();
        return;
      }

      if (isAuthenticated) {
        setHydrated();
        return;
      }

      try {
        setIsVerifying(true);
        const profile = await authApi.getProfile();
        setUser({ ...profile, name: (profile.name || 'User') } as any);
      } catch (error) {
        console.error('Auth verification failed', error);
        logout();
      } finally {
        setIsVerifying(false);
        setHydrated();
      }
    };

    if (isHydrating) {
      verifyAuth();
    }
  }, [accessToken, isAuthenticated, isHydrating, setUser, setHydrated, logout]);

  if (isHydrating || isVerifying) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
