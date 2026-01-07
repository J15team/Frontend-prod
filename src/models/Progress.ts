/**
 * Progress Model
 * 進捗情報を表すモデル
 */

/**
 * ClearedSection
 * 完了済みセクションの情報
 */
export interface ClearedSection {
  sectionId: number;
  completedAt: string;
}

/**
 * ProgressData
 * 進捗データ全体の構造
 */
export interface ProgressData {
  userId: string;
  subjectId: number;
  progressPercentage: number;
  clearedCount: number;
  remainingCount: number;
  totalSections: number;
  isAllCleared: boolean;
  nextSectionId: number | null;
  clearedSections: ClearedSection[];
}

/**
 * MarkSectionRequest
 * セクション完了マークのリクエスト
 */
export interface MarkSectionRequest {
  sectionId: number;
}

/**
 * セクション完了/解除レスポンス
 */
export interface ProgressActionResponse {
  message: string;
  sectionId?: number;
  completedAt?: string;
}
