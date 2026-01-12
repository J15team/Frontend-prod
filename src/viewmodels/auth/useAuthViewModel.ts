/**
 * Auth ViewModel
 * 認証ロジックを管理するViewModel
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, signin, signout, refreshTokens, googleSignin } from '@/services/auth/AuthService';
import { type SignupRequest, type SigninRequest, type User } from '@/models/User';
import { getStoredUser, hasValidSession } from '@/utils/storage/tokenStorage';

interface AuthViewModelReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  handleSignup: (data: SignupRequest) => Promise<void>;
  handleSignin: (data: SigninRequest) => Promise<void>;
  handleGoogleSignin: (credential: string) => Promise<void>;
  handleSignout: () => void;
  handleRefresh: () => Promise<boolean>;
}

export const useAuthViewModel = (): AuthViewModelReturn => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // トークンの存在確認
  const isAuthenticated = hasValidSession();

  /**
   * サインアップ処理
   */
  const handleSignup = async (data: SignupRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const createdUser = await signup(data);
      setUser(createdUser);
      // サインアップ成功後、サインインページへ遷移
      navigate('/auth/signin');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('サインアップに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * サインイン処理
   */
  const handleSignin = async (data: SigninRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await signin(data);
      setUser(response.user);
      // サインイン成功後、題材一覧ページへ遷移（初回ログインフラグを渡す）
      navigate('/subjects', { state: { isFirstLogin: response.isFirstLogin } });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('サインインに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Googleサインイン処理
   */
  const handleGoogleSignin = async (credential: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await googleSignin(credential);
      setUser(response.user);
      // サインイン成功後、題材一覧ページへ遷移（初回ログインフラグを渡す）
      navigate('/subjects', { state: { isFirstLogin: response.isFirstLogin } });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('409')) {
          setError('このメールアドレスは既に登録されています');
        } else {
          setError(err.message);
        }
      } else {
        setError('Googleサインインに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * サインアウト処理
   */
  const handleSignout = (): void => {
    signout();
    setUser(null);
    // サインアウト後、サインインページへ遷移
    navigate('/auth/signin');
  };

  /**
   * リフレッシュトークンを使用してトークンを更新
   */
  const handleRefresh = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await refreshTokens();
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('トークンの更新に失敗しました');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    handleSignup,
    handleSignin,
    handleGoogleSignin,
    handleSignout,
    handleRefresh,
  };
};
