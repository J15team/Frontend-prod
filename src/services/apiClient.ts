/**
 * API Client
 * Axiosのベース設定とインターセプター
 */
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearSession } from '@/utils/tokenStorage';
import { getAdminKey } from '@/utils/adminKeyStorage';
import { type TokenRefreshResponse } from '@/models/User';

// ベースURL設定
const BASE_URL = 'https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com/api';

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshRequestPromise: Promise<string | null> | null = null;

const requestTokenRefresh = async (): Promise<string | null> => {
  if (!refreshRequestPromise) {
    refreshRequestPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      try {
        const response = await axios.post<TokenRefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        saveTokens(response.data);
        return response.data.accessToken;
      } catch (error) {
        console.error('Failed to refresh token', error);
        return null;
      } finally {
        refreshRequestPromise = null;
      }
    })();
  }

  return refreshRequestPromise;
};

// Axiosインスタンスを作成
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: 全てのリクエストにトークンとX-Admin-Keyを追加
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // X-Admin-Keyが保存されている場合は自動的に追加
    const adminKey = getAdminKey();
    if (adminKey && config.headers) {
      config.headers['X-Admin-Key'] = adminKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター: 401エラーの場合はトークンを削除してログインページへ
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config as AuthenticatedRequestConfig | undefined;

      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const newAccessToken = await requestTokenRefresh();
        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      }

      clearSession();
      window.location.href = '/auth/signin';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
