/**
 * Subject Service
 * 題材関連のAPI通信を管理
 */
import apiClient from '../apiClient';
import { type Subject, type CreateSubjectRequest, type UpdateSubjectRequest } from '@/models/Subject';
import type {
  Section,
  CreateSectionPayload,
  UpdateSectionPayload,
  SectionImage,
} from '@/models/Section';

/**
 * 全ての題材を取得
 * @param tags タグ名の配列（AND条件でフィルタリング）
 */
export const getAllSubjects = async (tags?: string[]): Promise<Subject[]> => {
  const params = tags && tags.length > 0 ? { tags: tags.join(',') } : {};
  const response = await apiClient.get<Subject[]>('/subjects', { params });
  return response.data;
};

/**
 * 特定の題材を取得
 */
export const getSubjectById = async (subjectId: number): Promise<Subject> => {
  const response = await apiClient.get<Subject>(`/subjects/${subjectId}`);
  return response.data;
};

/**
 * 題材に属するセクション一覧を取得
 */
export const getSectionsBySubjectId = async (subjectId: number): Promise<Section[]> => {
  const response = await apiClient.get<Section[]>(`/subjects/${subjectId}/sections`);
  return response.data;
};

/**
 * 題材を作成
 */
export const createSubject = async (payload: CreateSubjectRequest): Promise<Subject> => {
  const response = await apiClient.post<Subject>('/subjects', payload);
  return response.data;
};

/**
 * 題材を更新
 */
export const updateSubject = async (
  subjectId: number,
  payload: UpdateSubjectRequest
): Promise<Subject> => {
  const response = await apiClient.put<Subject>(`/subjects/${subjectId}`, payload);
  return response.data;
};

/**
 * 題材を削除
 */
export const deleteSubject = async (subjectId: number): Promise<void> => {
  await apiClient.delete(`/subjects/${subjectId}`);
};

/**
 * セクション詳細を取得
 */
export const getSectionById = async (
  subjectId: number,
  sectionId: number
): Promise<Section> => {
  const response = await apiClient.get<Section>(`/subjects/${subjectId}/sections/${sectionId}`);
  return response.data;
};

const buildSectionFormData = (
  payload: CreateSectionPayload | UpdateSectionPayload
): FormData => {
  const formData = new FormData();
  if ('sectionId' in payload && typeof payload.sectionId === 'number') {
    formData.append('sectionId', payload.sectionId.toString());
  }
  if (payload.title !== undefined) {
    formData.append('title', payload.title);
  }
  if (payload.description !== undefined) {
    formData.append('description', payload.description);
  }

  // デバッグ: FormDataの内容を表示
  console.log('FormData contents:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
  }

  return formData;
};

/**
 * セクションを作成
 */
export const createSection = async (
  subjectId: number,
  payload: CreateSectionPayload
): Promise<Section> => {
  const response = await apiClient.post<Section>(
    `/subjects/${subjectId}/sections`,
    buildSectionFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * セクションを更新
 */
export const updateSection = async (
  subjectId: number,
  sectionId: number,
  payload: UpdateSectionPayload
): Promise<Section> => {
  const response = await apiClient.put<Section>(
    `/subjects/${subjectId}/sections/${sectionId}`,
    buildSectionFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * セクションを削除
 */
export const deleteSection = async (
  subjectId: number,
  sectionId: number
): Promise<void> => {
  await apiClient.delete(`/subjects/${subjectId}/sections/${sectionId}`);
};

/**
 * セクションに画像をアップロード
 */
export const uploadSectionImage = async (
  subjectId: number,
  sectionId: number,
  imageFile: File
): Promise<SectionImage> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await apiClient.post<SectionImage>(
    `/subjects/${subjectId}/sections/${sectionId}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * セクション画像を削除
 */
export const deleteSectionImage = async (
  subjectId: number,
  sectionId: number,
  imageId: number
): Promise<void> => {
  await apiClient.delete(
    `/subjects/${subjectId}/sections/${sectionId}/images/${imageId}`
  );
};
