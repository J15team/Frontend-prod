/**
 * Subjects ViewModel
 * 題材一覧のロジックを管理するViewModel
 */
import { useState, useEffect } from 'react';
import { getAllSubjects } from '@/services/SubjectService';
import { getProgress } from '@/services/ProgressService';
import { type Subject } from '@/models/Subject';

interface SubjectProgress {
  [subjectId: number]: number; // progressPercentage
}

interface SubjectsViewModelReturn {
  subjects: Subject[];
  progress: SubjectProgress;
  loading: boolean;
  error: string | null;
  fetchSubjects: () => Promise<void>;
}

export const useSubjectsViewModel = (): SubjectsViewModelReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<SubjectProgress>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 題材一覧と進捗を取得
   */
  const fetchSubjects = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSubjects();
      setSubjects(data);

      // 各題材の進捗を取得
      const progressMap: SubjectProgress = {};
      await Promise.all(
        data.map(async (subject) => {
          try {
            const progressData = await getProgress(subject.subjectId);
            progressMap[subject.subjectId] = progressData.progressPercentage;
          } catch {
            progressMap[subject.subjectId] = 0;
          }
        })
      );
      setProgress(progressMap);
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
    progress,
    loading,
    error,
    fetchSubjects,
  };
};
