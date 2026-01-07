/**
 * JWT Token Decoder Utility
 * JWTトークンをデコードしてペイロードを取得
 */

interface JwtPayload {
  sub: string;
  role?: string;
  iat: number;
  exp: number;
}

/**
 * JWTトークンをデコード（検証なし）
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * JWTトークンからロールを取得
 */
export const getRoleFromToken = (token: string): string | null => {
  const payload = decodeJwt(token);
  return payload?.role || null;
};
