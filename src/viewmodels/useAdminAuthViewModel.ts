/**
 * Admin Auth ViewModel
 * 管理者認証ロジックを管理
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signin } from '@/services/AuthService';
import { type User } from '@/models/User';
import { getStoredUser, hasValidSession } from '@/utils/tokenStorage';

interface AdminSigninRequest {
  email: string;
  password: string;
}

interface AdminAuthViewModelReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  handleAdminSignin: (data: AdminSigninRequest) => Promise<void>;
}

export const useAdminAuthViewModel = (): AdminAuthViewModelReturn => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = hasValidSession();

  const handleAdminSignin = async (data: AdminSigninRequest): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // 1. サインイン処理
      const response = await signin({
        email: data.email,
        password: data.password,
      });

      // デバッグ: レスポンスの内容を確認
      console.log('Admin signin response:', response);
      console.log('User role:', response.user.role);

      // 2. ロールがROLE_ADMINかチェック
      // JWTトークンからデコードされたroleを使用
      if (response.user.role !== 'ROLE_ADMIN') {
        throw new Error('管理者権限がありません。このアカウントは管理者として登録されていません。');
      }

      setUser(response.user);

      // 3. Admin Portalダッシュボードへ遷移
      navigate('/admin');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('管理者サインインに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    handleAdminSignin,
  };
};
