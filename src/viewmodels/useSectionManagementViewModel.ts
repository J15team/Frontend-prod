/**
 * Section Management ViewModel
 * セクションのCRUDと一覧取得を管理
 */
import { useState } from 'react';
import {
  getSectionsBySubjectId,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  uploadSectionImage,
  deleteSectionImage,
} from '@/services/SubjectService';
import { type Section, type CreateSectionPayload, type UpdateSectionPayload } from '@/models/Section';

interface SectionManagementViewModelReturn {
  sections: Section[];
  loading: boolean;
  error: string | null;
  success: string | null;
  fetchSections: (subjectId: number) => Promise<void>;
  loadSectionDetail: (subjectId: number, sectionId: number) => Promise<Section | null>;
  createSectionItem: (subjectId: number, payload: CreateSectionPayload) => Promise<void>;
  updateSectionItem: (
    subjectId: number,
    sectionId: number,
    payload: UpdateSectionPayload
  ) => Promise<void>;
  deleteSectionItem: (subjectId: number, sectionId: number) => Promise<void>;
  removeSectionImage: (
    subjectId: number,
    sectionId: number,
    imageId: number
  ) => Promise<void>;
}

export const useSectionManagementViewModel = (): SectionManagementViewModelReturn => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSections = async (subjectId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSectionsBySubjectId(subjectId);
      setSections(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('セクション一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSectionDetail = async (
    subjectId: number,
    sectionId: number
  ): Promise<Section | null> => {
    setLoading(true);
    setError(null);
    try {
      const section = await getSectionById(subjectId, sectionId);
      setSections((prev) => {
        const exists = prev.some((s) => s.sectionId === section.sectionId);
        if (exists) {
          return prev.map((s) => (s.sectionId === section.sectionId ? section : s));
        }
        return [...prev, section];
      });
      return section;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('セクション詳細の取得に失敗しました');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (message: string): void => {
    setSuccess(message);
    setError(null);
  };

  const createSectionItem = async (
    subjectId: number,
    payload: CreateSectionPayload
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const created = await createSection(subjectId, payload);
      if (payload.image) {
        await uploadSectionImage(subjectId, created.sectionId, payload.image);
      }
      handleSuccess(`セクション #${created.sectionId} を作成しました`);
      await fetchSections(subjectId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('セクションの作成に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSectionItem = async (
    subjectId: number,
    sectionId: number,
    payload: UpdateSectionPayload
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateSection(subjectId, sectionId, payload);
      if (payload.image) {
        await uploadSectionImage(subjectId, sectionId, payload.image);
      }
      handleSuccess(`セクション #${updated.sectionId} を更新しました`);
      await fetchSections(subjectId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('セクションの更新に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSectionItem = async (
    subjectId: number,
    sectionId: number
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteSection(subjectId, sectionId);
      handleSuccess(`セクション #${sectionId} を削除しました`);
      await fetchSections(subjectId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('セクションの削除に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeSectionImage = async (
    subjectId: number,
    sectionId: number,
    imageId: number
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteSectionImage(subjectId, sectionId, imageId);
      handleSuccess(`セクション #${sectionId} の画像を削除しました`);
      await fetchSections(subjectId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('画像の削除に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    sections,
    loading,
    error,
    success,
    fetchSections,
    loadSectionDetail,
    createSectionItem,
    updateSectionItem,
    deleteSectionItem,
    removeSectionImage,
  };
};
