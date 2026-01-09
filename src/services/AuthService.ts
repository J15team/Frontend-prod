/**
 * Auth Service
 * 認証関連のAPI通信を管理
 */
import apiClient from './apiClient';
import {
  type SignupRequest,
  type SigninRequest,
  type SignupResponse,
  type SigninResponse,
  type TokenRefreshResponse,
  normalizeUser,
  type User,
} from '@/models/User';
import { saveTokens, saveUser, clearSession, getRefreshToken } from '@/utils/tokenStorage';
import { getRoleFromToken } from '@/utils/jwtDecoder';

/**
 * Googleログインレスポンス
 */
interface GoogleSigninResponse extends SigninResponse {
  isNewUser: boolean;
  isFirstLogin?: boolean;
}

const isSigninResponse = (payload: SignupResponse | SigninResponse): payload is SigninResponse => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'accessToken' in payload &&
    'refreshToken' in payload &&
    'user' in payload
  );
};

/**
 * サインアップ
 */
export const signup = async (data: SignupRequest): Promise<User> => {
  const response = await apiClient.post<SignupResponse | SigninResponse>('/auth/signup', data);
  let userPayload: SignupResponse;

  if (isSigninResponse(response.data)) {
    const normalizedUser = normalizeUser(response.data.user);
    saveTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
    saveUser(normalizedUser);
    return normalizedUser;
  }

  userPayload = response.data as SignupResponse;
  const normalizedUser = normalizeUser(userPayload);
  saveUser(normalizedUser);
  return normalizedUser;
};

/**
 * サインイン
 */
export const signin = async (data: SigninRequest): Promise<SigninResponse> => {
  const response = await apiClient.post<SigninResponse>('/auth/signin', data);
  const normalizedUser = normalizeUser(response.data.user);

  // JWTトークンからroleを取得してユーザーオブジェクトに追加
  const roleFromToken = getRoleFromToken(response.data.accessToken);
  if (roleFromToken) {
    normalizedUser.role = roleFromToken as 'ROLE_USER' | 'ROLE_ADMIN';
  }

  saveTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
  saveUser(normalizedUser);

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: normalizedUser,
    message: response.data.message,
  };
};

/**
 * Googleログイン（ID Token方式）
 */
export const googleSignin = async (credential: string): Promise<GoogleSigninResponse> => {
  const response = await apiClient.post<GoogleSigninResponse>('/auth/google/token', {
    credential,
  });
  const normalizedUser = normalizeUser(response.data.user);

  // JWTトークンからroleを取得してユーザーオブジェクトに追加
  const roleFromToken = getRoleFromToken(response.data.accessToken);
  if (roleFromToken) {
    normalizedUser.role = roleFromToken as 'ROLE_USER' | 'ROLE_ADMIN';
  }

  saveTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
  saveUser(normalizedUser);

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: normalizedUser,
    isNewUser: response.data.isNewUser,
    message: response.data.message,
  };
};

/**
 * トークンリフレッシュ
 */
export const refreshTokens = async (): Promise<TokenRefreshResponse> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('リフレッシュトークンが見つかりません');
  }

  const response = await apiClient.post<TokenRefreshResponse>('/auth/refresh', {
    refreshToken,
  });
  saveTokens(response.data);
  return response.data;
};

/**
 * サインアウト
 */
export const signout = (): void => {
  clearSession();
};
