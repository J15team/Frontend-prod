/**
 * Admin Key Storage Utility
 * X-Admin-Keyの保存・取得・削除を管理
 */

const ADMIN_KEY_STORAGE_KEY = 'x_admin_key';

/**
 * X-Admin-KeyをlocalStorageに保存
 */
export const saveAdminKey = (key: string): void => {
  localStorage.setItem(ADMIN_KEY_STORAGE_KEY, key);
};

/**
 * 保存されたX-Admin-Keyを取得
 */
export const getAdminKey = (): string | null => {
  return localStorage.getItem(ADMIN_KEY_STORAGE_KEY);
};

/**
 * X-Admin-Keyを削除
 */
export const clearAdminKey = (): void => {
  localStorage.removeItem(ADMIN_KEY_STORAGE_KEY);
};

/**
 * X-Admin-Keyが保存されているかチェック
 */
export const hasAdminKey = (): boolean => {
  return getAdminKey() !== null;
};
