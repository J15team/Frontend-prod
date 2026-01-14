/**
 * ProtectedRoute Component
 * 認証とロールベースのアクセス制御を提供するコンポーネント
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasValidSession, getStoredUser } from '@/utils/storage/tokenStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  if (!hasValidSession()) {
    return <Navigate to="/auth/signin" replace />;
  }

  const user = getStoredUser();

  if (requireAdmin && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/error/forbidden" replace />;
  }

  return <>{children}</>;
};
