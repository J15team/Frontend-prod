/**
 * Progress Service
 * 進捗管理関連のAPI通信を管理
 */
import apiClient from './apiClient';
import { type ProgressData, type MarkSectionRequest, type ProgressActionResponse } from '@/models/Progress';

/**
 * 進捗情報を取得
 */
export const getProgress = async (subjectId: number): Promise<ProgressData> => {
  const response = await apiClient.get<ProgressData>(`/progress/subjects/${subjectId}`);
  return response.data;
};

/**
 * セクションを完了としてマーク
 */
export const markSectionComplete = async (
  subjectId: number,
  request: MarkSectionRequest
): Promise<ProgressActionResponse> => {
  const response = await apiClient.post<ProgressActionResponse>(
    `/progress/subjects/${subjectId}/sections`,
    request
  );
  return response.data;
};

/**
 * セクションの完了マークを解除
 */
export const unmarkSectionComplete = async (
  subjectId: number,
  sectionId: number
): Promise<ProgressActionResponse> => {
  const response = await apiClient.delete<ProgressActionResponse>(
    `/progress/subjects/${subjectId}/sections/${sectionId}`
  );
  return response.data;
};
