/**
 * Subject Model
 * 題材情報を表すモデル
 */
export interface Subject {
  subjectId: number;
  title: string;
  description: string;
  maxSections: number;
  weight?: number;
  createdAt?: string;
}

/**
 * 題材作成リクエスト
 */
export interface CreateSubjectRequest {
  subjectId: number;
  title: string;
  description?: string;
  maxSections: number;
  weight: number;
}

/**
 * 題材更新リクエスト
 */
export interface UpdateSubjectRequest {
  title: string;
  description?: string;
  maxSections: number;
  weight: number;
}
