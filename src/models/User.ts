/**
 * User Model
 * ユーザー情報を表すモデル
 */
export interface User {
  userId: string;
  email: string;
  username: string;
  role?: 'ROLE_USER' | 'ROLE_ADMIN';
  createdAt?: string;
}

/**
 * APIから返却されるユーザー情報
 * userIdが存在しない場合に備えてidフィールドも許容
 */
export interface UserApiResponse {
  userId?: string;
  id?: string;
  email: string;
  username: string;
  role?: 'ROLE_USER' | 'ROLE_ADMIN';
  createdAt?: string;
}

/**
 * サーバーからのレスポンスを正規化
 */
export const normalizeUser = (payload: UserApiResponse): User => ({
  userId: payload.userId ?? payload.id ?? '',
  email: payload.email,
  username: payload.username,
  role: payload.role,
  createdAt: payload.createdAt,
});

/**
 * Signup Request
 * サインアップリクエストのデータ構造
 */
export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

/**
 * Signin Request
 * サインインリクエストのデータ構造
 */
export interface SigninRequest {
  email: string;
  password: string;
}

/**
 * サインアップレスポンス
 */
export type SignupResponse = UserApiResponse;

/**
 * アクセス/リフレッシュトークンのペア
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * サインインレスポンス
 */
export interface SigninResponse extends AuthTokens {
  user: User;
  message?: string;
}

/**
 * リフレッシュリクエスト
 */
export interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * リフレッシュレスポンス
 */
export type TokenRefreshResponse = AuthTokens;
