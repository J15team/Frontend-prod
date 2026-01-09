/**
 * GitHub Token Storage
 * GitHub連携用のトークン管理
 */

const GITHUB_TOKEN_KEY = 'github_access_token';
const GITHUB_USER_KEY = 'github_user';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

/**
 * GitHubトークンを保存
 */
export const saveGitHubToken = (token: string): void => {
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
};

/**
 * GitHubトークンを取得
 */
export const getGitHubToken = (): string | null => {
  return localStorage.getItem(GITHUB_TOKEN_KEY);
};

/**
 * GitHubユーザー情報を保存
 */
export const saveGitHubUser = (user: GitHubUser): void => {
  localStorage.setItem(GITHUB_USER_KEY, JSON.stringify(user));
};

/**
 * GitHubユーザー情報を取得
 */
export const getGitHubUser = (): GitHubUser | null => {
  const data = localStorage.getItem(GITHUB_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * GitHub連携を解除
 */
export const clearGitHubConnection = (): void => {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
  localStorage.removeItem(GITHUB_USER_KEY);
};

/**
 * GitHub連携済みかチェック
 */
export const isGitHubConnected = (): boolean => {
  return getGitHubToken() !== null;
};
