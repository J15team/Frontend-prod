/**
 * Theme Storage Utility
 * テーマ設定の保存・取得を管理
 */

const THEME_KEY = 'theme';

export type Theme = 'light' | 'dark';

/**
 * テーマを保存
 */
export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

/**
 * 保存されたテーマを取得
 */
export const getStoredTheme = (): Theme | null => {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }
  return null;
};

/**
 * システムのテーマ設定を取得
 */
export const getSystemTheme = (): Theme => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

/**
 * 初期テーマを取得（保存済み > システム設定）
 */
export const getInitialTheme = (): Theme => {
  return getStoredTheme() || getSystemTheme();
};
