/**
 * Subjects ViewModel
 * 題材一覧のロジックを管理するViewModel
 */
import { useState, useEffect, useCallback } from 'react';
import { getAllSubjects } from '@/services/SubjectService';
import { getProgress } from '@/services/ProgressService';
import { type Subject } from '@/models/Subject';
import {
  getAllDeadlines,
  setDeadline as saveDeadline,
  removeDeadline,
  generateGoogleCalendarUrl,
  getDaysRemaining,
} from '@/utils/deadlineStorage';

interface SubjectProgress {
  [subjectId: number]: number; // progressPercentage
}

interface SubjectDeadlines {
  [subjectId: number]: string; // ISO date string
}

interface SubjectsViewModelReturn {
  subjects: Subject[];
  progress: SubjectProgress;
  deadlines: SubjectDeadlines;
  loading: boolean;
  error: string | null;
  fetchSubjects: () => Promise<void>;
  setDeadline: (subjectId: number, deadline: string) => void;
  clearDeadline: (subjectId: number) => void;
  getGoogleCalendarUrl: (subject: Subject) => string | null;
  getDaysRemaining: (subjectId: number) => number | null;
}

export const useSubjectsViewModel = (): SubjectsViewModelReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<SubjectProgress>({});
  const [deadlines, setDeadlines] = useState<SubjectDeadlines>({});
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

      // 保存済みの期限を読み込み
      setDeadlines(getAllDeadlines());
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

  const setDeadline = useCallback((subjectId: number, deadline: string) => {
    saveDeadline(subjectId, deadline);
    setDeadlines((prev) => ({ ...prev, [subjectId]: deadline }));
  }, []);

  const clearDeadline = useCallback((subjectId: number) => {
    removeDeadline(subjectId);
    setDeadlines((prev) => {
      const newDeadlines = { ...prev };
      delete newDeadlines[subjectId];
      return newDeadlines;
    });
  }, []);

  const getGoogleCalendarUrl = useCallback(
    (subject: Subject): string | null => {
      const deadline = deadlines[subject.subjectId];
      if (!deadline) return null;
      return generateGoogleCalendarUrl(subject.title, deadline, subject.description);
    },
    [deadlines]
  );

  const getDaysRemainingForSubject = useCallback(
    (subjectId: number): number | null => {
      const deadline = deadlines[subjectId];
      if (!deadline) return null;
      return getDaysRemaining(deadline);
    },
    [deadlines]
  );

  // コンポーネントマウント時に題材を取得
  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    progress,
    deadlines,
    loading,
    error,
    fetchSubjects,
    setDeadline,
    clearDeadline,
    getGoogleCalendarUrl,
    getDaysRemaining: getDaysRemainingForSubject,
  };
};
