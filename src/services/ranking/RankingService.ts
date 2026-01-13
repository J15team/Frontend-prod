/**
 * Ranking Service
 * ランキング・閲覧記録関連のAPI通信
 */
import apiClient from '../apiClient';
import { type SubjectRanking, type TagRanking, type ViewRecordResponse } from '@/models/Ranking';

/**
 * 題材の閲覧を記録
 */
export const recordSubjectView = async (subjectId: number): Promise<ViewRecordResponse> => {
  const response = await apiClient.post<ViewRecordResponse>(`/views/subjects/${subjectId}`);
  return response.data;
};

/**
 * タグの閲覧を記録
 */
export const recordTagView = async (tagId: number): Promise<ViewRecordResponse> => {
  const response = await apiClient.post<ViewRecordResponse>(`/views/tags/${tagId}`);
  return response.data;
};

/**
 * 題材ランキングを取得
 */
export const getSubjectRankings = async (limit: number = 10): Promise<SubjectRanking[]> => {
  const response = await apiClient.get<SubjectRanking[]>('/rankings/subjects', {
    params: { limit },
  });
  return response.data;
};

/**
 * タグランキングを取得
 */
export const getTagRankings = async (limit: number = 10): Promise<TagRanking[]> => {
  const response = await apiClient.get<TagRanking[]>('/rankings/tags', {
    params: { limit },
  });
  return response.data;
};
