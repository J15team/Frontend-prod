/**
 * useAssignmentsViewModel
 * 課題題材一覧ページのViewModel
 */
import { useState, useEffect, useCallback } from 'react';
import type { AssignmentSubject, AssignmentProgress } from '@/models/Assignment';
import { getAllAssignmentSubjects, getAssignmentProgress } from '@/services/assignments/AssignmentService';

// 進捗付き課題題材
export interface AssignmentSubjectWithProgress extends AssignmentSubject {
  progress?: AssignmentProgress;
}

interface UseAssignmentsViewModelReturn {
  subjects: AssignmentSubjectWithProgress[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAssignmentsViewModel = (): UseAssignmentsViewModelReturn => {
  const [subjects, setSubjects] = useState<AssignmentSubjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAssignmentSubjects();
      
      // 各題材の進捗を取得
      const subjectsWithProgress = await Promise.all(
        data.map(async (subject) => {
          try {
            const progress = await getAssignmentProgress(subject.assignmentSubjectId);
            return { ...subject, progress };
          } catch {
            // 進捗取得に失敗しても題材は表示
            return subject;
          }
        })
      );
      
      setSubjects(subjectsWithProgress);
    } catch (err) {
      console.error('課題題材の取得に失敗:', err);
      setError('課題題材の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    refresh: fetchSubjects,
  };
};
