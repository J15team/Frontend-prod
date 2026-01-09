/**
 * Deadline Storage Utility
 * 題材の目標期限をlocalStorageで管理
 */

const DEADLINE_KEY = 'subject_deadlines';

export interface SubjectDeadline {
  subjectId: number;
  deadline: string; // ISO date string
}

/**
 * 全ての期限を取得
 */
export const getAllDeadlines = (): Record<number, string> => {
  const stored = localStorage.getItem(DEADLINE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

/**
 * 特定の題材の期限を取得
 */
export const getDeadline = (subjectId: number): string | null => {
  const deadlines = getAllDeadlines();
  return deadlines[subjectId] || null;
};

/**
 * 期限を保存
 */
export const setDeadline = (subjectId: number, deadline: string): void => {
  const deadlines = getAllDeadlines();
  deadlines[subjectId] = deadline;
  localStorage.setItem(DEADLINE_KEY, JSON.stringify(deadlines));
};

/**
 * 期限を削除
 */
export const removeDeadline = (subjectId: number): void => {
  const deadlines = getAllDeadlines();
  delete deadlines[subjectId];
  localStorage.setItem(DEADLINE_KEY, JSON.stringify(deadlines));
};

/**
 * Googleカレンダー用のURLを生成
 */
export const generateGoogleCalendarUrl = (
  title: string,
  deadline: string,
  description?: string
): string => {
  const date = new Date(deadline);
  // 終日イベントとして設定
  const startDate = date.toISOString().split('T')[0].replace(/-/g, '');
  const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `【学習目標】${title}`,
    dates: `${startDate}/${endDate}`,
    details: description || `${title}の学習を完了する`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * 期限までの残り日数を計算
 */
export const getDaysRemaining = (deadline: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
