/**
 * Tag Service
 * タグ関連のAPI通信を管理
 */
import apiClient from '../apiClient';
import { type Tag, type CreateTagRequest, type TagExistsResponse } from '@/models/Tag';

/**
 * 全てのタグを取得
 */
export const getAllTags = async (search?: string): Promise<Tag[]> => {
  const params = search ? { search } : {};
  const response = await apiClient.get<Tag[]>('/tags', { params });
  return response.data;
};

/**
 * タグをIDで取得
 */
export const getTagById = async (tagId: number): Promise<Tag> => {
  const response = await apiClient.get<Tag>(`/tags/${tagId}`);
  return response.data;
};

/**
 * タグを名前で取得
 */
export const getTagByName = async (name: string): Promise<Tag> => {
  const response = await apiClient.get<Tag>(`/tags/name/${encodeURIComponent(name)}`);
  return response.data;
};

/**
 * タグの存在確認
 */
export const checkTagExists = async (name: string): Promise<TagExistsResponse> => {
  const response = await apiClient.get<TagExistsResponse>('/tags/exists', {
    params: { name },
  });
  return response.data;
};

/**
 * タグを作成
 */
export const createTag = async (payload: CreateTagRequest): Promise<Tag> => {
  const response = await apiClient.post<Tag>('/tags', payload);
  return response.data;
};

/**
 * タグを削除
 */
export const deleteTag = async (tagId: number): Promise<void> => {
  await apiClient.delete(`/tags/${tagId}`);
};

/**
 * 題材のタグ一覧を取得
 */
export const getSubjectTags = async (subjectId: number): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>(`/subjects/${subjectId}/tags`);
  return response.data;
};

/**
 * 題材にタグを付与
 */
export const addTagToSubject = async (subjectId: number, tagName: string): Promise<void> => {
  await apiClient.post(`/subjects/${subjectId}/tags`, { tagName });
};

/**
 * 題材からタグを削除
 */
export const removeTagFromSubject = async (subjectId: number, tagName: string): Promise<void> => {
  await apiClient.delete(`/subjects/${subjectId}/tags`, { data: { tagName } });
};
