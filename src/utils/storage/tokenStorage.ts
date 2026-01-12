/**
 * Token Storage Utility
 * JWTトークンとユーザー情報の保存・取得・削除を管理
 */
import { type AuthTokens, type User } from '@/models/User';
import { clearAdminKey } from './adminKeyStorage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

/**
 * トークンをローカルストレージに保存
 */
export const saveTokens = ({ accessToken, refreshToken }: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * ユーザー情報を保存
 */
export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * ローカルストレージからアクセストークンを取得
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * リフレッシュトークンを取得
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * 保存済みのユーザー情報を取得
 */
export const getStoredUser = (): User | null => {
  const value = localStorage.getItem(USER_KEY);
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as User;
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
};

/**
 * トークンとユーザー情報を削除
 */
export const clearSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearAdminKey(); // Admin Keyもクリア
};

/**
 * トークンが存在するかチェック
 */
export const hasValidSession = (): boolean => {
  return getAccessToken() !== null;
};
