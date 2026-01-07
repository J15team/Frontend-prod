/**
 * ProtectedRoute Component
 * 認証とロールベースのアクセス制御を提供するコンポーネント
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasValidSession, getStoredUser } from '@/utils/tokenStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;      // 管理者権限が必要か
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  // 基本的な認証チェック
  if (!hasValidSession()) {
    return <Navigate to="/auth/signin" replace />;
  }

  const user = getStoredUser();

  // 管理者権限チェック
  if (requireAdmin && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/error/forbidden" replace />;
  }

  return <>{children}</>;
};
