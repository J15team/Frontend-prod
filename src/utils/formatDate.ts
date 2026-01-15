/**
 * formatDate
 * 日付フォーマットユーティリティ
 * Single Responsibility: 日付文字列の整形のみを担当
 */

/**
 * ISO日付文字列をロケール形式に変換
 * @param value - ISO日付文字列 (e.g., "2024-01-15T10:30:00Z")
 * @param fallback - 値がない場合のフォールバック文字列
 * @returns フォーマット済み日付文字列
 */
export const formatDate = (value?: string, fallback = '-'): string => {
  if (!value) return fallback;
  const date = new Date(value);
  return date.toLocaleString();
};

/**
 * 日付のみをフォーマット（時刻なし）
 */
export const formatDateOnly = (value?: string, fallback = '-'): string => {
  if (!value) return fallback;
  const date = new Date(value);
  return date.toLocaleDateString();
};

/**
 * 相対時間を返す（例: "3日前"）
 */
export const formatRelativeTime = (value?: string, fallback = '-'): string => {
  if (!value) return fallback;

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return `${Math.floor(diffDays / 365)}年前`;
};
