/**
 * Subject Management ViewModel
 * 題材の作成・更新・削除を管理
 */
import { useEffect, useState } from 'react';
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '@/services/SubjectService';
import { type Subject, type CreateSubjectRequest, type UpdateSubjectRequest } from '@/models/Subject';

interface SubjectManagementViewModelReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  success: string | null;
  fetchSubjects: () => Promise<void>;
  createSubjectItem: (payload: CreateSubjectRequest) => Promise<void>;
  updateSubjectItem: (subjectId: number, payload: UpdateSubjectRequest) => Promise<void>;
  deleteSubjectItem: (subjectId: number) => Promise<void>;
}

export const useSubjectManagementViewModel = (): SubjectManagementViewModelReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSubjects = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('題材の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActionResult = (message: string): void => {
    setSuccess(message);
    setError(null);
  };

  const createSubjectItem = async (payload: CreateSubjectRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const created = await createSubject(payload);
      handleActionResult(`題材「${created.title}」を作成しました`);
      await fetchSubjects();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('題材の作成に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSubjectItem = async (
    subjectId: number,
    payload: UpdateSubjectRequest
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateSubject(subjectId, payload);
      handleActionResult(`題材「${updated.title}」を更新しました`);
      await fetchSubjects();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('題材の更新に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSubjectItem = async (subjectId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteSubject(subjectId);
      handleActionResult(`題材ID ${subjectId} を削除しました`);
      await fetchSubjects();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('題材の削除に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    success,
    fetchSubjects,
    createSubjectItem,
    updateSubjectItem,
    deleteSubjectItem,
  };
};
