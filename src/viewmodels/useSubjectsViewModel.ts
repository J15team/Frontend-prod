/**
 * Subjects ViewModel
 * 題材一覧のロジックを管理するViewModel
 */
import { useState, useEffect } from 'react';
import { getAllSubjects } from '@/services/SubjectService';
import { type Subject } from '@/models/Subject';

interface SubjectsViewModelReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: () => Promise<void>;
}

export const useSubjectsViewModel = (): SubjectsViewModelReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 題材一覧を取得
   */
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

  // コンポーネントマウント時に題材を取得
  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
  };
};
